import {
  htmlToList,
  htmlToParagraphs,
  htmlToText,
  listToHtml,
  paragraphsToHtml,
  textToHtml,
} from "@/components/editor/SimpleEditor";
import type { ServiceDraft, ServiceStepId } from "@/lib/store/serviceEditorSlice";
import { COLOR_THEMES, DEFAULT_THEME, slugify, themeKeyFor, type GroupRow, type ServiceRow } from "./serviceTypes";

export const STEPS: { id: ServiceStepId; title: string; hint: string }[] = [
  { id: "basics", title: "Basic info", hint: "Name and category" },
  { id: "card", title: "Card look", hint: "Icon, colour, short text" },
  { id: "page", title: "Service page", hint: "What visitors read" },
  { id: "process", title: "Process & FAQ", hint: "How you work" },
  { id: "search", title: "Google search", hint: "Optional" },
];

const EMPTY_LIST = "<ul><li><p></p></li></ul>";

export function makeDraft({
  initial,
  duplicate,
  groups,
  defaultGroupId,
}: {
  initial: ServiceRow | null;
  duplicate: boolean;
  groups: GroupRow[];
  defaultGroupId?: number;
}): ServiceDraft {
  const copyTitle = initial && duplicate ? `${initial.title} (copy)` : null;
  const preferred = groups.find((g) => g.id === defaultGroupId) ?? groups[0];
  return {
    title: copyTitle ?? initial?.title ?? "",
    slug: copyTitle ? slugify(copyTitle) : (initial?.slug ?? ""),
    slugTouched: Boolean(initial && !duplicate),
    groupId: initial ? String(initial.groupId) : preferred ? String(preferred.id) : "",
    tagline: initial?.tagline ?? "",
    published: duplicate ? false : (initial?.published ?? true),
    icon: initial?.icon ?? "Sparkles",
    themeKey: initial ? themeKeyFor(initial.accent) : DEFAULT_THEME,
    summaryHtml: initial ? textToHtml(initial.summary) : "<p></p>",
    introHtml: initial ? paragraphsToHtml(initial.intro) : "<p></p>",
    deliverablesHtml: initial ? listToHtml(initial.deliverables) : EMPTY_LIST,
    idealForHtml: initial ? listToHtml(initial.idealFor) : EMPTY_LIST,
    timeline: initial?.timeline ?? "1–2 weeks",
    startingAt: initial?.startingAt ?? "Custom quote",
    processSteps: initial?.process.length
      ? initial.process.map((s) => ({ title: s.title, bodyHtml: textToHtml(s.body) }))
      : [
          { title: "Discovery call", bodyHtml: "<p></p>" },
          { title: "Delivery", bodyHtml: "<p></p>" },
        ],
    faqs: (initial?.faqs ?? []).map((f) => ({ q: f.q, aHtml: textToHtml(f.a) })),
    seoTitle: initial?.seo?.title ?? "",
    seoDescription: initial?.seo?.description ?? "",
    seoKeywords: (initial?.seo?.keywords ?? []).join(", "),
  };
}

export function themeOf(draft: ServiceDraft) {
  return COLOR_THEMES[draft.themeKey] ?? COLOR_THEMES[DEFAULT_THEME];
}

/** The body sent to the API. Also what the preview renders. */
export function buildPayload(draft: ServiceDraft) {
  const title = draft.title.trim();
  const summary = htmlToText(draft.summaryHtml);
  return {
    title,
    slug: draft.slug || slugify(draft.title),
    groupId: Number(draft.groupId),
    icon: draft.icon,
    tagline: draft.tagline.trim(),
    summary,
    intro: htmlToParagraphs(draft.introHtml),
    deliverables: htmlToList(draft.deliverablesHtml),
    idealFor: htmlToList(draft.idealForHtml),
    process: draft.processSteps
      .map((s) => ({ title: s.title.trim(), body: htmlToText(s.bodyHtml) }))
      .filter((s) => s.title || s.body),
    faqs: draft.faqs
      .map((f) => ({ q: f.q.trim(), a: htmlToText(f.aHtml) }))
      .filter((f) => f.q || f.a),
    timeline: draft.timeline.trim(),
    startingAt: draft.startingAt.trim(),
    accent: themeOf(draft).website,
    seo: {
      title: draft.seoTitle.trim() || title,
      description: draft.seoDescription.trim() || summary.slice(0, 320),
      keywords: draft.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    },
    published: draft.published,
  };
}

