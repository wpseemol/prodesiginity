import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import prisma from "../lib/prisma.js";
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
} from "../lib/zod/team.js";
import {
  publicTeamUploadPath,
  TEAM_UPLOAD_ROOT,
  UPLOADS_ROOT,
} from "../lib/uploads.js";
import type { AuthRequest } from "../middleware/auth.js";

const teamSelect = {
  id: true,
  slug: true,
  name: true,
  role: true,
  tagline: true,
  email: true,
  photoUrl: true,
  photoAlt: true,
  photoTitle: true,
  isLead: true,
  sortOrder: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      username: true,
      email: true,
    },
  },
} as const;

function mapAdminMember(
  row: {
    id: number;
    slug: string;
    name: string;
    role: string;
    tagline: string | null;
    email: string | null;
    photoUrl: string;
    photoAlt: string | null;
    photoTitle: string | null;
    isLead: boolean;
    sortOrder: number;
    userId: number | null;
    createdAt: Date;
    updatedAt: Date;
    user: { username: string; email: string } | null;
  },
) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    tagline: row.tagline,
    email: row.email ?? row.user?.email ?? null,
    username: row.user?.username ?? null,
    photoUrl: row.photoUrl,
    photoAlt: row.photoAlt,
    photoTitle: row.photoTitle,
    isLead: row.isLead,
    sortOrder: row.sortOrder,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function staffEmailFromUsername(username: string) {
  return `${username}@staff.prodesignity.com`;
}

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

async function uniqueUsername(base: string) {
  let candidate = base.slice(0, 30);
  for (let i = 0; i < 12; i += 1) {
    const taken = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
    const suffix = (i + 1).toString(36);
    candidate = `${base.slice(0, Math.max(3, 30 - suffix.length - 1))}-${suffix}`;
  }
  return `u${Date.now().toString(36)}`.slice(0, 30);
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
    return res.status(200).json({ members: rows.map(mapAdminMember) });
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

    const username = await uniqueUsername(parsed.data.username);
    const email =
      parsed.data.email ?? staffEmailFromUsername(username);

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true, email: true, username: true },
    });
    if (existingUser) {
      return res.status(409).json({
        message:
          existingUser.username === username
            ? "Username is already taken"
            : "Email is already registered",
      });
    }

    const existingEmailOnTeam = await prisma.teamMember.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingEmailOnTeam) {
      return res.status(409).json({
        message: "A team member with this login already exists",
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

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    const member = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: parsed.data.name,
          username,
          email,
          password: hashedPassword,
          role: "employer",
        },
        select: { id: true, username: true, email: true },
      });

      const created = await tx.teamMember.create({
        data: {
          slug,
          name: parsed.data.name,
          role: parsed.data.role,
          tagline: parsed.data.tagline || null,
          email,
          photoUrl,
          photoAlt,
          photoTitle,
          isLead: parsed.data.isLead ?? false,
          sortOrder:
            parsed.data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
          userId: user.id,
        },
        select: teamSelect,
      });

      return mapAdminMember(created);
    });

    return res.status(201).json({
      message: "Team member added with staff login",
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

    const nextUsername = parsed.data.username;
    const nextEmail =
      parsed.data.email?.trim() ||
      (nextUsername ? staffEmailFromUsername(nextUsername) : undefined);

    if (nextUsername && existing.userId) {
      const usernameTaken = await prisma.user.findFirst({
        where: { username: nextUsername, id: { not: existing.userId } },
        select: { id: true },
      });
      if (usernameTaken) {
        return res.status(409).json({ message: "Username is already taken" });
      }
    }

    if (nextEmail && nextEmail !== existing.email) {
      const emailTaken = await prisma.teamMember.findFirst({
        where: { email: nextEmail, id: { not: id } },
        select: { id: true },
      });
      if (emailTaken) {
        return res.status(409).json({
          message: "A team member with this login already exists",
        });
      }
      const userEmailTaken = await prisma.user.findFirst({
        where: {
          email: nextEmail,
          ...(existing.userId ? { id: { not: existing.userId } } : {}),
        },
        select: { id: true },
      });
      if (userEmailTaken) {
        return res.status(409).json({ message: "Email is already registered" });
      }
    }

    const memberRow = await prisma.$transaction(async (tx) => {
      let linkedUserId = existing.userId;

      if (
        existing.userId &&
        (nextEmail ||
          nextUsername ||
          parsed.data.password ||
          parsed.data.name)
      ) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            ...(parsed.data.name !== undefined
              ? { fullName: parsed.data.name }
              : {}),
            ...(nextUsername ? { username: nextUsername } : {}),
            ...(nextEmail ? { email: nextEmail } : {}),
            ...(parsed.data.password
              ? { password: await bcrypt.hash(parsed.data.password, 10) }
              : {}),
          },
        });
      } else if (!existing.userId && nextUsername && parsed.data.password) {
        // Backfill staff login for older roster rows that had no account.
        const username = await uniqueUsername(nextUsername);
        const email = nextEmail ?? staffEmailFromUsername(username);
        const user = await tx.user.create({
          data: {
            fullName: parsed.data.name ?? existing.name,
            username,
            email,
            password: await bcrypt.hash(parsed.data.password, 10),
            role: "employer",
          },
          select: { id: true },
        });
        linkedUserId = user.id;
      }

      return tx.teamMember.update({
        where: { id },
        data: {
          ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
          ...(parsed.data.role !== undefined ? { role: parsed.data.role } : {}),
          ...(parsed.data.tagline !== undefined
            ? { tagline: parsed.data.tagline || null }
            : {}),
          ...(nextEmail ? { email: nextEmail } : {}),
          ...(linkedUserId !== existing.userId
            ? { userId: linkedUserId }
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
    });

    const member = mapAdminMember(memberRow);

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

    await prisma.$transaction(async (tx) => {
      await tx.teamMember.delete({ where: { id } });
      if (existing.userId) {
        const linked = await tx.user.findUnique({
          where: { id: existing.userId },
          select: { id: true, role: true },
        });
        // Only remove employer accounts created for this roster profile.
        if (linked?.role === "employer") {
          await tx.user.delete({ where: { id: linked.id } });
        }
      }
    });

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
