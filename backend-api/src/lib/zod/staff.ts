import { z } from "zod";
import {
  emailSchema,
  fullNameSchema,
  passwordSchema,
  usernameSchema,
} from "./auth.js";

export const createStaffSchema = z.object({
  fullName: fullNameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["admin", "employer"], {
    message: "Role must be admin or employer",
  }),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

/** Admin edit of any account. `role` only applies to staff accounts. */
export const updateAccountSchema = z
  .object({
    fullName: fullNameSchema.optional(),
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    role: z
      .enum(["admin", "employer"], { message: "Role must be admin or employer" })
      .optional(),
    password: passwordSchema.optional(),
    /** The acting admin's own password, required to set a new password. */
    currentPassword: z.string().min(1).optional(),
    disabled: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Provide at least one field to update",
  })
  .refine((data) => !data.password || !!data.currentPassword, {
    message: "Enter your admin password to confirm the new password",
    path: ["currentPassword"],
  });
