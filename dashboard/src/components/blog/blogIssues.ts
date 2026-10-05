import { countWords, SECTION_IDS } from "./PublishChecklist";
import { splitList, type BlockFormValue, type BlogPostFormValues } from "./blogTypes";

/** Where in the preview an issue is pinned. Blocks use `block-<index>`. */
export type Spot = "title" | "excerpt" | "category" | "cover" | "content" | "faqs" | "seo" | `block-${number}`;

/** Where in the editor to take the user: scroll to `target`, focus `focus`. */
export type EditTarget = { target: string; focus?: string };

export type Issue = EditTarget & {
  number: number;
  label: string;
  hint: string;
  required: boolean;
  spot: Spot;
};

export const blockElementId = (index: number) => `post-block-${index}`;

export const SPOT_TARGETS: Record<Exclude<Spot, `block-${number}`>, EditTarget> = {
  title: { target: SECTION_IDS.basics, focus: "post-title" },
  excerpt: { target: SECTION_IDS.basics, focus: "post-excerpt" },
  category: { target: SECTION_IDS.category, focus: "post-category" },
  cover: { target: SECTION_IDS.media },
  content: { target: SECTION_IDS.content },
  faqs: { target: SECTION_IDS.summary },
  seo: { target: SECTION_IDS.seo, focus: "post-seo-description" },
};

export function spotTarget(spot: Spot): EditTarget {
  if (spot.startsWith("block-")) return { target: blockElementId(Number(spot.slice(6))) };
  return SPOT_TARGETS[spot as keyof typeof SPOT_TARGETS];
}

function blockProblem(block: BlockFormValue): string | null {
  switch (block.type) {
    case "heading":
    case "subheading":
      return block.text.trim() ? null : "Heading text is empty";
    case "paragraph":
      return block.text.trim() ? null : "Paragraph is empty";
    case "quote":
      return block.text.trim() ? null : "Quote text is empty";
    case "callout":
      return block.text.trim() ? null : "Callout text is empty";
    case "list":
      return splitList(block.items, /\n/).length ? null : "List has no items";
    case "image":
      if (!block.src.trim()) return "No image chosen";
      return block.alt.trim().length >= 3 ? null : "Image needs alt text (3+ characters)";
    case "video":
      return block.src.trim() ? null : "No video chosen";
    default:
      return null;
  }
}

/**
 * Everything that still needs attention, numbered in the order it appears in
 * the preview. `required` items block saving; the rest are suggestions.
 */
export function findIssues(values: BlogPostFormValues): Issue[] {
  const found: Omit<Issue, "number">[] = [];
  const add = (spot: Spot, label: string, hint: string, required: boolean, focus?: string) =>
    found.push({ spot, label, hint, required, ...spotTarget(spot), ...(focus ? { focus } : {}) });

  if (!values.categoryId) add("category", "Choose a category", "Every article belongs to one.", true);

  const title = values.title.trim();
  if (title.length < 5) add("title", title ? "Title is too short" : "Add a title", "At least 5 characters.", true);

  const excerpt = values.excerpt.trim();
  if (excerpt.length < 20) {
    add("excerpt", excerpt ? "Excerpt is too short" : "Add an excerpt", "At least 20 characters.", true);
  }

  if (values.coverImage.trim() && values.coverAlt.trim().length < 3) {
    add("cover", "Describe the cover image", "Alt text helps SEO and screen readers.", true, "post-cover-alt");
  } else if (!values.coverImage.trim()) {
    add("cover", "Add a cover image", "Used on cards and social shares. Optional.", false);
  }

  const body = values.body ?? [];
  if (body.length === 0) add("content", "Add some content", "The article has no blocks yet.", true);
  body.forEach((block, index) => {
    const problem = blockProblem(block);
    if (problem) add(`block-${index}`, `Block ${index + 1}: ${problem}`, "Fill it in or remove the block.", true);
  });

  if (body.length > 0) {
    const words = countWords(body);
    if (words < 300) add("content", "Write a bit more", `${words} words — 300+ ranks better.`, false);
    if (!body.some((b) => b.type === "heading" && b.text.trim())) {
      add("content", "Add a section heading", "Headings build the table of contents.", false);
    }
  }

  if ((values.faqs ?? []).some((f) => f.q.trim().length < 3 || f.a.trim().length < 3)) {
    add("faqs", "Finish your FAQs", "Every question needs a question and an answer (3+ characters).", true);
  }

  const searchText = (values.seoDescription || values.excerpt).trim();
  if (searchText.length < 50 || searchText.length > 160) {
    add("seo", "Adjust the search description", `${searchText.length} characters — 50–160 shows fully on Google.`, false);
  }

  return found.map((issue, i) => ({ ...issue, number: i + 1 }));
}

/** Scroll the editor to a field, focus it and flash it so it's easy to spot. */
export function jumpToEdit({ target, focus }: EditTarget) {
  const section = document.getElementById(target);
  const field = focus ? document.getElementById(focus) : null;
  const el = field ?? section;
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    const focusable =
      field ??
      section?.querySelector<HTMLElement>("input:not([type=hidden]), textarea, [contenteditable=true]");
    focusable?.focus({ preventScroll: true });
  }, 350);
  const flash = section && !field ? section : (el.closest("[data-slot=field]") as HTMLElement | null) ?? el;
  flash.classList.add("ring-2", "ring-primary/60", "ring-offset-2", "ring-offset-background");
  window.setTimeout(() => {
    flash.classList.remove("ring-2", "ring-primary/60", "ring-offset-2", "ring-offset-background");
  }, 1600);
}
