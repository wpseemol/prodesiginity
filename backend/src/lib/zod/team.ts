import { z } from "zod";
import { editableSiteConfigSchema } from "./siteConfig.js";
import { emailSchema, passwordSchema, usernameSchema } from "./auth.js";

export const createTeamMemberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(160),
  tagline: z.string().trim().max(255).optional().or(z.literal("")),
  /** Staff portal login username (required on create). */
  username: usernameSchema,
  password: passwordSchema,
  /** Optional contact email; defaults to a staff placeholder from username. */
  email: emailSchema.optional(),
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
  name: z.string().trim().min(2).max(120).optional(),
  role: z.string().trim().min(2).max(160).optional(),
  tagline: z.string().trim().max(255).optional().or(z.literal("")),
  username: usernameSchema.optional(),
  email: emailSchema.optional(),
  /** Optional: set a new password for the linked staff login. */
  password: passwordSchema.optional(),
  photoUrl: z.string().trim().max(512).optional(),
  photoAlt: z.string().trim().max(255).optional().or(z.literal("")),
  photoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  isLead: z
    .union([z.boolean(), z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0")])
    .optional()
    .transform((v) => v === true || v === "true" || v === "1"),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
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
