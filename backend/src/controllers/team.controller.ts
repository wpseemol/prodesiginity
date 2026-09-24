import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import prisma from "../lib/prisma";
import { createTeamMemberSchema, updateTeamMemberSchema } from "../lib/zod/team";
import {
  publicTeamUploadPath,
  TEAM_UPLOAD_ROOT,
  UPLOADS_ROOT,
} from "../lib/uploads";
import type { AuthRequest } from "../middleware/auth";

const teamSelect = {
  id: true,
  slug: true,
  name: true,
  role: true,
  tagline: true,
  photoUrl: true,
  photoAlt: true,
  photoTitle: true,
  isLead: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function defaultPhotoAlt(name: string, role: string) {
  return `${name}, ${role}`;
}

function defaultPhotoTitle(name: string) {
  return name;
}

/** Shape used by the marketing site (homepage + our-service). */
function toPublicMember(row: {
  id: number;
  slug: string;
  name: string;
  role: string;
  tagline: string | null;
  photoUrl: string;
  photoAlt: string | null;
  photoTitle: string | null;
  isLead: boolean;
  sortOrder: number;
}) {
  return {
    id: row.slug,
    dbId: row.id,
    name: row.name,
    role: row.role,
    tagline: row.tagline ?? undefined,
    photo: row.photoUrl,
    photoAlt: row.photoAlt || defaultPhotoAlt(row.name, row.role),
    photoTitle: row.photoTitle || defaultPhotoTitle(row.name),
    lead: row.isLead,
    sortOrder: row.sortOrder,
  };
}

/**
 * GET /api/team
 * Public roster for the frontend (server-side fetch).
 */
export const listPublicTeam = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.teamMember.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: teamSelect,
    });
    return res.status(200).json({
      members: rows.map(toPublicMember),
    });
  } catch (error) {
    console.error("List public team error:", error);
    return res.status(500).json({ message: "Failed to load team members" });
  }
};

/** Admin list. */
export const listTeamMembers = async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.teamMember.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: teamSelect,
    });
    return res.status(200).json({ members: rows });
  } catch (error) {
    console.error("List team members error:", error);
    return res.status(500).json({ message: "Failed to load team members" });
  }
};

export const createTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createTeamMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid team member data",
      });
    }

    const file = req.file;
    const photoUrl = file
      ? publicTeamUploadPath(file.filename)
      : parsed.data.photoUrl?.trim();

    if (!photoUrl) {
      return res.status(400).json({
        message: "Photo file or photoUrl is required",
      });
    }

    let slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
    if (!slug) slug = `member-${Date.now()}`;

    const existing = await prisma.teamMember.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    if (parsed.data.isLead) {
      await prisma.teamMember.updateMany({ data: { isLead: false } });
    }

    const maxSort = await prisma.teamMember.aggregate({
      _max: { sortOrder: true },
    });

    const photoAlt =
      parsed.data.photoAlt?.trim() ||
      defaultPhotoAlt(parsed.data.name, parsed.data.role);
    const photoTitle =
      parsed.data.photoTitle?.trim() || defaultPhotoTitle(parsed.data.name);

    const member = await prisma.teamMember.create({
      data: {
        slug,
        name: parsed.data.name,
        role: parsed.data.role,
        tagline: parsed.data.tagline || null,
        photoUrl,
        photoAlt,
        photoTitle,
        isLead: parsed.data.isLead ?? false,
        sortOrder:
          parsed.data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
      },
      select: teamSelect,
    });

    return res.status(201).json({
      message: "Team member added",
      member,
    });
  } catch (error) {
    console.error("Create team member error:", error);
    return res.status(500).json({ message: "Failed to add team member" });
  }
};

export const updateTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid team member id" });
    }

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Team member not found" });
    }

    const parsed = updateTeamMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid team member data",
      });
    }

    const file = req.file;
    const nextPhotoUrl = file
      ? publicTeamUploadPath(file.filename)
      : parsed.data.photoUrl?.trim();

    const nextIsLead =
      parsed.data.isLead !== undefined ? parsed.data.isLead : existing.isLead;

    if (nextIsLead && !existing.isLead) {
      await prisma.teamMember.updateMany({
        where: { id: { not: id } },
        data: { isLead: false },
      });
    }

    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.role !== undefined ? { role: parsed.data.role } : {}),
        ...(parsed.data.tagline !== undefined
          ? { tagline: parsed.data.tagline || null }
          : {}),
        ...(nextPhotoUrl ? { photoUrl: nextPhotoUrl } : {}),
        ...(parsed.data.photoAlt !== undefined
          ? { photoAlt: parsed.data.photoAlt || null }
          : {}),
        ...(parsed.data.photoTitle !== undefined
          ? { photoTitle: parsed.data.photoTitle || null }
          : {}),
        ...(parsed.data.isLead !== undefined
          ? { isLead: parsed.data.isLead }
          : {}),
        ...(parsed.data.sortOrder !== undefined
          ? { sortOrder: parsed.data.sortOrder }
          : {}),
      },
      select: teamSelect,
    });

    if (
      file &&
      existing.photoUrl.startsWith("/uploads/team/") &&
      existing.photoUrl !== member.photoUrl
    ) {
      const filename = path.basename(existing.photoUrl);
      const full = path.join(TEAM_UPLOAD_ROOT, filename);
      if (full.startsWith(UPLOADS_ROOT)) {
        fs.promises.unlink(full).catch(() => undefined);
      }
    }

    return res.status(200).json({
      message: "Team member updated",
      member,
    });
  } catch (error) {
    console.error("Update team member error:", error);
    return res.status(500).json({ message: "Failed to update team member" });
  }
};

export const deleteTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid team member id" });
    }

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Team member not found" });
    }

    await prisma.teamMember.delete({ where: { id } });

    if (existing.photoUrl.startsWith("/uploads/team/")) {
      const filename = path.basename(existing.photoUrl);
      const full = path.join(TEAM_UPLOAD_ROOT, filename);
      if (full.startsWith(UPLOADS_ROOT)) {
        fs.promises.unlink(full).catch(() => undefined);
      }
    }

    return res.status(200).json({ message: "Team member deleted" });
  } catch (error) {
    console.error("Delete team member error:", error);
    return res.status(500).json({ message: "Failed to delete team member" });
  }
};

export function teamUploadErrorHandler(
  err: unknown,
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!err) return next();
  if (err instanceof Error) {
    if ((err as { code?: string }).code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image must be 5 MB or smaller" });
    }
    return res.status(400).json({ message: err.message || "Upload failed" });
  }
  return res.status(400).json({ message: "Upload failed" });
}
