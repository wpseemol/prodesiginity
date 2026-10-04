import { z } from "zod";
import { siteOrigin } from "@/config";
import { isSafeMediaUrl, isSafeVideoUrl, threatMessage } from "@/lib/security";

/* ------------------------------------------------------------------- Rows */

export type BlogCategoryRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  sortOrder: number;
  postCount: number;
};

export type BlogAuthor = { id: number | null; name: string; role: string; photo: string | null };

export type ApiBlock = { type: string; [key: string]: unknown };

export type BylineMember = { id: number; name: string; role: string; photoUrl: string | null };

export type ServiceOption = { slug: string; title: string; group: string };

export type BlogPostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  categoryId: number;
  category: { id: number; slug: string; name: string; icon: string | null; imageUrl: string | null };
  author: BlogAuthor;
  authorId: number | null;
  bylineMemberId: number | null;
  coverImage: string | null;
  coverAlt: string | null;
  videoUrl: string | null;
  accent: BlogAccent;
  icon: string | null;
  body?: ApiBlock[];
  keyTakeaways?: string[];
  faqs?: { q: string; a: string }[];
  tags: string[];
  relatedServices?: string[];
  seo: { title?: string | null; description?: string | null; keywords?: string[] };
  featured: boolean;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------- Constants */

export const BLOG_ACCENTS = ["indigo", "violet", "blue", "emerald", "orange"] as const;
export type BlogAccent = (typeof BLOG_ACCENTS)[number];

