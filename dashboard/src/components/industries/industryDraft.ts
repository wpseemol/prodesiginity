import {
  htmlToList,
  htmlToParagraphs,
  htmlToText,
  listToHtml,
  paragraphsToHtml,
  textToHtml,
} from "@/components/editor/SimpleEditor";
import { COLOR_THEMES, DEFAULT_THEME, slugify, themeKeyFor } from "@/components/services/serviceTypes";
import type {
  IndustryDraft,
  IndustryPointDraft,
  IndustryStepId,
} from "@/lib/store/industryEditorSlice";
import { defaultHeadline, type IndustryRow, type IndustryStat, type ServiceOption } from "./industryTypes";

export const STEPS: { id: IndustryStepId; title: string; hint: string }[] = [
  { id: "basics", title: "Basic info", hint: "Name and page heading" },
  { id: "card", title: "Card look", hint: "Icon, colour, short text" },
  { id: "page", title: "Page intro", hint: "Image, intro, audience" },
  { id: "problems", title: "Problems & help", hint: "Pain points, solutions" },
  { id: "services", title: "Services & FAQ", hint: "Linked services, CTA" },
  { id: "search", title: "Google search", hint: "Optional" },
];

export const MAX_SERVICES = 12;

const EMPTY_LIST = "<ul><li><p></p></li></ul>";

const DEFAULT_STATS: IndustryStat[] = [
  { value: "24/7", label: "Online booking & quote capture" },
  { value: "3–5 wks", label: "Typical website launch" },
  { value: "1 team", label: "Web, SEO, ads & branding" },
];

function toPointDrafts(points: { title: string; body: string }[] | undefined): IndustryPointDraft[] {
  return points?.length
    ? points.map((p) => ({ title: p.title, bodyHtml: textToHtml(p.body) }))
    : [{ title: "", bodyHtml: "<p></p>" }];
}

export function makeDraft(initial: IndustryRow | null): IndustryDraft {
  return {
    title: initial?.title ?? "",
    headline: initial?.headline ?? "",
    headlineTouched: initial !== null,
    slug: initial?.slug ?? "",
    slugTouched: initial !== null,
    tagline: initial?.tagline ?? "",
    published: initial?.published ?? true,
    icon: initial?.icon ?? "Building2",
    themeKey: initial ? themeKeyFor(initial.accent) : DEFAULT_THEME,
    summaryHtml: initial ? textToHtml(initial.summary) : "<p></p>",
    heroImage: initial?.heroImage ?? "",
    heroImageAlt: initial?.heroImageAlt ?? "",
    introHtml: initial ? paragraphsToHtml(initial.intro) : "<p></p>",
    audienceHtml: initial?.audience.length ? listToHtml(initial.audience) : EMPTY_LIST,
    stats: (initial ? initial.stats : DEFAULT_STATS).map((s) => ({ ...s })),
    challenges: toPointDrafts(initial?.challenges),
    solutions: toPointDrafts(initial?.solutions),
    services: [...(initial?.services ?? [])],
    faqs: (initial?.faqs ?? []).map((f) => ({ q: f.q, aHtml: textToHtml(f.a) })),
    ctaTitle: initial?.ctaTitle ?? "",
    ctaBody: initial?.ctaBody ?? "",
    seoTitle: initial?.seo?.title ?? "",
    seoDescription: initial?.seo?.description ?? "",
    seoKeywords: (initial?.seo?.keywords ?? []).join(", "),
  };
}

export function themeOf(draft: IndustryDraft) {
  return COLOR_THEMES[draft.themeKey] ?? COLOR_THEMES[DEFAULT_THEME];
}

/** Matches the website's inSentence(): keeps acronyms like HVAC, lowercases the rest. */
export function inSentence(phrase: string): string {
  return phrase
    .split(" ")
    .map((word) => (/^[A-Z0-9]{2,}$/.test(word) ? word : word.toLowerCase()))
    .join(" ");
}

const points = (list: IndustryPointDraft[]) =>
  list
    .map((p) => ({ title: p.title.trim(), body: htmlToText(p.bodyHtml) }))
    .filter((p) => p.title || p.body);

/** The body sent to the API. Also what the preview renders. */
export function buildPayload(draft: IndustryDraft) {
  const title = draft.title.trim();
  const summary = htmlToText(draft.summaryHtml);
  return {
    title,
    headline: draft.headline.trim() || defaultHeadline(draft.title),
    slug: draft.slug || slugify(draft.title),
    icon: draft.icon,
    tagline: draft.tagline.trim(),
    summary,
    heroImage: draft.heroImage.trim() || null,
    heroImageAlt: draft.heroImageAlt.trim() || null,
    intro: htmlToParagraphs(draft.introHtml),
    audience: htmlToList(draft.audienceHtml),
    challenges: points(draft.challenges),
    solutions: points(draft.solutions),
    services: draft.services,
    stats: draft.stats
      .map((s) => ({ value: s.value.trim(), label: s.label.trim() }))
      .filter((s) => s.value || s.label),
    faqs: draft.faqs
      .map((f) => ({ q: f.q.trim(), a: htmlToText(f.aHtml) }))
      .filter((f) => f.q || f.a),
    ctaTitle: draft.ctaTitle.trim() || null,
    ctaBody: draft.ctaBody.trim() || null,
    accent: themeOf(draft).website,
    seo: {
      title: draft.seoTitle.trim() || `${title} Website Design & Marketing`,
      description: draft.seoDescription.trim() || summary.slice(0, 320),
      keywords: draft.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    },
    published: draft.published,
  };
}

