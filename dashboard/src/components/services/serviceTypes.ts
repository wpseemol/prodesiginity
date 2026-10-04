import { siteOrigin } from "@/config";

export type Accent = {
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  wash: string;
};

export type GroupRow = {
  id: number;
  slug: string;
  title: string;
  blurb: string;
  icon: string;
  sortOrder: number;
};

export type ServiceRow = {
  id: number;
  slug: string;
  title: string;
  groupId: number;
  group?: string;
  icon: string;
  tagline: string;
  summary: string;
  intro: string[];
  deliverables: string[];
  idealFor: string[];
  process: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  timeline: string;
  startingAt: string;
  accent: Accent;
  seo: { title: string; description: string; keywords: string[] };
  sortOrder: number;
  published: boolean;
};

/**
 * Colour themes for the website cards. `website` holds the marketing-site
 * Tailwind tokens that get saved; `preview` is the dashboard-side look-alike
 * (the dashboard stylesheet does not ship the site's brand tokens).
 */
export const COLOR_THEMES: Record<
  string,
  { label: string; swatch: string; preview: string; website: Accent }
> = {
  indigo: {
    label: "Indigo",
    swatch: "bg-indigo-500",
    preview: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    website: {
      iconBg: "bg-primary/10 dark:bg-dark-primary/15",
      iconColor: "text-primary dark:text-dark-primary",
      hoverBorder:
        "group-hover:border-primary/40 dark:group-hover:border-dark-primary/40",
      wash: "from-primary/18 via-brand-violet/12 to-brand-blue/15",
    },
  },
  violet: {
    label: "Purple",
    swatch: "bg-violet-500",
    preview: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    website: {
      iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
      iconColor: "text-brand-violet dark:text-dark-brand-violet",
      hoverBorder:
        "group-hover:border-brand-violet/40 dark:group-hover:border-dark-brand-violet/40",
      wash: "from-brand-violet/18 via-primary/12 to-brand-blue/15",
    },
  },
  blue: {
    label: "Blue",
    swatch: "bg-blue-500",
    preview: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    website: {
      iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
      iconColor: "text-brand-blue dark:text-dark-brand-blue",
      hoverBorder:
        "group-hover:border-brand-blue/40 dark:group-hover:border-dark-brand-blue/40",
      wash: "from-brand-blue/18 via-primary/12 to-cyan-400/15",
    },
  },
  emerald: {
    label: "Green",
    swatch: "bg-emerald-500",
    preview: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    website: {
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      hoverBorder: "group-hover:border-emerald-500/40",
      wash: "from-emerald-500/18 via-primary/10 to-brand-blue/15",
    },
  },
  orange: {
    label: "Orange",
    swatch: "bg-orange-500",
    preview: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    website: {
      iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
      iconColor: "text-brand-orange dark:text-dark-brand-orange",
      hoverBorder:
        "group-hover:border-brand-orange/40 dark:group-hover:border-dark-brand-orange/40",
      wash: "from-brand-orange/18 via-primary/10 to-brand-violet/15",
    },
  },
};

export const DEFAULT_THEME = "indigo";

export function themeKeyFor(accent: Accent | undefined): string {
  for (const [key, theme] of Object.entries(COLOR_THEMES)) {
    if (theme.website.iconColor === accent?.iconColor) return key;
  }
  return DEFAULT_THEME;
}

export function slugify(value: string, max = 120) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, max);
}

export const SERVICE_PATH = "/services/our-service";

export function servicePageUrl(slug: string) {
  return `${siteOrigin.replace(/\/$/, "")}${SERVICE_PATH}/${slug}/`;
}

export async function readMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return typeof data?.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}
