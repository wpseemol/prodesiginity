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

const pointSchema = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(2000),
});

const statSchema = z.object({
  value: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1).max(120),
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

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value ? value : null));

export const createIndustrySchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(2).max(160),
  headline: z.string().trim().min(2).max(255),
  icon: z.string().trim().min(1).max(64),
  tagline: z.string().trim().min(2).max(255),
  summary: z.string().trim().min(2).max(2000),
  heroImage: optionalText(512),
  heroImageAlt: optionalText(255),
  intro: z.array(z.string().trim().min(1).max(4000)).min(1).max(20),
  audience: z.array(z.string().trim().min(1).max(200)).max(20),
  challenges: z.array(pointSchema).min(1).max(12),
  solutions: z.array(pointSchema).min(1).max(12),
  services: z.array(slugSchema).max(12),
  stats: z.array(statSchema).max(6),
  faqs: z.array(faqSchema).max(20),
  ctaTitle: optionalText(200),
  ctaBody: optionalText(600),
  accent: accentSchema,
  seo: seoSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  published: z.boolean().optional(),
});

export const updateIndustrySchema = createIndustrySchema.partial();

export const reorderIndustriesSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1).max(500),
});

export type IndustryInput = z.infer<typeof createIndustrySchema>;