export type ServicePayload = ReturnType<typeof buildPayload>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Field → message for everything that blocks saving. */
export function validateService(p: ServicePayload): Record<string, string> {
  const e: Record<string, string> = {};
  if (p.title.length < 2) e.title = "Give the service a name.";
  if (!p.groupId) e.groupId = "Choose which category it belongs to.";
  if (p.tagline.length < 2) e.tagline = "Add a one-line tagline.";
  if (p.summary.length < 2) e.summary = "Write a short description.";
  if (!p.intro.length) e.intro = "Write at least one paragraph.";
  if (!p.deliverables.length) e.deliverables = "List at least one thing the client gets.";
  if (!p.idealFor.length) e.idealFor = "List at least one type of client.";
  if (!p.timeline) e.timeline = "Add a typical timeline.";
  if (!p.startingAt) e.startingAt = "Add a starting price.";
  if (!p.process.length) e.process = "Add at least one step.";
  else if (p.process.some((s) => !s.title || !s.body))
    e.process = "Every step needs both a title and a description.";
  if (p.faqs.some((f) => !f.q || !f.a)) e.faqs = "Every question needs an answer (or remove it).";
  if (!SLUG_RE.test(p.slug) || p.slug.length < 2) e.slug = "Use lowercase letters, numbers and dashes only.";
  return e;
}

export const STEP_FIELDS: Record<ServiceStepId, string[]> = {
  basics: ["title", "groupId", "tagline"],
  card: ["summary"],
  page: ["intro", "deliverables", "idealFor", "timeline", "startingAt"],
  process: ["process", "faqs"],
  search: ["slug"],
};

/* -------------------------------------------------------- Where to edit */

/** A region of the preview. Steps and questions use `process-<i>` / `faq-<i>`. */
export type ServiceSpot =
  | "status"
  | "category"
  | "title"
  | "tagline"
  | "icon"
  | "summary"
  | "intro"
  | "deliverables"
  | "idealFor"
  | "timeline"
  | "startingAt"
  | "process"
  | "faqs"
  | "seo"
  | "slug"
  | `process-${number}`
  | `faq-${number}`;

/** Which step holds the field, the element to scroll to and the one to focus. */
export type ServiceEditTarget = { step: ServiceStepId; target: string; focus?: string };

export type ServiceIssue = ServiceEditTarget & {
  number: number;
  label: string;
  hint: string;
  required: boolean;
  spot: ServiceSpot;
};

export const processStepId = (index: number) => `svc-process-${index}`;
export const faqItemId = (index: number) => `svc-faq-${index}`;

const TARGETS: Record<Exclude<ServiceSpot, `process-${number}` | `faq-${number}`>, ServiceEditTarget> = {
  status: { step: "basics", target: "svc-field-visibility" },
  category: { step: "basics", target: "svc-field-category", focus: "svcGroup" },
  title: { step: "basics", target: "svc-field-title", focus: "svcTitle" },
  tagline: { step: "basics", target: "svc-field-tagline", focus: "svcTagline" },
  icon: { step: "card", target: "svc-field-icon" },
  summary: { step: "card", target: "svc-field-summary" },
  intro: { step: "page", target: "svc-field-intro" },
  deliverables: { step: "page", target: "svc-field-deliverables" },
  idealFor: { step: "page", target: "svc-field-idealFor" },
  timeline: { step: "page", target: "svc-field-timeline", focus: "svcTimeline" },
  startingAt: { step: "page", target: "svc-field-startingAt", focus: "svcPrice" },
  process: { step: "process", target: "svc-field-process" },
  faqs: { step: "process", target: "svc-field-faqs" },
  seo: { step: "search", target: "svc-field-seoDescription", focus: "seoDesc" },
  slug: { step: "search", target: "svc-field-slug", focus: "svcSlug" },
};

