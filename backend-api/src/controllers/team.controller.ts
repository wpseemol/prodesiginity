import { Request, Response, NextFunction } from "express";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import prisma from "../lib/prisma.js";
import { revokeAllUserRefreshTokens } from "../lib/tokens.js";
import {
  createTeamMemberSchema,
  updateMyTeamProfileSchema,
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
  description: true,
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
      id: true,
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
    description: string | null;
    email: string | null;
    photoUrl: string;
    photoAlt: string | null;
    photoTitle: string | null;
    isLead: boolean;
    sortOrder: number;
    userId: number | null;
    createdAt: Date;
    updatedAt: Date;
    user: { id: number; username: string; email: string } | null;
  },
) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    tagline: row.tagline,
    description: row.description,
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

/** Team lead → dashboard admin; everyone else on the roster → employer. */
function accountRoleForLead(isLead: boolean): "admin" | "employer" {
  return isLead ? "admin" : "employer";
}

type Tx = Prisma.TransactionClient;

/** Clear other leads and demote their linked logins to employer. */
async function demoteOtherLeads(tx: Tx, exceptMemberId?: number) {
  const previous = await tx.teamMember.findMany({
    where: {
      isLead: true,
      ...(exceptMemberId ? { id: { not: exceptMemberId } } : {}),
    },
    select: { userId: true },
  });
  for (const row of previous) {
    if (row.userId) {
      await tx.user.update({
        where: { id: row.userId },
        data: { role: "employer" },
      });
    }
  }
  await tx.teamMember.updateMany({
    where: {
      isLead: true,
      ...(exceptMemberId ? { id: { not: exceptMemberId } } : {}),
    },
    data: { isLead: false },
  });
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
  description: string | null;
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
    description: row.description ?? undefined,
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
        message: "Photo is required",
      });
    }

    const username = await uniqueUsername(parsed.data.username);
    const email = staffEmailFromUsername(username);
    const role = parsed.data.role.trim();

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true, username: true },
    });
    if (existingUser) {
      return res.status(409).json({
        message:
          existingUser.username === username
            ? "Username is already taken"
            : "Login already exists for this username",
      });
    }

    let slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
    if (!slug) slug = `member-${Date.now()}`;

    const existing = await prisma.teamMember.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const isLead = parsed.data.isLead ?? false;

    const maxSort = await prisma.teamMember.aggregate({
      _max: { sortOrder: true },
    });

    const photoAlt =
      parsed.data.photoAlt?.trim() || defaultPhotoAlt(parsed.data.name, role);
    const photoTitle =
      parsed.data.photoTitle?.trim() || defaultPhotoTitle(parsed.data.name);

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    const member = await prisma.$transaction(async (tx) => {
      if (isLead) {
        await demoteOtherLeads(tx);
      }

      const user = await tx.user.create({
        data: {
          fullName: parsed.data.name,
          username,
          email,
          password: hashedPassword,
          role: accountRoleForLead(isLead),
        },
        select: { id: true },
      });

      const created = await tx.teamMember.create({
        data: {
          slug,
          name: parsed.data.name,
          role,
          tagline: parsed.data.tagline || null,
          description: parsed.data.description || null,
          email,
          photoUrl,
          photoAlt,
          photoTitle,
          isLead,
          sortOrder:
            parsed.data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
          userId: user.id,
        },
        select: teamSelect,
      });

      return mapAdminMember(created);
    });

    return res.status(201).json({
      message: "Team member and staff login created",
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
    const leadChanged = nextIsLead !== existing.isLead;

    const nextUsername = parsed.data.username;
    if (nextUsername && existing.userId) {
      const usernameTaken = await prisma.user.findFirst({
        where: { username: nextUsername, id: { not: existing.userId } },
        select: { id: true },
      });
      if (usernameTaken) {
        return res.status(409).json({ message: "Username is already taken" });
      }
    }

    if (parsed.data.password && existing.userId) {
      const adminId = req.user?.userId;
      if (!adminId) {
        return res.status(401).json({ message: "Authentication required." });
      }
      if (!parsed.data.currentPassword) {
        return res.status(400).json({
          message:
            "Enter your admin password to confirm changing this staff password",
        });
      }
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { id: true, password: true },
      });
      if (!admin) {
        return res.status(401).json({ message: "Authentication required." });
      }
      const ok = await bcrypt.compare(
        parsed.data.currentPassword,
        admin.password,
      );
      if (!ok) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }
    }

    const memberRow = await prisma.$transaction(async (tx) => {
      if (nextIsLead && !existing.isLead) {
        await demoteOtherLeads(tx, id);
      }

      let linkedUserId = existing.userId;

      if (
        existing.userId &&
        (nextUsername ||
          parsed.data.password ||
          parsed.data.name ||
          leadChanged)
      ) {
        const nextEmail = nextUsername
          ? staffEmailFromUsername(nextUsername)
          : undefined;
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
            ...(leadChanged
              ? { role: accountRoleForLead(nextIsLead) }
              : {}),
          },
        });
      } else if (!existing.userId && nextUsername && parsed.data.password) {
        const username = await uniqueUsername(nextUsername);
        const email = staffEmailFromUsername(username);
        const user = await tx.user.create({
          data: {
            fullName: parsed.data.name ?? existing.name,
            username,
            email,
            password: await bcrypt.hash(parsed.data.password, 10),
            role: accountRoleForLead(nextIsLead),
          },
          select: { id: true },
        });
        linkedUserId = user.id;
      }

      const nextEmailForMember = nextUsername
        ? staffEmailFromUsername(nextUsername)
        : undefined;

      return tx.teamMember.update({
        where: { id },
        data: {
          ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
          ...(parsed.data.role !== undefined ? { role: parsed.data.role } : {}),
          ...(parsed.data.tagline !== undefined
            ? { tagline: parsed.data.tagline || null }
            : {}),
          ...(parsed.data.description !== undefined
            ? { description: parsed.data.description || null }
            : {}),
          ...(nextEmailForMember ? { email: nextEmailForMember } : {}),
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

    if (parsed.data.password && existing.userId) {
      await revokeAllUserRefreshTokens(existing.userId);
    }

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

/** Staff: load own public team profile (linked via userId). */
export const getMyTeamProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const row = await prisma.teamMember.findFirst({
      where: { userId },
      select: teamSelect,
    });

    if (!row) {
      return res.status(404).json({
        message:
          "No team profile is linked to this login. Ask an admin to add you on Team members.",
      });
    }

    return res.status(200).json({ member: mapAdminMember(row) });
  } catch (error) {
    console.error("Get my team profile error:", error);
    return res.status(500).json({ message: "Failed to load your team profile" });
  }
};

/** Staff: update own public profile (name, description, photo). Designation is admin-only. */
export const updateMyTeamProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const existing = await prisma.teamMember.findFirst({
      where: { userId },
    });
    if (!existing) {
      return res.status(404).json({
        message:
          "No team profile is linked to this login. Ask an admin to add you on Team members.",
      });
    }

    if (
      req.body?.role !== undefined &&
      String(req.body.role).trim() !== "" &&
      String(req.body.role).trim() !== existing.role
    ) {
      return res.status(403).json({
        message: "Only an admin can change your designation.",
      });
    }

    const parsed = updateMyTeamProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid profile data",
      });
    }

    const file = req.file;
    const nextPhotoUrl = file
      ? publicTeamUploadPath(file.filename)
      : undefined;

    const memberRow = await prisma.$transaction(async (tx) => {
      if (parsed.data.name) {
        await tx.user.update({
          where: { id: userId },
          data: { fullName: parsed.data.name },
        });
      }

      return tx.teamMember.update({
        where: { id: existing.id },
        data: {
          ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
          ...(parsed.data.tagline !== undefined
            ? { tagline: parsed.data.tagline || null }
            : {}),
          ...(parsed.data.description !== undefined
            ? { description: parsed.data.description || null }
            : {}),
          ...(nextPhotoUrl ? { photoUrl: nextPhotoUrl } : {}),
          ...(parsed.data.photoAlt !== undefined
            ? { photoAlt: parsed.data.photoAlt || null }
            : {}),
          ...(parsed.data.photoTitle !== undefined
            ? { photoTitle: parsed.data.photoTitle || null }
            : {}),
        },
        select: teamSelect,
      });
    });

    if (
      file &&
      existing.photoUrl.startsWith("/uploads/team/") &&
      existing.photoUrl !== memberRow.photoUrl
    ) {
      const filename = path.basename(existing.photoUrl);
      const full = path.join(TEAM_UPLOAD_ROOT, filename);
      if (full.startsWith(UPLOADS_ROOT)) {
        fs.promises.unlink(full).catch(() => undefined);
      }
    }

    return res.status(200).json({
      message: "Your public profile was updated",
      member: mapAdminMember(memberRow),
    });
  } catch (error) {
    console.error("Update my team profile error:", error);
    return res
      .status(500)
      .json({ message: "Failed to update your team profile" });
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