export type IndustryPayload = ReturnType<typeof buildPayload>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Field → message for everything that blocks saving. */
export function validateIndustry(p: IndustryPayload): Record<string, string> {
  const e: Record<string, string> = {};
  if (p.title.length < 2) e.title = "Give the industry a name.";
  if (p.headline.length < 2) e.headline = "Add a page heading.";
  if (p.tagline.length < 2) e.tagline = "Add a one-line tagline.";
  if (p.summary.length < 2) e.summary = "Write a short description.";
  if (!p.intro.length) e.intro = "Write at least one paragraph.";
  if (p.stats.some((s) => !s.value || !s.label))
    e.stats = "Every highlight needs both a number and a label (or remove it).";
  if (!p.challenges.length) e.challenges = "Add at least one problem.";
  else if (p.challenges.some((x) => !x.title || !x.body))
    e.challenges = "Every problem needs a title and a description.";
  if (!p.solutions.length) e.solutions = "Add at least one way you help.";
  else if (p.solutions.some((x) => !x.title || !x.body))
    e.solutions = "Every point needs a title and a description.";
  if (p.faqs.some((f) => !f.q || !f.a)) e.faqs = "Every question needs an answer (or remove it).";
  if (!SLUG_RE.test(p.slug) || p.slug.length < 2) e.slug = "Use lowercase letters, numbers and dashes only.";
  return e;
}

export const STEP_FIELDS: Record<IndustryStepId, string[]> = {
  basics: ["title", "headline", "tagline"],
  card: ["summary"],
  page: ["intro", "stats"],
  problems: ["challenges", "solutions"],
  services: ["faqs"],
  search: ["slug"],
};

/* -------------------------------------------------------- Where to edit */

/** A region of the preview. List items use `<kind>-<index>`. */
export type IndustrySpot =
  | "status"
  | "title"
  | "headline"
  | "tagline"
  | "icon"
  | "summary"
  | "hero"
  | "stats"
  | "intro"
  | "audience"
  | "challenges"
  | "solutions"
  | "services"
  | "faqs"
  | "cta"
  | "seo"
  | "slug"
  | `stat-${number}`
  | `challenge-${number}`
  | `solution-${number}`
  | `faq-${number}`;

/** Which step holds the field, the element to scroll to and the one to focus. */
export type IndustryEditTarget = { step: IndustryStepId; target: string; focus?: string };

export type IndustryIssue = IndustryEditTarget & {
  number: number;
  label: string;
  hint: string;
  required: boolean;
  spot: IndustrySpot;
};

export const statItemId = (i: number) => `ind-stat-${i}`;
export const challengeItemId = (i: number) => `ind-challenge-${i}`;
export const solutionItemId = (i: number) => `ind-solution-${i}`;
export const faqItemId = (i: number) => `ind-faq-${i}`;

type FixedSpot = Exclude<IndustrySpot, `${"stat" | "challenge" | "solution" | "faq"}-${number}`>;

const TARGETS: Record<FixedSpot, IndustryEditTarget> = {
  status: { step: "basics", target: "ind-field-visibility" },
  title: { step: "basics", target: "ind-field-title", focus: "indTitle" },
  headline: { step: "basics", target: "ind-field-headline", focus: "indHeadline" },
  tagline: { step: "basics", target: "ind-field-tagline", focus: "indTagline" },
  icon: { step: "card", target: "ind-field-icon" },
  summary: { step: "card", target: "ind-field-summary" },
  hero: { step: "page", target: "ind-field-hero" },
  stats: { step: "page", target: "ind-field-stats" },
  intro: { step: "page", target: "ind-field-intro" },
  audience: { step: "page", target: "ind-field-audience" },
  challenges: { step: "problems", target: "ind-field-challenges" },
  solutions: { step: "problems", target: "ind-field-solutions" },
  services: { step: "services", target: "ind-field-services" },
  faqs: { step: "services", target: "ind-field-faqs" },
  cta: { step: "services", target: "ind-field-cta", focus: "indCtaTitle" },
  seo: { step: "search", target: "ind-field-seoDescription", focus: "indSeoDesc" },
  slug: { step: "search", target: "ind-field-slug", focus: "indSlug" },
};

export function industrySpotTarget(spot: IndustrySpot): IndustryEditTarget {
  const m = spot.match(/^(stat|challenge|solution|faq)-(\d+)$/);
  if (m) {
    const i = Number(m[2]);
    if (m[1] === "stat") return { step: "page", target: statItemId(i) };
    if (m[1] === "challenge") return { step: "problems", target: challengeItemId(i) };
    if (m[1] === "solution") return { step: "problems", target: solutionItemId(i) };
    return { step: "services", target: faqItemId(i) };
  }
  return TARGETS[spot as FixedSpot];
}