export function serviceSpotTarget(spot: ServiceSpot): ServiceEditTarget {
  if (spot.startsWith("process-")) {
    return { step: "process", target: processStepId(Number(spot.slice(8))) };
  }
  if (spot.startsWith("faq-")) return { step: "process", target: faqItemId(Number(spot.slice(4))) };
  return TARGETS[spot as keyof typeof TARGETS];
}

/**
 * Everything still to do, numbered in step order. `required` items block
 * saving; the rest are suggestions.
 */
export function findServiceIssues(draft: ServiceDraft, p: ServicePayload): ServiceIssue[] {
  const found: Omit<ServiceIssue, "number">[] = [];
  const add = (spot: ServiceSpot, label: string, hint: string, required: boolean, edit?: Partial<ServiceEditTarget>) =>
    found.push({ spot, label, hint, required, ...serviceSpotTarget(spot), ...edit });

  if (!p.groupId) add("category", "Choose a category", "Services are grouped by category in the menu.", true);
  if (p.title.length < 2) add("title", "Add a service name", "Shown on the card and as the page heading.", true);
  if (p.tagline.length < 2) add("tagline", "Add a tagline", "One sentence under the page heading.", true);

  if (p.summary.length < 2) add("summary", "Write a short description", "Shown on the service card.", true);
  else if (p.summary.length > 160) {
    add("summary", "Shorten the short description", `${p.summary.length} characters — under 160 fits the card.`, false);
  }

  if (!p.intro.length) add("intro", "Write an introduction", "At least one paragraph about the service.", true);
  if (!p.deliverables.length) add("deliverables", "List what the client gets", "At least one item.", true);
  else if (p.deliverables.length < 3) {
    add("deliverables", "List a few more deliverables", "Three or more items read stronger.", false);
  }
  if (!p.idealFor.length) add("idealFor", "Say who it's for", "At least one type of client.", true);
  if (!p.timeline) add("timeline", "Add a typical timeline", "Example: 2–4 weeks.", true);
  if (!p.startingAt) add("startingAt", "Add a starting price", "Example: From $499, or Custom quote.", true);

  if (!p.process.length) add("process", "Add a work step", "Visitors like to know what happens next.", true);
  draft.processSteps.forEach((s, i) => {
    const hasTitle = s.title.trim().length > 0;
    const hasBody = htmlToText(s.bodyHtml).length > 0;
    if (hasTitle && hasBody) return;
    if (!hasTitle && !hasBody) {
      if (draft.processSteps.length === 1) return;
      add(`process-${i}`, `Step ${i + 1} is empty`, "Empty steps are skipped — fill it in or remove it.", false);
    } else if (!hasTitle) add(`process-${i}`, `Step ${i + 1} needs a name`, "Example: Discovery call.", true);
    else if (!hasBody) add(`process-${i}`, `Step ${i + 1} needs a description`, "What happens in this step?", true);
  });

  draft.faqs.forEach((f, i) => {
    const hasQ = f.q.trim().length > 0;
    const hasA = htmlToText(f.aHtml).length > 0;
    if (hasQ && hasA) return;
    if (!hasQ && !hasA) {
      add(`faq-${i}`, `Question ${i + 1} is empty`, "Empty questions are skipped — fill it in or remove it.", false);
    }
    else if (!hasQ) add(`faq-${i}`, `Question ${i + 1} is missing`, "Add the question text.", true);
    else add(`faq-${i}`, `Question ${i + 1} needs an answer`, "Answer it or remove it.", true);
  });
  if (draft.faqs.length === 0) {
    add("faqs", "Add a common question", "FAQs answer doubts and can show on Google.", false, {
      target: "svc-field-faqs",
    });
  }

  if (p.seo.title.length > 60) {
    add("seo", "Shorten the search title", `${p.seo.title.length} characters — Google cuts off after ~60.`, false, {
      target: "svc-field-seoTitle",
      focus: "seoTitle",
    });
  }
  const desc = p.seo.description;
  if (desc.length < 50 || desc.length > 160) {
    add("seo", "Adjust the search description", `${desc.length} characters — 50–160 shows fully on Google.`, false);
  }
  if (!SLUG_RE.test(p.slug) || p.slug.length < 2) {
    add("slug", "Fix the page address", "Lowercase letters, numbers and dashes only.", true);
  }

  return found.map((issue, i) => ({ ...issue, number: i + 1 }));
}
