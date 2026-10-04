import { z } from "zod";
import validator from "validator";

const noHtmlOrSqlMetaRegex = /^[^<>&;`\\|]*$/;
const safeNameRegex = /^[a-zA-Z\s\-'.]+$/;
const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;

export const usernameSchema = z
  .string({ message: "Username is required" })
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(
    usernameRegex,
    "Username may only contain letters, numbers, dots, underscores, and hyphens",
  )
  .regex(noHtmlOrSqlMetaRegex, "Scripts and HTML tags are not allowed");

export const passwordSchema = z
  .string({ message: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#_\-])[A-Za-z\d@$!%*?&^#_\-]+$/,
    "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
  );

export const emailSchema = z
  .string({ message: "Email is required" })
  .trim()
  .max(254, "Email is too long")
  .email("Please provide a valid email address")
  .transform((val) => {
    const normalized = validator.normalizeEmail(val, {
      all_lowercase: true,
      gmail_remove_dots: false,
    });
    return normalized ? normalized : val.toLowerCase();
  })
  .refine((val) => validator.isEmail(val), {
    message: "Invalid email format after normalization",
  });

export const fullNameSchema = z
  .string({ message: "Full name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name cannot exceed 100 characters")
  .regex(safeNameRegex, "Name contains invalid characters")
  .regex(noHtmlOrSqlMetaRegex, "Scripts and HTML tags are not allowed")
  .transform((val) => val.replace(/[\x00-\x1F\x7F]/g, "").trim());

export const registerSchema = z.object({
  fullName: fullNameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  login: z
    .string({ message: "Username or email is required" })
    .trim()
    .min(1, "Username or email is required")
    .max(254, "Login is too long")
    .transform((val) => val.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const updateProfileSchema = z
  .object({
    fullName: fullNameSchema.optional(),
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    currentPassword: z.string().min(1).optional(),
  })
  .refine(
    (data) =>
      data.fullName !== undefined ||
      data.username !== undefined ||
      data.email !== undefined ||
      data.password !== undefined,
    { message: "Provide at least one field to update" },
  )
  .refine((data) => !data.password || !!data.currentPassword, {
    message: "Current password is required to set a new password",
    path: ["currentPassword"],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
