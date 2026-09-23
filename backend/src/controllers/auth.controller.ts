import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import {
  deleteAccountSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  updateProfileSchema,
} from "../lib/zod/auth";
import {
  issueTokenPair,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
} from "../lib/tokens";
import type { AuthRequest } from "../middleware/auth";
import { publicUserSelect } from "./photo.controller";

function isEmailLogin(value: string) {
  return value.includes("@");
}

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

    const authUser = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      photo: user.photo,
    };

    const tokens = await issueTokenPair(authUser);

    return res.status(200).json({
      message: "Login successful",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: authUser,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "Login failed due to an internal server error" });
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
