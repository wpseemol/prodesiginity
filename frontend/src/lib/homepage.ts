import { mediaUrl } from "@/config/api";
import { apiBaseUrl } from "@/config/api";
import type { PricingPlan } from "@/data/pricingData";
import type {
  HeroSide,
  HeroStat,
} from "@/components/home/hero/heroData";
import type { Project } from "@/components/home/recent-projects/RecentProjects";

export type HomepageSectionKey =
  | "hero"
  | "stats"
  | "brands"
  | "process"
  | "recentProjects"
  | "pricing";

export type HomepageSectionPayload = {
  label: string;
  content: unknown;
  updatedAt: string;
};

export type HomepageSectionsMap = Partial<
  Record<HomepageSectionKey, HomepageSectionPayload>
>;

export type HeroCmsContent = {
  pillHtml?: string;
  headlineLines?: string[];
  lede?: string;
  primaryCta?: { label?: string; href?: string };
  secondaryCta?: { label?: string; href?: string };
  sides?: HeroSide[];
  channels?: string[];
  stats?: HeroStat[];
};

export type StatsCmsItem = {
  icon?: string;
  value?: string;
  label?: string;
  description?: string;
  accent?: string;
};

export type StatsCmsContent = {
  pill?: string;
  items?: StatsCmsItem[];
};

export type BrandCmsItem = {
  name: string;
  logo: string;
  color?: string;
};

export type BrandsCmsContent = {
  brands?: BrandCmsItem[];
};

export type ProcessStepCms = {
  number?: string;
  stepFraction?: string;
  badge?: string;
  title?: string;
  description?: string;
  icon?: string;
};

export type ProcessCmsContent = {
  pill?: string;
  headline?: string;
  headlineAccent?: string;
  description?: string;
  steps?: ProcessStepCms[];
};

export type RecentProjectsCmsContent = {
  eyebrow?: string;
  headline?: string;
  headlineAccent?: string;
  description?: string;
  projects?: Project[];
};

export type PricingCmsContent = {
  pill?: string;
  headline?: string;
  headlineAccent?: string;
  description?: string;
  footerPrompt?: string;
  footerCtaLabel?: string;
  footerCtaHref?: string;
  plans?: PricingPlan[];
};

function asObj(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function sectionContent<T>(
  sections: HomepageSectionsMap | null | undefined,
  key: HomepageSectionKey,
): T | null {
  const raw = sections?.[key]?.content;
  const obj = asObj(raw);
  return obj ? (obj as T) : null;
}

/** Resolve brand / upload paths for <Image> / <img>. */
export function resolveBrandLogo(logo: string): string {
  return mediaUrl(logo) ?? logo;
}

/**
 * Fetch public homepage CMS. Safe for client + server.
 * Returns null on network/API failure so UI can keep static fallbacks.
 */
export async function fetchHomepageSections(): Promise<HomepageSectionsMap | null> {
  try {
    const res = await fetch(`${apiBaseUrl}/homepage`, {
      // Static export has no ISR; client refetch keeps dashboard edits live.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { sections?: HomepageSectionsMap };
    return data.sections ?? null;
  } catch {
    return null;
  }
}
