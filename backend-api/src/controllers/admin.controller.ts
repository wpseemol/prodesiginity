import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { createStaffSchema } from "../lib/zod/staff.js";
import type { AuthRequest } from "../middleware/auth.js";
import { publicUserSelect } from "./photo.controller.js";

const staffSelect = publicUserSelect;

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