export const ACCENT_SWATCH: Record<BlogAccent, { label: string; swatch: string; preview: string }> = {
  indigo: { label: "Indigo", swatch: "bg-indigo-500", preview: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  violet: { label: "Purple", swatch: "bg-violet-500", preview: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  blue: { label: "Blue", swatch: "bg-blue-500", preview: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  emerald: { label: "Green", swatch: "bg-emerald-500", preview: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  orange: { label: "Orange", swatch: "bg-orange-500", preview: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
};

export const EDITABLE_BLOCK_TYPES = [
  "paragraph",
  "heading",
  "subheading",
  "list",
  "quote",
  "callout",
  "image",
  "video",
  "divider",
] as const;
export type EditableBlockType = (typeof EDITABLE_BLOCK_TYPES)[number];

export const BLOCK_LABELS: Record<EditableBlockType, string> = {
  paragraph: "Paragraph",
  heading: "Heading",
  subheading: "Sub-heading",
  list: "List",
  quote: "Quote",
  callout: "Callout",
  image: "Image",
  video: "Video",
  divider: "Divider",
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* -------------------------------------------------------------- Validators */

/** Trimmed text with length limits and SQL / script detection. */
export function safeText(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .min(min, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`)
    .superRefine((value, ctx) => {
      const message = threatMessage(label, value);
      if (message) ctx.addIssue({ code: "custom", message });
    });
}

const optionalMedia = (label: string) =>
  z
    .string()
    .trim()
    .max(512)
    .refine((v) => v === "" || isSafeMediaUrl(v), `${label} must be an uploaded file or an https:// link`);

const optionalVideo = (label: string) =>
  z
    .string()
    .trim()
    .max(512)
    .refine(
      (v) => v === "" || isSafeVideoUrl(v),
      `${label} must be an uploaded video, a YouTube / Vimeo link, or an https:// video file`,
    );

const slugField = (max: number) =>
  z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(max, `Slug must be ${max} characters or fewer`)
    .regex(SLUG_RE, "Use lowercase letters, numbers and hyphens only");

/** Newline / comma separated list validated item by item. */
function textList(label: string, opts: { sep: RegExp; maxItems: number; maxLen: number }) {
  return z.string().superRefine((value, ctx) => {
    const items = splitList(value, opts.sep);
    if (items.length > opts.maxItems) {
      ctx.addIssue({ code: "custom", message: `Use at most ${opts.maxItems} ${label.toLowerCase()}` });
    }
    for (const item of items) {
      if (item.length > opts.maxLen) {
        ctx.addIssue({ code: "custom", message: `Each item must be ${opts.maxLen} characters or fewer` });
        return;
      }
      const message = threatMessage(label, item);
      if (message) {
        ctx.addIssue({ code: "custom", message });
        return;
      }
    }
  });
}

export function splitList(value: string, sep: RegExp) {
  return value
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ---------------------------------------------------------------- Category */

export const blogCategoryFormSchema = z.object({
  name: safeText("Name", 2, 120),
  slug: slugField(80),
  description: safeText("Description", 0, 512),
  imageUrl: optionalMedia("Image"),
  icon: z.string().regex(/^([A-Za-z][A-Za-z0-9]{0,63})?$/, "Choose a valid icon"),
});

export type BlogCategoryFormValues = z.infer<typeof blogCategoryFormSchema>;

/* ------------------------------------------------------------------ Blocks */

/**
 * One flat shape for every block type keeps react-hook-form simple; only the
 * fields relevant to `type` are validated and sent. `raw` carries block types
 * the editor cannot edit (steps, table, stats) through untouched.
 */
export const blockFormSchema = z
  .object({
    type: z.string(),
    anchor: z.string(),
    text: z.string(),
    items: z.string(),
    ordered: z.boolean(),
    title: z.string(),
    tone: z.enum(["info", "warning", "success"]),
    attribution: z.string(),
    src: z.string(),
    alt: z.string(),
    caption: z.string(),
    raw: z.unknown().optional(),
  })
  .superRefine((block, ctx) => {
    const check = (field: keyof typeof block, label: string, min: number, max: number) => {
      const value = String(block[field] ?? "").trim();
      if (value.length < min) {
        ctx.addIssue({ code: "custom", path: [field], message: `${label} is required` });
        return;
      }
      if (value.length > max) {
        ctx.addIssue({ code: "custom", path: [field], message: `${label} must be ${max} characters or fewer` });
        return;
      }
      const message = threatMessage(label, value);
      if (message) ctx.addIssue({ code: "custom", path: [field], message });
    };

    switch (block.type) {
      case "heading":
      case "subheading":
        check("text", "Heading", 1, 200);
        break;
      case "paragraph":
        check("text", "Paragraph", 1, 5000);
        break;
      case "list": {
        const items = splitList(block.items, /\n/);
        if (items.length === 0) {
          ctx.addIssue({ code: "custom", path: ["items"], message: "Add at least one list item" });
        } else if (items.length > 50) {
          ctx.addIssue({ code: "custom", path: ["items"], message: "Use at most 50 items" });
        }
        for (const item of items) {
          const message = item.length > 600 ? "Each item must be 600 characters or fewer" : threatMessage("List item", item);
          if (message) {
            ctx.addIssue({ code: "custom", path: ["items"], message });
            break;
          }
        }
        break;
      }
      case "quote":
        check("text", "Quote", 1, 1200);
        check("attribution", "Attribution", 0, 160);
        break;
      case "callout":
        check("title", "Callout title", 0, 160);
        check("text", "Callout text", 1, 1500);
        break;
      case "image":
        if (!block.src.trim()) {
          ctx.addIssue({ code: "custom", path: ["src"], message: "Upload an image or paste a link" });
        } else if (!isSafeMediaUrl(block.src.trim())) {
          ctx.addIssue({ code: "custom", path: ["src"], message: "Image must be an uploaded file or an https:// link" });
        }
        check("alt", "Alt text", 3, 255);
        check("caption", "Caption", 0, 300);
        break;
      case "video":
        if (!block.src.trim()) {
          ctx.addIssue({ code: "custom", path: ["src"], message: "Upload a video or paste a YouTube / Vimeo link" });
        } else if (!isSafeVideoUrl(block.src.trim())) {
          ctx.addIssue({
            code: "custom",
            path: ["src"],
            message: "Video must be an uploaded file, a YouTube / Vimeo link, or an https:// video file",
          });
        }
        check("title", "Video title", 0, 200);
        check("caption", "Caption", 0, 300);
        break;
    }
  });

export type BlockFormValue = z.infer<typeof blockFormSchema>;

export function emptyBlock(type: string): BlockFormValue {
  return {
    type,
    anchor: "",
    text: "",
    items: "",
    ordered: false,
    title: "",
    tone: "info",
    attribution: "",
    src: "",
    alt: "",
    caption: "",
  };
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

export function blockFromApi(block: ApiBlock): BlockFormValue {
  const base = emptyBlock(block.type);
  switch (block.type) {
    case "heading":
      return { ...base, anchor: str(block.id), text: str(block.text) };
    case "subheading":
    case "paragraph":
      return { ...base, text: str(block.text) };
    case "list":
      return {
        ...base,
        items: Array.isArray(block.items) ? block.items.map(str).join("\n") : "",
        ordered: block.ordered === true,
      };
    case "quote":
      return { ...base, text: str(block.text), attribution: str(block.attribution) };
    case "callout":
      return {
        ...base,
        text: str(block.text),
        title: str(block.title),
        tone: block.tone === "warning" || block.tone === "success" ? block.tone : "info",
      };
    case "image":
      return { ...base, src: str(block.src), alt: str(block.alt), caption: str(block.caption) };
    case "video":
      return { ...base, src: str(block.src), title: str(block.title), caption: str(block.caption) };
    case "divider":
      return base;
    default:
      return { ...base, raw: block };
  }
}

export function blockToApi(block: BlockFormValue): ApiBlock {
  const opt = (v: string) => (v.trim() ? v.trim() : undefined);
  switch (block.type) {
    case "heading":
      return { type: "heading", ...(block.anchor ? { id: block.anchor } : {}), text: block.text.trim() };
    case "subheading":
    case "paragraph":
      return { type: block.type, text: block.text.trim() };
    case "list":
      return { type: "list", items: splitList(block.items, /\n/), ordered: block.ordered };
    case "quote":
      return { type: "quote", text: block.text.trim(), attribution: opt(block.attribution) };
    case "callout":
      return { type: "callout", tone: block.tone, title: opt(block.title), text: block.text.trim() };
    case "image":
      return { type: "image", src: block.src.trim(), alt: block.alt.trim(), caption: opt(block.caption) };
    case "video":
      return { type: "video", src: block.src.trim(), title: opt(block.title), caption: opt(block.caption) };
    case "divider":
      return { type: "divider" };
    default:
      return (block.raw as ApiBlock) ?? { type: "divider" };
  }
}

/* -------------------------------------------------------------------- Post */

export const blogPostFormSchema = z
  .object({
    title: safeText("Title", 5, 200),
    slug: slugField(160),
    excerpt: safeText("Excerpt", 20, 600),
    categoryId: z.string().min(1, "Choose a category"),
    coverImage: optionalMedia("Cover image"),
    coverAlt: safeText("Cover alt text", 0, 255),
    videoUrl: optionalVideo("Video"),
    accent: z.enum(BLOG_ACCENTS),
    icon: z.string().regex(/^([A-Za-z][A-Za-z0-9]{0,63})?$/, "Choose a valid icon"),
    body: z.array(blockFormSchema).min(1, "Add at least one content block").max(300),
    keyTakeaways: textList("Key takeaways", { sep: /\n/, maxItems: 8, maxLen: 400 }),
    faqs: z
      .array(z.object({ q: safeText("Question", 3, 300), a: safeText("Answer", 3, 2000) }))
      .max(20, "Use at most 20 FAQs"),
    tags: textList("Tags", { sep: /,/, maxItems: 20, maxLen: 40 }),
    relatedServices: z
      .array(z.string().regex(SLUG_RE))
      .max(6, "Pick at most 6 related services"),
    bylineMemberId: z.string().regex(/^\d*$/),
    seoTitle: safeText("SEO title", 0, 160),
    seoDescription: safeText("SEO description", 0, 320),
    seoKeywords: textList("Keywords", { sep: /,/, maxItems: 30, maxLen: 80 }),
    status: z.enum(["draft", "published"]),
    featured: z.boolean(),
    publishedAt: z.string().refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Pick a valid date"),
  })
  .superRefine((values, ctx) => {
    if (values.coverImage && values.coverAlt.trim().length < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["coverAlt"],
        message: "Describe the cover image (helps SEO and screen readers)",
      });
    }
  });

export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

export function emptyPostForm(): BlogPostFormValues {
  return {
    title: "",
    slug: "",
    excerpt: "",
    categoryId: "",
    coverImage: "",
    coverAlt: "",
    videoUrl: "",
    accent: "indigo",
    icon: "",
    body: [emptyBlock("paragraph")],
    keyTakeaways: "",
    faqs: [],
    tags: "",
    relatedServices: [],
    bylineMemberId: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    status: "draft",
    featured: false,
    publishedAt: "",
  };
}

export function postToForm(post: BlogPostRow): BlogPostFormValues {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    categoryId: String(post.categoryId),
    coverImage: post.coverImage ?? "",
    coverAlt: post.coverAlt ?? "",
    videoUrl: post.videoUrl ?? "",
    accent: (BLOG_ACCENTS as readonly string[]).includes(post.accent) ? post.accent : "indigo",
    icon: post.icon ?? "",
    body: (post.body ?? []).map(blockFromApi),
    keyTakeaways: (post.keyTakeaways ?? []).join("\n"),
    faqs: post.faqs ?? [],
    tags: post.tags.join(", "),
    relatedServices: post.relatedServices ?? [],
    bylineMemberId: post.bylineMemberId ? String(post.bylineMemberId) : "",
    seoTitle: post.seo?.title ?? "",
    seoDescription: post.seo?.description ?? "",
    seoKeywords: (post.seo?.keywords ?? []).join(", "),
    status: post.status,
    featured: post.featured,
    publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : "",
  };
}

export function formToPayload(values: BlogPostFormValues) {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    excerpt: values.excerpt.trim(),
    categoryId: Number(values.categoryId),
    coverImage: values.coverImage.trim() || null,
    coverAlt: values.coverAlt.trim() || null,
    videoUrl: values.videoUrl.trim() || null,
    accent: values.accent,
    icon: values.icon || null,
    body: values.body.map(blockToApi),
    keyTakeaways: splitList(values.keyTakeaways, /\n/),
    faqs: values.faqs.map((f) => ({ q: f.q.trim(), a: f.a.trim() })),
    tags: splitList(values.tags, /,/),
    relatedServices: values.relatedServices,
    bylineMemberId: values.bylineMemberId ? Number(values.bylineMemberId) : null,
    seo: {
      title: values.seoTitle.trim() || null,
      description: values.seoDescription.trim() || null,
      keywords: splitList(values.seoKeywords, /,/),
    },
    status: values.status,
    featured: values.featured,
    publishedAt: values.publishedAt || null,
  };
}

/* ----------------------------------------------------------------- Helpers */

export function blogPostUrl(slug: string) {
  return `${siteOrigin.replace(/\/$/, "")}/blog/${slug}/`;
}

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}
