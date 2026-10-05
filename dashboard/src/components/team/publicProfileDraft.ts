import type { PublicProfileDraft } from "@/lib/store/publicProfileSlice";
import { SOCIAL_FIELDS, type SocialKey } from "./StaffProfileExtras";

/**
 * Mirrors the website's frontend/src/data/staffStyles.ts closely enough for
 * the dashboard preview: colours, default skills, avatar frame and CTA.
 */
type StyleKey = "lead" | "designer" | "graphic" | "developer" | "animator" | "marketing" | "people";

export type PreviewStyle = {
  key: StyleKey;
  label: string;
  gradient: string;
  text: string;
  chip: string;
  avatarShape: "circle" | "squircle" | "hexagon" | "blob";
  focus: string[];
  cta: string;
};

const STYLES: Record<StyleKey, PreviewStyle> = {
  lead: {
    key: "lead",
    label: "Founder & Creative Lead",
    gradient: "from-amber-400 via-fuchsia-500 to-indigo-600",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    chip: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
    avatarShape: "hexagon",
    focus: ["Creative Direction", "Product CGI", "Client Strategy", "Quality Control", "Studio Operations"],
    cta: "Start a project",
  },
  designer: {
    key: "designer",
    label: "3D Product Designer",
    gradient: "from-violet-600 via-indigo-600 to-blue-600",
    text: "text-violet-600 dark:text-violet-400",
    chip: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    avatarShape: "squircle",
    focus: ["Product CGI", "3D Modeling", "Lighting & Materials", "Packshot Renders", "Exploded Views"],
    cta: "Brief a render",
  },
  graphic: {
    key: "graphic",
    label: "Graphic Designer",
    gradient: "from-fuchsia-500 via-pink-500 to-orange-400",
    text: "text-pink-600 dark:text-pink-400",
    chip: "border-pink-500/25 bg-pink-500/10 text-pink-700 dark:text-pink-300",
    avatarShape: "blob",
    focus: ["Brand Identity", "Packaging Design", "Listing Graphics", "Social Creatives", "Print & Layout"],
    cta: "Commission a design",
  },
  developer: {
    key: "developer",
    label: "Developer",
    gradient: "from-emerald-500 via-green-500 to-lime-400",
    text: "text-emerald-600 dark:text-emerald-400",
    chip: "border-emerald-500/25 bg-emerald-500/10 font-mono text-emerald-700 dark:text-emerald-300",
    avatarShape: "circle",
    focus: ["Shopify Themes", "Next.js & React", "Performance", "Conversion UX", "Integrations"],
    cta: "Scope a build",
  },
  animator: {
    key: "animator",
    label: "Artist & Animator",
    gradient: "from-amber-400 via-orange-500 to-red-500",
    text: "text-orange-600 dark:text-orange-400",
    chip: "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    avatarShape: "circle",
    focus: ["2D Animation", "Motion Graphics", "Explainer Videos", "Illustration", "Storyboarding"],
    cta: "Plan an animation",
  },
  marketing: {
    key: "marketing",
    label: "Marketing & SEO",
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    text: "text-sky-600 dark:text-sky-400",
    chip: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    avatarShape: "squircle",
    focus: ["SEO", "Paid Social", "Google Ads", "Analytics", "Content Strategy"],
    cta: "Grow your store",
  },
  people: {
    key: "people",
    label: "People & Operations",
    gradient: "from-cyan-500 via-teal-500 to-emerald-400",
    text: "text-teal-600 dark:text-teal-400",
    chip: "border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300",
    avatarShape: "circle",
    focus: ["Recruiting", "Team Culture", "Onboarding", "Operations", "Client Care"],
    cta: "Get in touch",
  },
};

/** Order matters: "Web Developer & Designer" is a developer, not a designer. */
const ROLE_RULES: [RegExp, StyleKey][] = [
  [/graphic|brand|print|packag|illustrat/i, "graphic"],
  [/animat|motion|2d|video|vfx/i, "animator"],
  [/develop|engineer|shopify|web|code|program/i, "developer"],
  [/seo|market|advert|\bads\b|growth|social|content|creator/i, "marketing"],
  [/\bhr\b|human|people|recruit|operation|manager|admin/i, "people"],
  [/3d|product|model|render|cgi|design/i, "designer"],
];

export function resolvePreviewStyle(profileStyle: string, role: string, isLead: boolean): PreviewStyle {
  if (profileStyle in STYLES) return STYLES[profileStyle as StyleKey];
  if (isLead) return STYLES.lead;
  const match = ROLE_RULES.find(([pattern]) => pattern.test(role));
  return STYLES[match?.[1] ?? "designer"];
}

