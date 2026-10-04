import { z } from "zod";

export const APPLICATION_STATUSES = [
  "new",
  "reviewing",
  "shortlisted",
  "interview",
  "offered",
  "hired",
  "rejected",
] as const;

export const EXPERIENCE_LEVELS = ["0-1 years", "1-3 years", "3-5 years", "5+ years"] as const;

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const CITY_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'/()-]*$/u;
export const ROLE_RE = /^[\p{L}\p{N}][\p{L}\p{N} &/().,'+-]*$/u;
const PHONE_RE = /^\+?[0-9]{10,15}$/;

const oneLine = (max: number) =>
  z
    .string()
    .transform((v) => v.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim())
    .pipe(z.string().max(max));

/** Multipart body of POST /api/careers/apply (all values arrive as strings). */
export const applySchema = z.object({
  name: oneLine(80).pipe(
    z.string().min(2, "Enter your full name").regex(NAME_RE, "Name can only contain letters, spaces, dots, apostrophes and hyphens"),
  ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address").max(254)),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s().-]/g, ""))
    .pipe(z.string().regex(PHONE_RE, "Enter a valid WhatsApp number, e.g. +8801XXXXXXXXX")),
  city: oneLine(60).pipe(z.string().min(2, "Select your city").regex(CITY_RE, "Select a valid city")),
  jobTitle: oneLine(120).pipe(z.string().min(2, "Select a role").regex(ROLE_RE, "Select a valid role")),
  experience: z.enum(EXPERIENCE_LEVELS, "Select your experience"),
  portfolioUrl: z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) => v === "" || (/^https:\/\/[^\s<>"']+\.[^\s<>"']+$/i.test(v) && z.url().safeParse(v).success),
      "Portfolio link must be a full https:// URL",
    )
    .optional()
    .default(""),
  coverLetter: z
    .string()
    .transform((v) => v.replace(CONTROL_CHARS, "").trim())
    .pipe(z.string().max(1500, "Keep the cover note under 1500 characters"))
    .optional()
    .default(""),
  consent: z.literal("true", "Please accept the privacy notice"),
  /** Honeypot: hidden from people, filled by bots. */
  website: z.string().max(0).optional().default(""),
  /** Epoch ms when the form was rendered; rejects instant bot submissions. */
  startedAt: z.coerce.number().int().positive(),
});

export const listApplicationsQuery = z.object({
  status: z.enum(APPLICATION_STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
});

export const updateApplicationSchema = z
  .object({
    status: z.enum(APPLICATION_STATUSES).optional(),
    rating: z.number().int().min(1).max(5).nullable().optional(),
    notes: z.string().max(5000).optional(),
  })
  .strict();

export const replyApplicationSchema = z
  .object({
    subject: z
      .string()
      .trim()
      .min(3, "Add a subject")
      .max(200)
      .regex(/^[^\r\n]*$/, "Subject must be a single line"),
    body: z.string().trim().min(10, "Write a longer message").max(10_000),
    status: z.enum(APPLICATION_STATUSES).optional(),
  })
  .strict();
