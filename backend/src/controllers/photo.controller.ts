import { Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { publicUploadPath } from "../lib/uploads";
import type { AuthRequest } from "../middleware/auth";

export const photoSelect = {
  id: true,
  url: true,
  altText: true,
  description: true,
  createdAt: true,
} as const;

export const publicUserSelect = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  role: true,
  created_at: true,
  photo: {
    select: photoSelect,
  },
} as const;

export const uploadProfilePhoto = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Photo file is required." });
    }

    const url = publicUploadPath(req.user.userId, file.filename);
    const altText =
      typeof req.body?.altText === "string" && req.body.altText.trim()
        ? req.body.altText.trim()
        : `${req.user.username} profile photo`;

    const photo = await prisma.photo.create({
      data: {
        url,
        altText,
        ownerId: req.user.userId,
      },
      select: photoSelect,
    });

    // Keep previous image files + Photo rows; only switch the active profile photo.
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { photoId: photo.id },
      select: publicUserSelect,
    });

    return res.status(201).json({
      message: "Profile photo updated",
      photo,
      user,
    });
  } catch (error) {
    console.error("Upload profile photo error:", error);
    return res.status(500).json({ message: "Could not upload photo" });
  }
};

export const listMyPhotos = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const [photos, me] = await Promise.all([
      prisma.photo.findMany({
        where: { ownerId: req.user.userId },
        select: photoSelect,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { photoId: true },
      }),
    ]);

    return res.status(200).json({
      photos,
      activePhotoId: me?.photoId ?? null,
    });
  } catch (error) {
    console.error("List photos error:", error);
    return res.status(500).json({ message: "Could not load photos" });
  }
};

export const setActivePhoto = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const photoId = Number(req.params.photoId);
    if (!Number.isInteger(photoId) || photoId < 1) {
      return res.status(400).json({ message: "Invalid photo id" });
    }

    const photo = await prisma.photo.findFirst({
      where: { id: photoId, ownerId: req.user.userId },
      select: photoSelect,
    });

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { photoId: photo.id },
      select: publicUserSelect,
    });

    return res.status(200).json({
      message: "Active profile photo updated",
      photo,
      user,
    });
  } catch (error) {
    console.error("Set active photo error:", error);
    return res.status(500).json({ message: "Could not update active photo" });
  }
};

/** Multer / upload error responses */
export function uploadErrorHandler(
  err: unknown,
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!err) return next();

  if (err instanceof Error) {
    if (err.message.includes("Only JPEG")) {
      return res.status(400).json({ message: err.message });
    }
    if ((err as { code?: string }).code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image must be 5 MB or smaller" });
    }
    return res.status(400).json({ message: err.message || "Upload failed" });
  }

  return res.status(400).json({ message: "Upload failed" });
}
