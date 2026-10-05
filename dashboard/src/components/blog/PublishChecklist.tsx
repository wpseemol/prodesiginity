import { useWatch, type Control } from "react-hook-form";
import { CheckCircle2Icon, CircleIcon, ShieldAlertIcon, ShieldCheckIcon } from "lucide-react";
import { detectThreat } from "@/lib/security";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPostFormValues } from "./blogTypes";

export const SECTION_IDS = {
  basics: "post-section-basics",
  media: "post-section-media",
  content: "post-section-content",
  summary: "post-section-summary",
  appearance: "post-section-appearance",
  publish: "post-section-publish",
  category: "post-section-category",
  related: "post-section-related",
  seo: "post-section-seo",
} as const;

const WORDS_PER_MINUTE = 220;

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  slug: "URL slug",
  excerpt: "Excerpt",
  coverAlt: "Cover alt text",
  keyTakeaways: "Key takeaways",
  tags: "Tags",
  seoTitle: "SEO title",
  seoDescription: "Meta description",
  seoKeywords: "Keywords",
};

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

export function countWords(body: BlogPostFormValues["body"]) {
  let words = 0;
  for (const block of body) {
    const parts = block.raw
      ? collectStrings(block.raw).filter((s) => s !== block.type)
      : [block.text, block.items, block.title, block.attribution, block.caption];
    for (const part of parts) words += part.trim() ? part.trim().split(/\s+/).length : 0;
  }
  return words;
}

/** First field containing SQL or script code, as a human label. */
export function findThreat(values: BlogPostFormValues): string | null {
  const scan = (value: unknown, label: string): string | null => {
    for (const s of collectStrings(value)) if (detectThreat(s)) return label;
    return null;
  };
  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const hit = scan(values[key as keyof BlogPostFormValues], label);
    if (hit) return hit;
  }
  for (const [i, block] of values.body.entries()) {
    const hit = scan({ ...block, raw: undefined }, `Content block ${i + 1}`);
    if (hit) return hit;
  }
  for (const [i, faq] of values.faqs.entries()) {
    const hit = scan(faq, `FAQ ${i + 1}`);
    if (hit) return hit;
  }
  return null;
}

type Item = { label: string; hint: string; done: boolean; required: boolean; target: string };

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PublishChecklist({ control }: { control: Control<BlogPostFormValues> }) {
  const values = useWatch({ control }) as BlogPostFormValues;
  const body = values.body ?? [];
  const words = countWords(body);
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  const threat = findThreat({ ...values, body, faqs: values.faqs ?? [] });
  const searchText = (values.seoDescription || values.excerpt || "").trim();

  const items: Item[] = [
    {
      label: "Title",
      hint: "At least 5 characters",
      done: (values.title ?? "").trim().length >= 5,
      required: true,
      target: SECTION_IDS.basics,
    },
    {
      label: "Excerpt",
      hint: "At least 20 characters; 25–40 words reads best",
      done: (values.excerpt ?? "").trim().length >= 20,
      required: true,
      target: SECTION_IDS.basics,
    },
    {
      label: "Category",
      hint: "Every article belongs to one",
      done: Boolean(values.categoryId),
      required: true,
      target: SECTION_IDS.category,
    },
    {
      label: "Article content",
      hint: words >= 300 ? `${words} words` : `${words} words — 300+ ranks better`,
      done: words >= 300,
      required: false,
      target: SECTION_IDS.content,
    },
    {
      label: "Section headings",
      hint: "Build the table of contents",
      done: body.some((b) => b.type === "heading" && b.text.trim()),
      required: false,
      target: SECTION_IDS.content,
    },
    {
      label: "Cover image",
      hint: "With alt text, for cards and social shares",
      done: Boolean(values.coverImage?.trim()) && (values.coverAlt ?? "").trim().length >= 3,
      required: false,
      target: SECTION_IDS.media,
    },
    {
      label: "Search description",
      hint: `${searchText.length} characters — 50–160 shows fully on Google`,
      done: searchText.length >= 50 && searchText.length <= 160,
      required: false,
      target: SECTION_IDS.seo,
    },
  ];

  const requiredLeft = items.filter((i) => i.required && !i.done).length + (threat ? 1 : 0);
  const done = items.filter((i) => i.done).length + (threat ? 0 : 1);
  const total = items.length + 1;
  const percent = Math.round((done / total) * 100);

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Ready to publish?</CardTitle>
          <span className="text-xs tabular-nums text-muted-foreground">
            {done}/{total}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              requiredLeft ? "bg-amber-500" : percent === 100 ? "bg-emerald-500" : "bg-primary",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {requiredLeft
            ? `${requiredLeft} required item${requiredLeft > 1 ? "s" : ""} left before it can go live.`
            : "Everything required is done."}{" "}
          About {minutes} min read.
        </p>
      </CardHeader>
      <CardContent className="grid gap-1">
        <div
          className={cn(
            "mb-1 flex items-start gap-2 rounded-lg border px-2.5 py-2 text-xs",
            threat
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
          )}
        >
          {threat ? <ShieldAlertIcon className="mt-px size-4 shrink-0" /> : <ShieldCheckIcon className="mt-px size-4 shrink-0" />}
          <span>
            {threat
              ? `${threat} contains code or SQL that is not allowed. Remove it to save.`
              : "Safety check passed — no script or SQL code found."}
          </span>
        </div>
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => goTo(item.target)}
            className="flex items-start gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-muted"
          >
            {item.done ? (
              <CheckCircle2Icon className="mt-px size-4 shrink-0 text-emerald-500" />
            ) : (
              <CircleIcon
                className={cn("mt-px size-4 shrink-0", item.required ? "text-amber-500" : "text-muted-foreground/60")}
              />
            )}
            <span className="min-w-0">
              <span className={cn("block text-sm", item.done && "text-muted-foreground")}>
                {item.label}
                {item.required && !item.done ? <span className="ml-1 text-xs text-amber-600">required</span> : null}
              </span>
              <span className="block text-xs text-muted-foreground">{item.hint}</span>
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
