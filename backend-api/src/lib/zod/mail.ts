import { z } from "zod";
import { MAIL_PROVIDERS } from "../mailer.js";

const emailOrEmpty = (label: string) =>
  z
    .string()
    .trim()
    .max(254)
    .refine((v) => v === "" || z.email().safeParse(v).success, `${label} must be a valid email`);

export const updateMailSettingsSchema = z
  .object({
    provider: z.enum(MAIL_PROVIDERS).optional(),
    fromName: z
      .string()
      .trim()
      .max(120)
      .regex(/^[^\r\n<>"]*$/, "From name cannot contain quotes, < > or line breaks")
      .optional(),
    fromEmail: emailOrEmpty("From address").optional(),
    replyTo: emailOrEmpty("Reply-to").optional(),
    notifyEmail: emailOrEmpty("Notification email").optional(),
    resendApiKey: z
      .string()
      .trim()
      .max(200)
      .refine((v) => v === "" || /^re_[A-Za-z0-9_-]{8,}$/.test(v), "Resend API keys start with re_")
      .optional(),
    clearResendApiKey: z.boolean().optional(),
    smtpPreset: z.string().trim().max(32).regex(/^[a-z0-9-]*$/).optional(),
    smtpHost: z
      .string()
      .trim()
      .max(255)
      .refine((v) => v === "" || /^[a-zA-Z0-9.-]+$/.test(v), "SMTP host must be a hostname like smtp.example.com")
      .optional(),
    smtpPort: z.number().int().min(1).max(65535).nullable().optional(),
    smtpSecure: z.boolean().optional(),
    smtpUser: z.string().trim().max(254).regex(/^[^\r\n]*$/).optional(),
    smtpPass: z.string().max(500).optional(),
    clearSmtpPass: z.boolean().optional(),
    careersAutoReply: z.boolean().optional(),
    notifyOnApplication: z.boolean().optional(),
  })
  .strict();

export const testMailSchema = z.object({
  to: z.email("Enter a valid email address").max(254),
});
