import { z } from "zod";

export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "stats",
  "brands",
  "process",
  "recentProjects",
  "pricing",
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

export const homepageSectionKeySchema = z.enum(HOMEPAGE_SECTION_KEYS);

export const updateHomepageSectionSchema = z.object({
  content: z.unknown(),
  label: z.string().trim().min(1).max(128).optional(),
});

/** Brand marquee logos — keep light for fast carousel load. */
export const LOGO_MAX_BYTES = 1 * 1024 * 1024;
export const LOGO_REC_WIDTH = 240;
export const LOGO_REC_HEIGHT = 80;
export const LOGO_MIN_WIDTH = 80;
export const LOGO_MIN_HEIGHT = 32;
export const LOGO_MAX_WIDTH = 800;
export const LOGO_MAX_HEIGHT = 320;

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 120 * 1024 * 1024;

export const logoImageMimeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const videoMimeSchema = z.enum([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Color must be #RGB or #RRGGBB");

export const brandItemSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required").max(120),
  logo: z.string().trim().min(1, "Logo image is required").max(512),
  color: hexColorSchema.optional().or(z.literal("")),
});

export const brandsContentSchema = z.object({
  brands: z.array(brandItemSchema).max(60),
});

/** Multer file metadata for brand logo uploads (max 1 MB). */
export const homepageLogoFileSchema = z.object({
  mimetype: logoImageMimeSchema,
  size: z
    .number()
    .int()
    .positive()
    .max(LOGO_MAX_BYTES, "Logo must be 1 MB or smaller"),
  originalname: z.string().min(1),
  filename: z.string().min(1),
});

/** General homepage image upload (max 5 MB). */
export const homepageImageFileSchema = z.object({
  mimetype: logoImageMimeSchema,
  size: z
    .number()
    .int()
    .positive()
    .max(IMAGE_MAX_BYTES, "Image must be 5 MB or smaller"),
  originalname: z.string().min(1),
  filename: z.string().min(1),
});

/** Homepage video upload (max 120 MB). */
export const homepageVideoFileSchema = z.object({
  mimetype: videoMimeSchema,
  size: z
    .number()
    .int()
    .positive()
    .max(VIDEO_MAX_BYTES, "Video must be 120 MB or smaller"),
  originalname: z.string().min(1),
  filename: z.string().min(1),
});

export function validateHomepageSectionContent(
  key: HomepageSectionKey,
  content: unknown,
) {
  if (key === "brands") {
    return brandsContentSchema.safeParse(content);
  }
  if (
    content === undefined ||
    typeof content !== "object" ||
    content === null ||
    Array.isArray(content)
  ) {
    return {
      success: false as const,
      error: {
        issues: [{ message: "content must be a JSON object" }],
      },
    };
  }
  return { success: true as const, data: content };
}
