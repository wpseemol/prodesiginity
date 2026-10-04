import { siteOrigin } from "@/config";
import type { Accent } from "@/components/services/serviceTypes";

export type IndustryPoint = { title: string; body: string };
export type IndustryStat = { value: string; label: string };

export type IndustryRow = {
  id: number;
  slug: string;
  title: string;
  headline: string;
  icon: string;
  tagline: string;
  summary: string;
  heroImage: string | null;
  heroImageAlt: string | null;
  intro: string[];
  audience: string[];
  challenges: IndustryPoint[];
  solutions: IndustryPoint[];
  services: string[];
  stats: IndustryStat[];
  faqs: { q: string; a: string }[];
  ctaTitle: string | null;
  ctaBody: string | null;
  accent: Accent;
  seo: { title: string; description: string; keywords: string[] };
  sortOrder: number;
  published: boolean;
};

/** Just what the editor needs from GET /admin/services to pick services. */
export type ServiceOption = {
  slug: string;
  title: string;
  icon: string;
  group?: string;
  published: boolean;
};

export const INDUSTRY_PATH = "/industries";

export function industryPageUrl(slug: string) {
  return `${siteOrigin.replace(/\/$/, "")}${INDUSTRY_PATH}/${slug}/`;
}

export function defaultHeadline(title: string) {
  const name = title.trim();
  return name ? `Websites & Marketing for ${name} Companies` : "";
}
