import { z } from "zod";
import { editableSiteConfigSchema } from "./siteConfig.js";
import { passwordSchema, usernameSchema } from "./auth.js";

export const PROFILE_STYLES = [
  "auto",
  "lead",
  "designer",
  "graphic",
  "developer",
  "animator",
  "marketing",
  "people",
] as const;

export const AVATAR_SHAPES = ["auto", "circle", "squircle", "hexagon", "blob"] as const;

export const SOCIAL_KEYS = [
  "facebook",
  "instagram",
  "linkedin",
  "behance",
  "dribbble",
  "artstation",
  "x",
  "github",
  "youtube",
  "website",
] as const;

const boolFlag = z
  .union([z.boolean(), z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0")])
  .optional()
  .transform((v) => v === true || v === "true" || v === "1");

/** Multipart forms send objects/arrays as JSON strings. */
const fromJson = (value: unknown) => {
  if (typeof value !== "string") return value;
  if (value.trim() === "") return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const socialUrl = z
  .string()
  .trim()
  .max(255)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+\.[^\s]+/i.test(v), {
    message: "Social links must be full URLs starting with https://",
  });

const socialsSchema = z.preprocess(
  fromJson,
  z
    .object(
      Object.fromEntries(SOCIAL_KEYS.map((key) => [key, socialUrl.optional()])) as Record<
        (typeof SOCIAL_KEYS)[number],
        z.ZodOptional<typeof socialUrl>
      >,
    )
    .strict(),
);

const skillsSchema = z.preprocess(
  fromJson,
  z
    .array(z.string().trim().min(1).max(40))
    .max(12, { message: "Add at most 12 skills" }),
);

/** Public-profile extras shared by admin create/update and staff self-edit. */
const profileExtras = {
  profileStyle: z.enum(PROFILE_STYLES).optional(),
  avatarShape: z.enum(AVATAR_SHAPES).optional(),
  socials: socialsSchema.optional(),
  skills: skillsSchema.optional(),
  /** Drop the custom avatar image and fall back to the photo. */
  removeAvatar: boolFlag,
};

export const createTeamMemberSchema = z.object({
  ...profileExtras,
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(160),
  tagline: z.string().trim().max(255).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  username: usernameSchema,
  password: passwordSchema,
  photoUrl: z.string().trim().max(512).optional(),
  photoAlt: z.string().trim().max(255).optional().or(z.literal("")),
  photoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  isLead: z
    .union([z.boolean(), z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0")])
    .optional()
    .transform((v) => v === true || v === "true" || v === "1"),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-zA-Z0-9._-]+$/, "Slug may only contain letters, numbers, dots, underscores, hyphens")
    .optional(),
});

export const updateTeamMemberSchema = z.object({
  ...profileExtras,
  name: z.string().trim().min(2).max(120).optional(),
  role: z.string().trim().min(2).max(160).optional(),
  tagline: z.string().trim().max(255).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  username: usernameSchema.optional(),
  /** Optional: set a new password for the linked staff login. */
  password: passwordSchema.optional(),
  /** Required with password when the member already has a login. */
  currentPassword: z.string().min(1).optional(),
  photoUrl: z.string().trim().max(512).optional(),
  photoAlt: z.string().trim().max(255).optional().or(z.literal("")),
  photoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  isLead: z
    .union([
      z.boolean(),
      z.literal("true"),
      z.literal("false"),
      z.literal("1"),
      z.literal("0"),
    ])
    .optional()
    .transform((v) => v === true || v === "true" || v === "1"),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

/** Staff self-edit: name / photo / avatar / bio / socials — designation (role) is admin-only. */
export const updateMyTeamProfileSchema = z.object({
  ...profileExtras,
  name: z.string().trim().min(2).max(120).optional(),
  tagline: z.string().trim().max(255).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  photoAlt: z.string().trim().max(255).optional().or(z.literal("")),
  photoTitle: z.string().trim().max(160).optional().or(z.literal("")),
});

const optionalId = z
  .string()
  .trim()
  .max(64)
  .optional()
  .or(z.literal(""));

const optionalSecret = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .or(z.literal(""));

export const updateSiteSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120).optional(),
  loginTitle: z.string().trim().min(1).max(160).optional(),
  loginSubtitle: z.string().trim().min(1).max(255).optional(),
  loginBadgeText: z.string().trim().min(1).max(80).optional(),
  /** When true, clears custom login logo so the website logo is used. */
  useWebsiteLogo: z.boolean().optional(),

  trackingEnabled: z.boolean().optional(),
  metaPixelId: optionalId,
  googleMeasurementId: optionalId,
  googleAdsId: optionalId,
  /** Empty string keeps existing secret; send clearMetaCapiAccessToken to wipe. */
  metaCapiAccessToken: optionalSecret,
  clearMetaCapiAccessToken: z.boolean().optional(),
  metaCapiTestEventCode: optionalId,
  googleAdsConversionLabel: z
    .string()
    .trim()
    .max(128)
    .optional()
    .or(z.literal("")),
  googleAdsCustomerId: z
    .string()
    .trim()
    .max(32)
    .optional()
    .or(z.literal("")),
  googleEnhancedConversionsApiKey: optionalSecret,
  clearGoogleEnhancedConversionsApiKey: z.boolean().optional(),

  /** Full frontend site config overlay (brand, contact, social, legal, …). */
  siteConfig: editableSiteConfigSchema.optional(),
});

export const trackPageVisitSchema = z.object({
  path: z.string().trim().min(1).max(512),
  referrer: z.string().trim().max(512).optional().or(z.literal("")),
  sessionId: z.string().trim().max(64).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  countryCode: z.string().trim().max(8).optional().or(z.literal("")),
});
