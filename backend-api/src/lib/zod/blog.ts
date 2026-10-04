import { z } from "zod";
import { cleanText, detectThreat, hasPathTraversal } from "../security.js";

export const BLOG_ACCENTS = ["violet", "blue", "indigo", "emerald", "orange"] as const;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ICON_RE = /^[A-Za-z][A-Za-z0-9]{0,63}$/;
const LOCAL_UPLOAD_RE = /^\/uploads\/[A-Za-z0-9_\-./]+$/;
const VIDEO_EXT_RE = /\.(mp4|webm|mov)(?:\?.*)?$/i;
const VIDEO_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "vimeo.com",
  "player.vimeo.com",
]);

/** Plain text: control characters stripped, SQL / script payloads rejected. */
function text(label: string, min: number, max: number) {
  return z
    .string({ error: `${label} must be text` })
    .overwrite(cleanText)
    .min(min, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`)
    .refine((v) => !detectThreat(v), `${label} contains code or SQL that is not allowed`);
}

/** Optional text: `""` / `null` clear the value, `undefined` leaves it alone. */
function optionalText(label: string, max: number) {
  return z
    .union([text(label, 0, max), z.null()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v || null));
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.username || url.password) return false;
    if (url.protocol === "https:") return true;
    return url.protocol === "http:" && /^(localhost|127\.0\.0\.1)$/.test(url.hostname);
  } catch {
    return false;
  }
}

function isSafeMediaUrl(value: string) {
  if (hasPathTraversal(value)) return false;
  return LOCAL_UPLOAD_RE.test(value) || isHttpUrl(value);
}

function isSafeVideoUrl(value: string) {
  if (hasPathTraversal(value)) return false;
  if (LOCAL_UPLOAD_RE.test(value)) return VIDEO_EXT_RE.test(value);
  if (!isHttpUrl(value)) return false;
  const url = new URL(value);
  return VIDEO_HOSTS.has(url.hostname) || VIDEO_EXT_RE.test(url.pathname);
}

const mediaUrl = (label: string) =>
  text(label, 1, 512).refine(isSafeMediaUrl, `${label} must be an uploaded file or an https:// link`);

const videoUrl = (label: string) =>
  text(label, 1, 512).refine(
    isSafeVideoUrl,
    `${label} must be an uploaded MP4/WebM/MOV, a YouTube / Vimeo link, or an https:// video file`,
  );

function optional<T extends z.ZodType<string>>(schema: T) {
  return z
    .union([schema, z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v || null));
}

const slugSchema = (max: number) =>
  z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug must be at least 2 characters")
    .max(max, `Slug must be ${max} characters or fewer`)
    .regex(SLUG_RE, "Slug may only use lowercase letters, numbers and hyphens");

const iconSchema = optional(
  z.string().trim().regex(ICON_RE, "Icon must be a valid icon name"),
);

/* ---------------------------------------------------------------- Category */

export const createBlogCategorySchema = z.object({
  name: text("Name", 2, 120),
  slug: slugSchema(80),
  description: optionalText("Description", 512),
  imageUrl: optional(mediaUrl("Category image")),
  icon: iconSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

export const updateBlogCategorySchema = createBlogCategorySchema.partial();

/* ------------------------------------------------------------------ Blocks */

const blockText = (label: string, max = 5000) => text(label, 1, max);

const blockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    id: z
      .string()
      .trim()
      .max(80)
      .regex(/^[a-z0-9-]*$/, "Heading id may only use lowercase letters, numbers and hyphens")
      .optional(),
    text: blockText("Heading", 200),
  }),
  z.object({ type: z.literal("subheading"), text: blockText("Subheading", 200) }),
  z.object({ type: z.literal("paragraph"), text: blockText("Paragraph", 5000) }),
  z.object({
    type: z.literal("list"),
    items: z.array(blockText("List item", 600)).min(1, "A list needs at least one item").max(50),
    ordered: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("steps"),
    items: z
      .array(z.object({ title: blockText("Step title", 160), body: blockText("Step text", 1200) }))
      .min(1)
      .max(20),
  }),
  z.object({
    type: z.literal("quote"),
    text: blockText("Quote", 1200),
    attribution: optionalText("Quote attribution", 160),
  }),
  z.object({
    type: z.literal("callout"),
    tone: z.enum(["info", "warning", "success"]).optional(),
    title: optionalText("Callout title", 160),
    text: blockText("Callout text", 1500),
  }),
  z.object({
    type: z.literal("table"),
    caption: optionalText("Table caption", 200),
    head: z
      .array(text("Table header", 0, 120))
      .min(1)
      .max(8)
      .refine((cells) => cells.some((c) => c.length > 0), "A table needs at least one header"),
    rows: z.array(z.array(text("Table cell", 0, 400)).max(8)).min(1).max(60),
  }),
  z.object({
    type: z.literal("image"),
    src: mediaUrl("Image"),
    alt: text("Image alt text", 3, 255),
    caption: optionalText("Image caption", 300),
  }),
  z.object({
    type: z.literal("video"),
    src: videoUrl("Video"),
    title: optionalText("Video title", 200),
    caption: optionalText("Video caption", 300),
  }),
  z.object({
    type: z.literal("stats"),
    items: z
      .array(z.object({ value: text("Stat value", 1, 40), label: text("Stat label", 1, 200) }))
      .min(1)
      .max(6),
  }),
  z.object({ type: z.literal("divider") }),
]);

