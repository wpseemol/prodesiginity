import { z } from "zod";
import {
  emailSchema,
  fullNameSchema,
  passwordSchema,
  usernameSchema,
} from "./auth";

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
