import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import type { Prisma } from "@prisma/client";
import multer from "multer";
import prisma from "../lib/prisma.js";
import {
  HOMEPAGE_UPLOAD_ROOT,
  publicHomepageUploadPath,
} from "../lib/uploads.js";
import {
  homepageSectionKeySchema,
  updateHomepageSectionSchema,
  validateHomepageSectionContent,
  homepageLogoFileSchema,
  homepageImageFileSchema,
  homepageVideoFileSchema,
  LOGO_MAX_BYTES,
  IMAGE_MAX_BYTES,
  HOMEPAGE_SECTION_KEYS,
  LOGO_REC_WIDTH,
  LOGO_REC_HEIGHT,
} from "../lib/zod/homepage.js";
import type { AuthRequest } from "../middleware/auth.js";

function sectionsToMap(
  rows: { key: string; label: string; content: unknown; updatedAt: Date }[],
) {
  const sections: Record<
    string,
    { label: string; content: unknown; updatedAt: string }
  > = {};

  for (const row of rows) {
    sections[row.key] = {
      label: row.label,
      content: row.content,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  return sections;
}

function unlinkUpload(filename: string) {
  const full = path.join(HOMEPAGE_UPLOAD_ROOT, filename);
  if (full.startsWith(HOMEPAGE_UPLOAD_ROOT)) {
    fs.promises.unlink(full).catch(() => undefined);
  }
}

/** Public: full homepage payload for the marketing site. */
export const getHomepage = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.homePageSection.findMany({
      where: { key: { in: [...HOMEPAGE_SECTION_KEYS] } },
      orderBy: { key: "asc" },
    });

    return res.status(200).json({ sections: sectionsToMap(rows) });
  } catch (error) {
    console.error("Get homepage error:", error);
    return res.status(500).json({ message: "Failed to load homepage content" });
  }
};

/** Public: one section by key. */
export const getHomepageSection = async (req: Request, res: Response) => {
  try {
    const keyResult = homepageSectionKeySchema.safeParse(req.params.key);
    if (!keyResult.success) {
      return res.status(400).json({ message: "Unknown homepage section key" });
    }

    const row = await prisma.homePageSection.findUnique({
      where: { key: keyResult.data },
    });

    if (!row) {
      return res.status(404).json({ message: "Section not found" });
    }

    return res.status(200).json({
      key: row.key,
      label: row.label,
      content: row.content,
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Get homepage section error:", error);
    return res.status(500).json({ message: "Failed to load section" });
  }
};

/** Admin: list all sections (same shape as public, plus keys). */
export const listHomepageSections = async (
  _req: AuthRequest,
  res: Response,
) => {
  try {
    const rows = await prisma.homePageSection.findMany({
      orderBy: { key: "asc" },
    });

    return res.status(200).json({
      keys: HOMEPAGE_SECTION_KEYS,
      sections: sectionsToMap(rows),
    });
  } catch (error) {
    console.error("List homepage sections error:", error);
    return res.status(500).json({ message: "Failed to load homepage sections" });
  }
};

/** Admin: replace one section's JSON content. */
export const updateHomepageSection = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const keyResult = homepageSectionKeySchema.safeParse(req.params.key);
    if (!keyResult.success) {
      return res.status(400).json({ message: "Unknown homepage section key" });
    }

    const bodyResult = updateHomepageSectionSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        message:
          bodyResult.error.issues[0]?.message || "Invalid section payload",
      });
    }

    const contentResult = validateHomepageSectionContent(
      keyResult.data,
      bodyResult.data.content,
    );
    if (!contentResult.success) {
      return res.status(400).json({
        message:
          contentResult.error.issues[0]?.message || "Invalid section content",
      });
    }

    const existing = await prisma.homePageSection.findUnique({
      where: { key: keyResult.data },
    });

    if (!existing) {
      return res.status(404).json({ message: "Section not found" });
    }

    const updated = await prisma.homePageSection.update({
      where: { key: keyResult.data },
      data: {
        content: contentResult.data as Prisma.InputJsonValue,
        ...(bodyResult.data.label ? { label: bodyResult.data.label } : {}),
      },
    });

    return res.status(200).json({
      message: "Homepage section updated",
      key: updated.key,
      label: updated.label,
      content: updated.content,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Update homepage section error:", error);
    return res.status(500).json({ message: "Failed to update section" });
  }
};

/** Admin: brand logo upload — Zod-validated, max 1 MB. */
export const uploadHomepageLogo = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No logo file uploaded" });
    }

    const parsed = homepageLogoFileSchema.safeParse({
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
      filename: file.filename,
    });

    if (!parsed.success) {
      unlinkUpload(file.filename);
      return res.status(400).json({
        message:
          parsed.error.issues[0]?.message ||
          `Logo must be PNG/WebP/JPEG/GIF, max 1 MB (best ${LOGO_REC_WIDTH}×${LOGO_REC_HEIGHT}px)`,
      });
    }

    const url = publicHomepageUploadPath(parsed.data.filename);

    return res.status(201).json({
      message: "Logo uploaded",
      url,
      kind: "logo" as const,
      filename: parsed.data.filename,
      mimeType: parsed.data.mimetype,
      size: parsed.data.size,
      limits: {
        maxBytes: LOGO_MAX_BYTES,
        recommendedWidth: LOGO_REC_WIDTH,
        recommendedHeight: LOGO_REC_HEIGHT,
      },
    });
  } catch (error) {
    console.error("Upload homepage logo error:", error);
    return res.status(500).json({ message: "Failed to upload logo" });
  }
};

/** Admin: upload an image or video for homepage CMS fields. */
export const uploadHomepageMedia = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const isVideo = file.mimetype.startsWith("video/");
    const parsed = isVideo
      ? homepageVideoFileSchema.safeParse({
          mimetype: file.mimetype,
          size: file.size,
          originalname: file.originalname,
          filename: file.filename,
        })
      : homepageImageFileSchema.safeParse({
          mimetype: file.mimetype,
          size: file.size,
          originalname: file.originalname,
          filename: file.filename,
        });

    if (!parsed.success) {
      unlinkUpload(file.filename);
      return res.status(400).json({
        message:
          parsed.error.issues[0]?.message ||
          (isVideo
            ? "Invalid video (MP4/WebM/MOV, max 120 MB)"
            : `Invalid image (max ${IMAGE_MAX_BYTES / (1024 * 1024)} MB)`),
      });
    }

    const url = publicHomepageUploadPath(parsed.data.filename);
    const kind = isVideo ? "video" : "image";

    return res.status(201).json({
      message: "Media uploaded",
      url,
      kind,
      filename: parsed.data.filename,
      mimeType: parsed.data.mimetype,
      size: parsed.data.size,
    });
  } catch (error) {
    console.error("Upload homepage media error:", error);
    return res.status(500).json({ message: "Failed to upload media" });
  }
};

export function homepageUploadErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message:
          "File too large — logos max 1 MB; images max 5 MB; videos max 120 MB",
      });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof Error) {
    return res.status(400).json({ message: err.message });
  }
  return next(err);
}
