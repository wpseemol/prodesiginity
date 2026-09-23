export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "stats",
  "brands",
  "process",
  "recentProjects",
  "pricing",
  "team",
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

export type SectionPayload = {
  label: string;
  content: Record<string, unknown>;
  updatedAt: string;
};

export type SectionFormProps = {
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

export const SECTION_HINTS: Record<HomepageSectionKey, string> = {
  hero: "Headline, CTAs, side cards, channel chips, hero stats",
  stats: "Numbers / feature tiles under the hero",
  brands: "Create, edit, or delete brand logos — name, color, banner image",
  process: "How we work steps",
  recentProjects: "Add or edit videos — upload file + thumbnail",
  pricing: "Pricing plans and footer CTA",
  team: "Team section headings + member cards (photos)",
};

export const TEXTAREA_CLASS =
  "min-h-[88px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
