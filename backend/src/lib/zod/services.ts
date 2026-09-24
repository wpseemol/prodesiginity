import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens",
  );

const accentSchema = z.object({
  iconBg: z.string().trim().min(1).max(255),
  iconColor: z.string().trim().min(1).max(255),
  hoverBorder: z.string().trim().min(1).max(255),
  wash: z.string().trim().min(1).max(255),
});

const stepSchema = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(2000),
});

const faqSchema = z.object({
  q: z.string().trim().min(1).max(300),
  a: z.string().trim().min(1).max(2000),
});

const seoSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(320),
  keywords: z.array(z.string().trim().min(1).max(80)).max(40),
});

export const createServiceGroupSchema = z.object({
  slug: slugSchema.max(80),
  title: z.string().trim().min(2).max(160),
  blurb: z.string().trim().min(2).max(512),
  icon: z.string().trim().min(1).max(64),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

export const updateServiceGroupSchema = createServiceGroupSchema.partial();

export const createServiceSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(2).max(200),
  groupId: z.coerce.number().int().positive(),
  icon: z.string().trim().min(1).max(64),
  tagline: z.string().trim().min(2).max(255),
  summary: z.string().trim().min(2).max(2000),
  intro: z.array(z.string().trim().min(1).max(4000)).min(1).max(20),
  deliverables: z.array(z.string().trim().min(1).max(500)).min(1).max(40),
  idealFor: z.array(z.string().trim().min(1).max(500)).min(1).max(40),
  process: z.array(stepSchema).min(1).max(20),
  faqs: z.array(faqSchema).max(20),
  timeline: z.string().trim().min(1).max(120),
  startingAt: z.string().trim().min(1).max(120),
  accent: accentSchema,
  seo: seoSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  published: z.boolean().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

/** Accent presets — same Tailwind tokens as frontend servicesData ACCENTS. */
export const SERVICE_ACCENT_PRESETS: Record<
  string,
  z.infer<typeof accentSchema>
> = {
  violet: {
    iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
    iconColor: "text-brand-violet dark:text-dark-brand-violet",
    hoverBorder:
      "group-hover:border-brand-violet/40 dark:group-hover:border-dark-brand-violet/40",
    wash: "from-brand-violet/18 via-primary/12 to-brand-blue/15",
  },
  blue: {
    iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
    iconColor: "text-brand-blue dark:text-dark-brand-blue",
    hoverBorder:
      "group-hover:border-brand-blue/40 dark:group-hover:border-dark-brand-blue/40",
    wash: "from-brand-blue/18 via-primary/12 to-cyan-400/15",
  },
  indigo: {
    iconBg: "bg-primary/10 dark:bg-dark-primary/15",
    iconColor: "text-primary dark:text-dark-primary",
    hoverBorder:
      "group-hover:border-primary/40 dark:group-hover:border-dark-primary/40",
    wash: "from-primary/18 via-brand-violet/12 to-brand-blue/15",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "group-hover:border-emerald-500/40",
    wash: "from-emerald-500/18 via-primary/10 to-brand-blue/15",
  },
  orange: {
    iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
    iconColor: "text-brand-orange dark:text-dark-brand-orange",
    hoverBorder:
      "group-hover:border-brand-orange/40 dark:group-hover:border-dark-brand-orange/40",
    wash: "from-brand-orange/18 via-primary/10 to-brand-violet/15",
  },
};

export const SERVICE_ICON_OPTIONS = [
  "Palette",
  "ListChecks",
  "AppWindow",
  "Layout",
  "ShoppingBag",
  "PackageSearch",
  "Sparkles",
  "Megaphone",
  "SearchCheck",
  "Video",
  "Box",
  "Film",
  "BookOpen",
  "TrendingUp",
  "Store",
  "ShoppingCart",
  "SlidersHorizontal",
  "Eye",
  "Clapperboard",
  "Search",
  "Target",
  "Share2",
  "FileText",
  "Users",
  "UserCheck",
] as const;