/**
 * Everything still to do, numbered in step order. `required` items block
 * saving; the rest are suggestions.
 */
export function findIndustryIssues(
  draft: IndustryDraft,
  p: IndustryPayload,
  serviceOptions: ServiceOption[],
): IndustryIssue[] {
  const found: Omit<IndustryIssue, "number">[] = [];
  const add = (
    spot: IndustrySpot,
    label: string,
    hint: string,
    required: boolean,
    edit?: Partial<IndustryEditTarget>,
  ) => found.push({ spot, label, hint, required, ...industrySpotTarget(spot), ...edit });

  // Basic info
  if (p.title.length < 2) add("title", "Add an industry name", "Shown in the menu and on the card.", true);
  if (p.headline.length < 2) add("headline", "Add a page heading", "The big title on the page.", true);
  if (p.tagline.length < 2) add("tagline", "Add a tagline", "One sentence under the heading.", true);

  // Card
  if (p.summary.length < 2) add("summary", "Write a short description", "Shown on the industry card.", true);
  else if (p.summary.length > 200) {
    add("summary", "Shorten the short description", `${p.summary.length} characters — under 200 fits the card.`, false);
  }

  // Page intro
  if (p.heroImage && !p.heroImageAlt) {
    add("hero", "Describe the hero image", "Helps Google and screen readers.", false, { focus: "indHeroAlt" });
  }
  draft.stats.forEach((s, i) => {
    const hasValue = s.value.trim().length > 0;
    const hasLabel = s.label.trim().length > 0;
    if (hasValue && hasLabel) return;
    if (!hasValue && !hasLabel) {
      add(`stat-${i}`, `Highlight ${i + 1} is empty`, "Empty highlights are skipped — fill it in or remove it.", false);
    } else if (!hasValue) add(`stat-${i}`, `Highlight ${i + 1} needs a number`, "Example: 120+", true);
    else add(`stat-${i}`, `Highlight ${i + 1} needs a label`, "What the number means.", true);
  });
  if (!p.intro.length) add("intro", "Write an introduction", "At least one paragraph.", true);
  if (!p.audience.length) {
    add("audience", "Say who you work with", "Types of businesses, one per line.", false);
  }

  // Problems & help
  const pointIssues = (
    list: IndustryPointDraft[],
    kind: "challenge" | "solution",
    noun: string,
    whole: "challenges" | "solutions",
    ideal: number,
  ) => {
    const filled = points(list);
    if (!filled.length) add(whole, `Add a ${noun}`, "At least one is required.", true);
    list.forEach((item, i) => {
      const hasTitle = item.title.trim().length > 0;
      const hasBody = htmlToText(item.bodyHtml).length > 0;
      if (hasTitle && hasBody) return;
      if (!hasTitle && !hasBody) {
        if (list.length === 1) return;
        add(`${kind}-${i}`, `${cap(noun)} ${i + 1} is empty`, "Empty items are skipped — fill it in or remove it.", false);
      } else if (!hasTitle) add(`${kind}-${i}`, `${cap(noun)} ${i + 1} needs a title`, "A short heading.", true);
      else add(`${kind}-${i}`, `${cap(noun)} ${i + 1} needs a description`, "A sentence or two.", true);
    });
    const complete = filled.filter((x) => x.title && x.body).length;
    if (complete > 0 && complete < ideal) {
      add(whole, `Add more ${noun}s`, `${ideal}+ work best — you have ${complete}.`, false);
    }
  };
  pointIssues(draft.challenges, "challenge", "problem", "challenges", 3);
  pointIssues(draft.solutions, "solution", "point", "solutions", 4);

  // Services & FAQ
  const missing = draft.services.filter((s) => !serviceOptions.some((o) => o.slug === s));
  if (missing.length) {
    add("services", "Some linked services no longer exist", `${missing.join(", ")} will be skipped.`, false);
  } else if (draft.services.length === 0) {
    add("services", "Link related services", "Shows visitors what you can do for them.", false);
  }
  draft.faqs.forEach((f, i) => {
    const hasQ = f.q.trim().length > 0;
    const hasA = htmlToText(f.aHtml).length > 0;
    if (hasQ && hasA) return;
    if (!hasQ && !hasA) {
      add(`faq-${i}`, `Question ${i + 1} is empty`, "Empty questions are skipped — fill it in or remove it.", false);
    } else if (!hasQ) add(`faq-${i}`, `Question ${i + 1} is missing`, "Add the question text.", true);
    else add(`faq-${i}`, `Question ${i + 1} needs an answer`, "Answer it or remove it.", true);
  });
  if (draft.faqs.length === 0) add("faqs", "Add a common question", "FAQs answer doubts and can show on Google.", false);

  // Google
  if (p.seo.title.length > 60) {
    add("seo", "Shorten the search title", `${p.seo.title.length} characters — Google cuts off after ~60.`, false, {
      target: "ind-field-seoTitle",
      focus: "indSeoTitle",
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

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
