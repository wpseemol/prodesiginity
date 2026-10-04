import fs from "fs";
import path from "path";
import { Response } from "express";
import prisma from "../lib/prisma.js";
import { AVATAR_UPLOAD_ROOT, publicAvatarUploadPath } from "../lib/uploads.js";
import {
  MAX_AVATAR_PRESETS,
  avatarPresetLabelSchema,
  chooseAvatarSchema,
  reorderAvatarPresetsSchema,
} from "../lib/zod/avatars.js";
import type { AuthRequest } from "../middleware/auth.js";
import { publicUserSelect } from "./photo.controller.js";

const presetSelect = { id: true, url: true, label: true, sortOrder: true } as const;

function listPresets() {
  return prisma.avatarPreset.findMany({
    select: presetSelect,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}

function removeUploadedFile(url: string) {
  if (!url.startsWith("/uploads/avatars/")) return;
  fs.promises
    .unlink(path.join(AVATAR_UPLOAD_ROOT, path.basename(url)))
    .catch(() => undefined);
}

function parseId(raw: unknown) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** GET /api/auth/avatar-presets — the choices shown to a signed-in user. */
export const getAvatarPresets = async (_req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json({ presets: await listPresets() });
  } catch (error) {
    console.error("List avatar presets error:", error);
    return res.status(500).json({ message: "Could not load avatars" });
  }
};

/** PUT /api/auth/me/avatar — pick a preset (or `null` to stop using one). */
export const chooseAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const parsed = chooseAvatarSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Choose a valid avatar" });
    }
    const { presetId } = parsed.data;

    if (presetId !== null) {
      const exists = await prisma.avatarPreset.findUnique({
        where: { id: presetId },
        select: { id: true },
      });
      if (!exists) {
        return res.status(404).json({ message: "That avatar is no longer available" });
      }
    }

    // A preset replaces the active uploaded photo; uploads stay in the library.
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data:
        presetId === null
          ? { avatarPresetId: null }
          : { avatarPresetId: presetId, photoId: null },
      select: publicUserSelect,
    });

    return res.status(200).json({ message: "Profile picture updated", user });
  } catch (error) {
    console.error("Choose avatar error:", error);
    return res.status(500).json({ message: "Could not update your profile picture" });
  }
};

/** GET /api/admin/avatar-presets */
export const listAdminAvatarPresets = async (_req: AuthRequest, res: Response) => {
  try {
    const presets = await prisma.avatarPreset.findMany({
      select: { ...presetSelect, _count: { select: { users: true } } },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    const teamUses = await prisma.teamMember.groupBy({
      by: ["avatarUrl"],
      where: { avatarUrl: { in: presets.map((preset) => preset.url) } },
      _count: { _all: true },
    });
    const teamCount = new Map(teamUses.map((row) => [row.avatarUrl, row._count._all]));
    return res.status(200).json({
      max: MAX_AVATAR_PRESETS,
      presets: presets.map(({ _count, ...preset }) => ({
        ...preset,
        usedBy: _count.users + (teamCount.get(preset.url) ?? 0),
      })),
    });
  } catch (error) {
    console.error("Admin list avatar presets error:", error);
    return res.status(500).json({ message: "Could not load avatars" });
  }
};

/** POST /api/admin/avatar-presets — multipart field `image`, optional `label`. */
export const createAvatarPreset = async (req: AuthRequest, res: Response) => {
  const file = req.file;
  try {
    if (!file) {
      return res.status(400).json({ message: "Choose an image to upload" });
    }

    const url = publicAvatarUploadPath(file.filename);
    const count = await prisma.avatarPreset.count();
    if (count >= MAX_AVATAR_PRESETS) {
      removeUploadedFile(url);
      return res.status(409).json({
        message: `You can have up to ${MAX_AVATAR_PRESETS} avatars. Delete one to add another.`,
      });
    }

    const label =
      typeof req.body?.label === "string" && req.body.label.trim()
        ? req.body.label.trim().slice(0, 80)
        : null;
    const last = await prisma.avatarPreset.aggregate({ _max: { sortOrder: true } });

    const preset = await prisma.avatarPreset.create({
      data: { url, label, sortOrder: (last._max.sortOrder ?? 0) + 1 },
      select: presetSelect,
    });
    return res.status(201).json({ message: "Avatar added", preset: { ...preset, usedBy: 0 } });
  } catch (error) {
    if (file) removeUploadedFile(publicAvatarUploadPath(file.filename));
    console.error("Create avatar preset error:", error);
    return res.status(500).json({ message: "Could not add the avatar" });
  }
};

/** PATCH /api/admin/avatar-presets/:id — rename. */
export const updateAvatarPreset = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const parsed = avatarPresetLabelSchema.safeParse(req.body);
    if (!id || !parsed.success) {
      return res.status(400).json({ message: "Invalid avatar" });
    }
    const exists = await prisma.avatarPreset.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return res.status(404).json({ message: "Avatar not found" });

    const preset = await prisma.avatarPreset.update({
      where: { id },
      data: { label: parsed.data.label || null },
      select: presetSelect,
    });
    return res.status(200).json({ message: "Avatar updated", preset });
  } catch (error) {
    console.error("Update avatar preset error:", error);
    return res.status(500).json({ message: "Could not update the avatar" });
  }
};

/** PUT /api/admin/avatar-presets/order — body `{ ids }` in display order. */
export const reorderAvatarPresets = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = reorderAvatarPresetsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid order" });
    }
    await prisma.$transaction(
      parsed.data.ids.map((id, index) =>
        prisma.avatarPreset.updateMany({ where: { id }, data: { sortOrder: index + 1 } }),
      ),
    );
    return res.status(200).json({ message: "Order saved", presets: await listPresets() });
  } catch (error) {
    console.error("Reorder avatar presets error:", error);
    return res.status(500).json({ message: "Could not save the order" });
  }
};

/**
 * DELETE /api/admin/avatar-presets/:id — users and team profiles that picked
 * it fall back to their photo (then initials).
 */
export const deleteAvatarPreset = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid avatar" });

    const preset = await prisma.avatarPreset.findUnique({
      where: { id },
      select: { id: true, url: true },
    });
    if (!preset) return res.status(404).json({ message: "Avatar not found" });

    await prisma.$transaction([
      prisma.teamMember.updateMany({
        where: { avatarUrl: preset.url },
        data: { avatarUrl: null },
      }),
      prisma.avatarPreset.delete({ where: { id } }),
    ]);
    removeUploadedFile(preset.url);
    return res.status(200).json({ message: "Avatar deleted" });
  } catch (error) {
    console.error("Delete avatar preset error:", error);
    return res.status(500).json({ message: "Could not delete the avatar" });
  }
};