export type BlogBlockInput = z.infer<typeof blockSchema>;

/* -------------------------------------------------------------------- Post */

const dateSchema = z
  .string()
  .trim()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Publish date is not a valid date")
  .transform((v) => new Date(v));

const blogPostFields = {
  title: text("Title", 5, 200),
  slug: slugSchema(160),
  excerpt: text("Excerpt", 20, 600),
  categoryId: z.coerce.number().int().positive("Choose a category"),
  coverImage: optional(mediaUrl("Cover image")),
  coverAlt: optionalText("Cover alt text", 255),
  videoUrl: optional(videoUrl("Video")),
  accent: z.enum(BLOG_ACCENTS),
  icon: iconSchema,
  body: z
    .array(blockSchema)
    .min(1, "Add at least one content block")
    .max(300, "An article can have at most 300 blocks"),
  keyTakeaways: z.array(text("Key takeaway", 3, 400)).max(8, "Use at most 8 key takeaways"),
  faqs: z
    .array(z.object({ q: text("FAQ question", 3, 300), a: text("FAQ answer", 3, 2000) }))
    .max(20, "Use at most 20 FAQs"),
  tags: z.array(text("Tag", 1, 40)).max(20, "Use at most 20 tags"),
  relatedServices: z.array(slugSchema(80)).max(6, "Link at most 6 related services"),
  bylineMemberId: z.union([z.coerce.number().int().positive(), z.null()]),
  seo: z.object({
    title: optionalText("SEO title", 160),
    description: optionalText("SEO description", 320),
    keywords: z.array(text("Keyword", 1, 80)).max(30).optional(),
  }),
  featured: z.boolean(),
  status: z.enum(["draft", "published"]),
  publishedAt: z.union([dateSchema, z.literal(""), z.null()]).optional(),
};

export const createBlogPostSchema = z.object({
  ...blogPostFields,
  accent: blogPostFields.accent.optional(),
  keyTakeaways: blogPostFields.keyTakeaways.optional(),
  faqs: blogPostFields.faqs.optional(),
  tags: blogPostFields.tags.optional(),
  relatedServices: blogPostFields.relatedServices.optional(),
  bylineMemberId: blogPostFields.bylineMemberId.optional(),
  seo: blogPostFields.seo.optional(),
  featured: blogPostFields.featured.optional(),
  status: blogPostFields.status.optional(),
});

export const updateBlogPostSchema = z.object(blogPostFields).partial();

export const listBlogPostsQuerySchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  q: z.string().trim().max(120).optional(),
});

export const blogSlugParamSchema = slugSchema(160);

/* ------------------------------------------------------------------ Upload */

export const BLOG_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const BLOG_VIDEO_MAX_BYTES = 120 * 1024 * 1024;

export const blogImageFileSchema = z.object({
  mimetype: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  size: z.number().int().positive().max(BLOG_IMAGE_MAX_BYTES, "Image must be 5 MB or smaller"),
  filename: z.string().min(1),
});

export const blogVideoFileSchema = z.object({
  mimetype: z.enum(["video/mp4", "video/webm", "video/quicktime"]),
  size: z.number().int().positive().max(BLOG_VIDEO_MAX_BYTES, "Video must be 120 MB or smaller"),
  filename: z.string().min(1),
});