export function resolveShape(avatarShape: string, style: PreviewStyle): PreviewStyle["avatarShape"] {
  return avatarShape === "circle" || avatarShape === "squircle" || avatarShape === "hexagon" || avatarShape === "blob"
    ? avatarShape
    : style.avatarShape;
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || "Your";

/** Same split the website uses for the "About" paragraphs. */
export const bioParagraphs = (description: string) =>
  description
    .trim()
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export const SOCIAL_URL = /^https?:\/\/[^\s]+\.[^\s]+/i;

/** Filled-in socials in website order, with whether each URL is usable. */
export function socialList(socials: PublicProfileDraft["extras"]["socials"]) {
  return SOCIAL_FIELDS.flatMap((field) => {
    const url = socials[field.key]?.trim();
    return url ? [{ ...field, url, valid: SOCIAL_URL.test(url) }] : [];
  });
}

/** "@handle" from a profile URL; the hostname for websites. */
export function socialHandle(key: SocialKey, url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (key === "website") return host;
    const last = parsed.pathname.split("/").filter(Boolean).pop();
    if (!last || last.includes(".")) return host;
    return `@${decodeURIComponent(last).replace(/^@/, "")}`;
  } catch {
    return url;
  }
}

/* -------------------------------------------------------- Where to edit */

export type ProfileSpot =
  | "name"
  | "role"
  | "tagline"
  | "bio"
  | "image"
  | "style"
  | "frame"
  | "skills"
  | "socials"
  | `social-${SocialKey}`;

export type ProfileEditTarget = { target: string; focus?: string };

export type ProfileIssue = ProfileEditTarget & {
  number: number;
  label: string;
  hint: string;
  required: boolean;
  spot: ProfileSpot;
};

const TARGETS: Record<Exclude<ProfileSpot, `social-${string}`>, ProfileEditTarget> = {
  name: { target: "pp-field-name", focus: "staffName" },
  role: { target: "pp-field-role" },
  tagline: { target: "pp-field-tagline", focus: "staffTagline" },
  bio: { target: "pp-field-bio", focus: "staffDescription" },
  image: { target: "pp-field-images" },
  style: { target: "staff-field-style" },
  frame: { target: "staff-field-frame" },
  skills: { target: "staff-field-skills", focus: "staff-skills" },
  socials: { target: "staff-field-socials" },
};

export function profileSpotTarget(spot: ProfileSpot): ProfileEditTarget {
  if (spot.startsWith("social-")) {
    const key = spot.slice("social-".length);
    return { target: "staff-field-socials", focus: `staff-social-${key}` };
  }
  return TARGETS[spot as keyof typeof TARGETS];
}

/** Everything still to do, in page order. `required` items block saving. */
export function findProfileIssues(draft: PublicProfileDraft, hasImage: boolean): ProfileIssue[] {
  const found: Omit<ProfileIssue, "number">[] = [];
  const add = (spot: ProfileSpot, label: string, hint: string, required: boolean) =>
    found.push({ spot, label, hint, required, ...profileSpotTarget(spot) });

  if (draft.name.trim().length < 2) add("name", "Add your name", "At least 2 characters.", true);
  if (!hasImage) add("image", "Add a photo or avatar", "Without one, your initials are shown.", false);
  if (!draft.tagline.trim()) add("tagline", "Add a short tagline", "One line under your name on the team page.", false);

  const bio = draft.description.trim();
  if (!bio) add("bio", "Write a short bio", "Until then visitors see a generic paragraph.", false);
  else if (bio.length < 120) add("bio", "Say a bit more in your bio", `${bio.length} characters — 2–3 sentences work best.`, false);

  if (draft.extras.skills.length === 0) {
    add("skills", "Add your own skills", "Until then the style's default skills are shown.", false);
  } else if (draft.extras.skills.length < 3) {
    add("skills", "Add a few more skills", `${draft.extras.skills.length} listed — 3 to 6 reads best.`, false);
  }

  const socials = socialList(draft.extras.socials);
  for (const s of socials) {
    if (!s.valid) add(`social-${s.key}`, `Fix the ${s.label} link`, "Use the full address starting with https://", true);
  }
  if (socials.length === 0) {
    add("socials", "Link a social account", "Visitors can find your work and follow you.", false);
  }

  return found.map((issue, i) => ({ ...issue, number: i + 1 }));
}
