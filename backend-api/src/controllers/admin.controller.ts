import fs from "fs";
import path from "path";
import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { revokeAllUserRefreshTokens } from "../lib/tokens.js";
import { USERS_UPLOAD_ROOT } from "../lib/uploads.js";
import { createStaffSchema, updateAccountSchema } from "../lib/zod/staff.js";
import type { AuthRequest } from "../middleware/auth.js";
import { publicUserSelect } from "./photo.controller.js";

const staffSelect = { ...publicUserSelect, disabledAt: true } as const;

const clientSelect = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  googleId: true,
  disabledAt: true,
  created_at: true,
  refreshTokens: {
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 1,
  },
} as const;

type ClientRow = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  googleId: string | null;
  disabledAt: Date | null;
  created_at: Date;
  refreshTokens: { createdAt: Date }[];
};

function toClient({ googleId, refreshTokens, ...row }: ClientRow) {
  return {
    ...row,
    signInMethod: googleId ? "google" : "password",
    lastActiveAt: refreshTokens[0]?.createdAt ?? null,
  };
}

function accountId(req: AuthRequest) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const createStaffUser = async (req: AuthRequest, res: Response) => {
  try {
    const validation = createStaffSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message:
          validation.error.issues[0]?.message || "Invalid input data",
      });
    }

    const { fullName, username, email, password, role } = validation.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const conflict =
        existingUser.email === email
          ? "Email is already registered"
          : "Username is already taken";
      return res.status(409).json({ message: conflict });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        username,
        email,
        password: hashedPassword,
        role,
      },
      select: staffSelect,
    });

    return res.status(201).json({
      message:
        role === "admin"
          ? "Admin account created successfully"
          : "Employee account created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Create staff user error:", error);
    return res.status(500).json({
      message: "Failed to create account due to an internal server error",
    });
  }
};

export const listStaffUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["admin", "employer"] },
      },
      select: staffSelect,
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("List staff users error:", error);
    return res.status(500).json({
      message: "Failed to load staff accounts",
    });
  }
};

/** GET /api/admin/clients?q= — website accounts (role `user`). */
export const listClientUsers = async (req: AuthRequest, res: Response) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
    const rows = await prisma.user.findMany({
      where: {
        role: "user",
        ...(q
          ? {
              OR: [
                { fullName: { contains: q } },
                { email: { contains: q } },
                { username: { contains: q } },
              ],
            }
          : {}),
      },
      select: clientSelect,
      orderBy: { created_at: "desc" },
      take: 500,
    });

    return res.status(200).json({ users: rows.map(toClient) });
  } catch (error) {
    console.error("List client users error:", error);
    return res.status(500).json({ message: "Failed to load user accounts" });
  }
};

/** PATCH /api/admin/users/:id — edit, change role, reset password, disable. */
export const updateUserAccount = async (req: AuthRequest, res: Response) => {
  try {
    const actorId = req.user?.userId;
    if (!actorId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const id = accountId(req);
    if (!id) {
      return res.status(400).json({ message: "Invalid account id" });
    }
    if (id === actorId) {
      return res.status(400).json({
        message: "Use your Profile page to change your own account.",
      });
    }

    const parsed = updateAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid input data",
      });
    }
    const { fullName, username, email, role, password, currentPassword, disabled } =
      parsed.data;

    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        disabledAt: true,
        teamMember: { select: { id: true, isLead: true } },
      },
    });
    if (!target) {
      return res.status(404).json({ message: "Account not found" });
    }
    if (role && target.role === "user") {
      return res.status(400).json({
        message: "Website user accounts can't be given a staff role.",
      });
    }

    if (password) {
      const actor = await prisma.user.findUnique({
        where: { id: actorId },
        select: { password: true },
      });
      if (!actor || !(await bcrypt.compare(currentPassword!, actor.password))) {
        return res.status(401).json({ message: "Your admin password is incorrect" });
      }
    }

    if (username || email) {
      const conflict = await prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
        select: { username: true, email: true },
      });
      if (conflict) {
        return res.status(409).json({
          message:
            email && conflict.email === email
              ? "Email is already registered"
              : "Username is already taken",
        });
      }
    }

    const roleChanged = role !== undefined && role !== target.role;
    const disabledAt =
      disabled === undefined ? undefined : disabled ? (target.disabledAt ?? new Date()) : null;

    const user = await prisma.$transaction(async (tx) => {
      // The team lead is the admin login; a demoted account can't stay lead.
      if (roleChanged && role === "employer" && target.teamMember?.isLead) {
        await tx.teamMember.update({
          where: { id: target.teamMember.id },
          data: { isLead: false },
        });
      }

      return tx.user.update({
        where: { id },
        data: {
          ...(fullName !== undefined ? { fullName } : {}),
          ...(username !== undefined ? { username } : {}),
          ...(email !== undefined ? { email } : {}),
          ...(roleChanged ? { role } : {}),
          ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
          ...(disabledAt !== undefined ? { disabledAt } : {}),
        },
        select: staffSelect,
      });
    });

    if (password || roleChanged || disabled === true) {
      await revokeAllUserRefreshTokens(id);
    }

    return res.status(200).json({ message: "Account updated", user });
  } catch (error) {
    console.error("Update user account error:", error);
    return res.status(500).json({ message: "Failed to update account" });
  }
};

/** DELETE /api/admin/users/:id — removes the login; a linked team profile stays. */
export const deleteUserAccount = async (req: AuthRequest, res: Response) => {
  try {
    const id = accountId(req);
    if (!id) {
      return res.status(400).json({ message: "Invalid account id" });
    }
    if (id === req.user?.userId) {
      return res.status(400).json({
        message: "Use your Profile page to delete your own account.",
      });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!target) {
      return res.status(404).json({ message: "Account not found" });
    }

    await prisma.user.delete({ where: { id } });
    await fs.promises
      .rm(path.join(USERS_UPLOAD_ROOT, String(id)), { recursive: true, force: true })
      .catch(() => undefined);

    return res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    console.error("Delete user account error:", error);
    return res.status(500).json({ message: "Failed to delete account" });
  }
};
