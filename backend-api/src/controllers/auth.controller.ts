import crypto from "crypto";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import {
  deleteAccountSchema,
  googleLoginSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  updateProfileSchema,
} from "../lib/zod/auth.js";
import {
  issueTokenPair,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
} from "../lib/tokens.js";
import type { AuthRequest } from "../middleware/auth.js";
import {
  accountTeamImageSelect,
  publicUserSelect,
} from "./photo.controller.js";

function isEmailLogin(value: string) {
  return value.includes("@");
}

const ACCOUNT_DISABLED_MESSAGE =
  "This account has been disabled. Contact an administrator.";

const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);

type GoogleIdToken = {
  aud?: string;
  iss?: string;
  sub?: string;
  exp?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
};

/** Verifies a Google Identity Services credential with Google's tokeninfo endpoint. */
async function verifyGoogleCredential(credential: string, clientId: string) {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    { signal: AbortSignal.timeout(10_000) },
  );
  if (!res.ok) return null;
  const token = (await res.json()) as GoogleIdToken;
  const verified = token.email_verified === true || token.email_verified === "true";
  if (
    token.aud !== clientId ||
    !GOOGLE_ISSUERS.has(token.iss ?? "") ||
    !token.sub ||
    !token.email ||
    !verified ||
    Number(token.exp) * 1000 < Date.now()
  ) {
    return null;
  }
  return { sub: token.sub, email: token.email.toLowerCase(), name: token.name, picture: token.picture };
}

async function uniqueUsername(email: string) {
  const base =
    email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20) || "client";
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}${crypto.randomInt(1000, 99999)}`;
    const taken = await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return `${base}${crypto.randomBytes(4).toString("hex")}`;
}

/** POST /api/auth/google — client sign-in with a Google ID token. */
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({ message: "Google sign-in is not configured yet." });
    }

    const parsed = googleLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    const google = await verifyGoogleCredential(parsed.data.credential, clientId);
    if (!google) {
      return res.status(401).json({ message: "Google could not verify this sign-in. Please try again." });
    }

    let user =
      (await prisma.user.findUnique({ where: { googleId: google.sub } })) ??
      (await prisma.user.findUnique({ where: { email: google.email } }));

    if (user && user.role !== "user") {
      return res.status(403).json({
        message: "This email belongs to a staff account. Staff sign in through the staff portal.",
      });
    }

    if (user?.disabledAt) {
      return res.status(403).json({ message: ACCOUNT_DISABLED_MESSAGE });
    }

    if (user && !user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId: google.sub } });
    } else if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: (google.name || google.email.split("@")[0]).slice(0, 120),
          username: await uniqueUsername(google.email),
          email: google.email,
          googleId: google.sub,
          password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
          role: "user",
        },
      });
    }

    const authUser = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const tokens = await issueTokenPair(authUser);

    return res.status(200).json({
      message: "Login successful",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      refreshExpiresInDays: tokens.refreshExpiresInDays,
      user: { ...authUser, picture: google.picture ?? null },
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ message: "Google sign-in failed. Please try again." });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message:
          validation.error.issues[0]?.message || "Invalid input data",
      });
    }

    const { fullName, username, email, password } = validation.data;

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
      },
      select: publicUserSelect,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      message: "Registration failed due to an internal server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message:
          validation.error.issues[0]?.message ||
          "Invalid credentials provided",
      });
    }

    const { login, password } = validation.data;

    const user = await prisma.user.findFirst({
      where: isEmailLogin(login)
        ? { email: login }
        : { username: login },
      include: {
        photo: {
          select: {
            id: true,
            url: true,
            altText: true,
            description: true,
            createdAt: true,
          },
        },
        teamMember: accountTeamImageSelect,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    if (user.disabledAt) {
      return res.status(403).json({ message: ACCOUNT_DISABLED_MESSAGE });
    }

    const authUser = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      photo: user.photo,
      teamMember: user.teamMember,
    };

    const tokens = await issueTokenPair(authUser);

    return res.status(200).json({
      message: "Login successful",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      refreshExpiresInDays: tokens.refreshExpiresInDays,
      user: authUser,
    });
  } catch (error) {
    console.error("Login Error:", error);
    const message =
      error instanceof Error && /pool timeout|P2039|Can't connect/i.test(error.message)
        ? "Database is temporarily unavailable. Please try again in a moment."
        : "Login failed due to an internal server error";
    return res.status(500).json({ message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const validation = refreshSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message:
          validation.error.issues[0]?.message || "Refresh token is required",
      });
    }

    const rotated = await rotateRefreshToken(validation.data.refreshToken);
    if (!rotated) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    return res.status(200).json({
      message: "Token refreshed",
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
      expiresIn: rotated.expiresIn,
      refreshExpiresInDays: rotated.refreshExpiresInDays,
      user: rotated.user,
    });
  } catch (error) {
    console.error("Refresh Error:", error);
    return res.status(500).json({
      message: "Could not refresh session",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const validation = refreshSchema.safeParse(req.body);
    if (validation.success) {
      await revokeRefreshToken(validation.data.refreshToken);
    }
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: publicUserSelect,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Me Error:", error);
    return res.status(500).json({ message: "Could not load profile" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message:
          validation.error.issues[0]?.message || "Invalid input data",
      });
    }

    const { fullName, username, email, password, currentPassword } =
      validation.data;

    const existing = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    if (password) {
      const ok = await bcrypt.compare(currentPassword!, existing.password);
      if (!ok) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }
    }

    if (username && username !== existing.username) {
      const taken = await prisma.user.findUnique({ where: { username } });
      if (taken) {
        return res.status(409).json({ message: "Username is already taken" });
      }
    }

    if (email && email !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) {
        return res
          .status(409)
          .json({ message: "Email is already registered" });
      }
    }

    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(username !== undefined ? { username } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(password
          ? { password: await bcrypt.hash(password, 10) }
          : {}),
      },
      select: publicUserSelect,
    });

    // Password change invalidates other sessions
    if (password) {
      await revokeAllUserRefreshTokens(existing.id);
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (error) {
    console.error("Update profile Error:", error);
    return res.status(500).json({ message: "Could not update profile" });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const validation = deleteAccountSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message:
          validation.error.issues[0]?.message || "Password is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ok = await bcrypt.compare(validation.data.password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    await prisma.user.delete({ where: { id: user.id } });

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account Error:", error);
    return res.status(500).json({ message: "Could not delete account" });
  }
};
