import { SECTION_IDS } from "./PublishChecklist";
import {
  ACCENT_SWATCH,
  splitList,
  type BlogAccent,
  type BlogPostFormValues,
  type BylineMember,
  type ServiceOption,
} from "./blogTypes";

export type FieldKey = keyof BlogPostFormValues;

/** Names needed to turn ids and slugs into words people recognise. */
export type ChangeContext = {
  categories: { id: number; name: string }[];
  members: BylineMember[];
  services: ServiceOption[];
};

export type Change = {
  key: FieldKey;
  label: string;
  section: string;
  /** Short before/after values for simple fields. */
  before?: string;
  after?: string;
  /** One-line description for lists and content blocks. */
  summary?: string;
};

type FieldInfo = { key: FieldKey; label: string; section: string };

/** Display order matches the editor, top to bottom. */
const FIELDS: FieldInfo[] = [
  { key: "title", label: "Title", section: SECTION_IDS.basics },
  { key: "slug", label: "URL slug", section: SECTION_IDS.basics },
  { key: "excerpt", label: "Excerpt", section: SECTION_IDS.basics },
  { key: "coverImage", label: "Cover image", section: SECTION_IDS.media },
  { key: "coverAlt", label: "Cover alt text", section: SECTION_IDS.media },
  { key: "videoUrl", label: "Featured video", section: SECTION_IDS.media },
  { key: "body", label: "Article content", section: SECTION_IDS.content },
  { key: "keyTakeaways", label: "Key takeaways", section: SECTION_IDS.summary },
  { key: "faqs", label: "FAQs", section: SECTION_IDS.summary },
  { key: "accent", label: "Colour", section: SECTION_IDS.appearance },
  { key: "icon", label: "Icon", section: SECTION_IDS.appearance },
  { key: "status", label: "Status", section: SECTION_IDS.publish },
  { key: "publishedAt", label: "Publish date", section: SECTION_IDS.publish },
  { key: "featured", label: "Featured", section: SECTION_IDS.publish },
  { key: "bylineMemberId", label: "Byline", section: SECTION_IDS.publish },
  { key: "categoryId", label: "Category", section: SECTION_IDS.category },
  { key: "tags", label: "Tags", section: SECTION_IDS.category },
  { key: "relatedServices", label: "Related services", section: SECTION_IDS.related },
  { key: "seoTitle", label: "SEO title", section: SECTION_IDS.seo },
  { key: "seoDescription", label: "Meta description", section: SECTION_IDS.seo },
  { key: "seoKeywords", label: "Keywords", section: SECTION_IDS.seo },
];

export const SECTION_FIELDS: Record<string, FieldKey[]> = FIELDS.reduce<Record<string, FieldKey[]>>(
  (acc, field) => {
    (acc[field.section] ??= []).push(field.key);
    return acc;
  },
  {},
);

const EMPTY = "(empty)";
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const fileName = (url: string) => (url ? decodeURIComponent(url.split("/").pop() || url) : "(none)");

/** "2 edited · 1 added" style summary for an ordered list. */
function listSummary(before: unknown[], after: unknown[], noun: string) {
  const shared = Math.min(before.length, after.length);
  let edited = 0;
  for (let i = 0; i < shared; i++) if (!same(before[i], after[i])) edited += 1;
  const parts: string[] = [];
  if (edited) parts.push(`${plural(edited, noun)} edited`);
  if (after.length > before.length) parts.push(`${after.length - before.length} added`);
  if (before.length > after.length) parts.push(`${before.length - after.length} removed`);
  return parts.length ? parts.join(" · ") : `${noun}s reordered`;
}

function setSummary(before: string[], after: string[], name: (v: string) => string) {
  const added = after.filter((v) => !before.includes(v)).map(name);
  const removed = before.filter((v) => !after.includes(v)).map(name);
  const parts: string[] = [];
  if (added.length) parts.push(`Added ${added.join(", ")}`);
  if (removed.length) parts.push(`Removed ${removed.join(", ")}`);
  return parts.length ? parts.join(" · ") : "Order changed";
}

function describe(field: FieldInfo, before: BlogPostFormValues, after: BlogPostFormValues, ctx: ChangeContext): Change {
  const base = { key: field.key, label: field.label, section: field.section };
  const text = (v: string) => v.trim() || EMPTY;

  switch (field.key) {
    case "body":
      return { ...base, summary: listSummary(before.body, after.body, "block") };
    case "faqs":
      return { ...base, summary: listSummary(before.faqs, after.faqs, "question") };
    case "keyTakeaways":
      return {
        ...base,
        summary: listSummary(splitList(before.keyTakeaways, /\n/), splitList(after.keyTakeaways, /\n/), "takeaway"),
      };
    case "relatedServices": {
      const title = (slug: string) => ctx.services.find((s) => s.slug === slug)?.title ?? slug;
      return { ...base, summary: setSummary(before.relatedServices, after.relatedServices, title) };
    }
    case "coverImage":
    case "videoUrl":
      return { ...base, before: fileName(before[field.key]), after: fileName(after[field.key]) };
    case "status": {
      const label = (v: string) => (v === "published" ? "Published" : "Draft");
      return { ...base, before: label(before.status), after: label(after.status) };
    }
    case "featured":
      return { ...base, before: before.featured ? "On" : "Off", after: after.featured ? "On" : "Off" };
    case "publishedAt": {
      const label = (v: string) => v || "Today (when published)";
      return { ...base, before: label(before.publishedAt), after: label(after.publishedAt) };
    }
    case "accent": {
      const label = (v: BlogAccent) => ACCENT_SWATCH[v]?.label ?? v;
      return { ...base, before: label(before.accent), after: label(after.accent) };
    }
    case "icon": {
      const label = (v: string) => v || "Category icon";
      return { ...base, before: label(before.icon), after: label(after.icon) };
    }
    case "categoryId": {
      const label = (v: string) => ctx.categories.find((c) => String(c.id) === v)?.name ?? "(none)";
      return { ...base, before: label(before.categoryId), after: label(after.categoryId) };
    }
    case "bylineMemberId": {
      const label = (v: string) => ctx.members.find((m) => String(m.id) === v)?.name ?? "Article author";
      return { ...base, before: label(before.bylineMemberId), after: label(after.bylineMemberId) };
    }
    case "slug":
      return { ...base, before: `/blog/${before.slug}`, after: `/blog/${after.slug}` };
    default:
      return { ...base, before: text(String(before[field.key])), after: text(String(after[field.key])) };
  }
}

/** Every field that differs between two versions, in editor order. */
export function diffPost(
  before: BlogPostFormValues,
  after: BlogPostFormValues,
  ctx: ChangeContext,
): Change[] {
  return FIELDS.filter((field) => !same(before[field.key], after[field.key])).map((field) =>
    describe(field, before, after, ctx),
  );
}

export function changedKeys(before: BlogPostFormValues, after: Partial<BlogPostFormValues>, keys: FieldKey[]) {
  return keys.filter((key) => !same(before[key], after[key]));
}
