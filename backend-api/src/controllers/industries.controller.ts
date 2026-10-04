import type { Industry, Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import {
  createIndustrySchema,
  reorderIndustriesSchema,
  updateIndustrySchema,
  type IndustryInput,
} from "../lib/zod/industries.js";
import type { AuthRequest } from "../middleware/auth.js";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function parseId(raw: unknown) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function serializeIndustry(row: Industry) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    headline: row.headline,
    icon: row.icon,
    tagline: row.tagline,
    summary: row.summary,
    heroImage: row.heroImage,
    heroImageAlt: row.heroImageAlt,
    intro: asStringArray(row.intro),
    audience: asStringArray(row.audience),
    challenges: asArray(row.challenges),
    solutions: asArray(row.solutions),
    services: asStringArray(row.services),
    stats: asArray(row.stats),
    faqs: asArray(row.faqs),
    ctaTitle: row.ctaTitle,
    ctaBody: row.ctaBody,
    accent: row.accent,
    seo: row.seo,
    sortOrder: row.sortOrder,
    published: row.published,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Maps validated input onto Prisma columns, skipping keys that were not sent. */
function toData(d: Partial<IndustryInput>) {
  const json = (value: unknown) => value as Prisma.InputJsonValue;
  return {
    ...(d.slug !== undefined ? { slug: d.slug } : {}),
    ...(d.title !== undefined ? { title: d.title } : {}),
    ...(d.headline !== undefined ? { headline: d.headline } : {}),
    ...(d.icon !== undefined ? { icon: d.icon } : {}),
    ...(d.tagline !== undefined ? { tagline: d.tagline } : {}),
    ...(d.summary !== undefined ? { summary: d.summary } : {}),
    ...(d.heroImage !== undefined ? { heroImage: d.heroImage } : {}),
    ...(d.heroImageAlt !== undefined ? { heroImageAlt: d.heroImageAlt } : {}),
    ...(d.intro !== undefined ? { intro: json(d.intro) } : {}),
    ...(d.audience !== undefined ? { audience: json(d.audience) } : {}),
    ...(d.challenges !== undefined ? { challenges: json(d.challenges) } : {}),
    ...(d.solutions !== undefined ? { solutions: json(d.solutions) } : {}),
    ...(d.services !== undefined ? { services: json(d.services) } : {}),
    ...(d.stats !== undefined ? { stats: json(d.stats) } : {}),
    ...(d.faqs !== undefined ? { faqs: json(d.faqs) } : {}),
    ...(d.ctaTitle !== undefined ? { ctaTitle: d.ctaTitle } : {}),
    ...(d.ctaBody !== undefined ? { ctaBody: d.ctaBody } : {}),
    ...(d.accent !== undefined ? { accent: json(d.accent) } : {}),
    ...(d.seo !== undefined ? { seo: json(d.seo) } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
    ...(d.published !== undefined ? { published: d.published } : {}),
  };
}

async function slugTaken(slug: string, exceptId?: number) {
  const row = await prisma.industry.findUnique({
    where: { slug },
    select: { id: true },
  });
  return row !== null && row.id !== exceptId;
}

/** GET /api/industries — published industries for the marketing site. */
export const getPublicIndustries = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.industry.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    return res.status(200).json({ industries: rows.map(serializeIndustry) });
  } catch (error) {
    console.error("Public industries error:", error);
    return res.status(500).json({ message: "Failed to load industries" });
  }
};

/** GET /api/industries/:slug */
export const getPublicIndustry = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug ?? "");
    const row = await prisma.industry.findUnique({ where: { slug } });
    if (!row || !row.published) {
      return res.status(404).json({ message: "Industry not found" });
    }
    return res.status(200).json({ industry: serializeIndustry(row) });
  } catch (error) {
    console.error("Public industry error:", error);
    return res.status(500).json({ message: "Failed to load industry" });
  }
};

/** GET /api/admin/industries — every industry, hidden ones included. */
export const listAdminIndustries = async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.industry.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    return res.status(200).json({ industries: rows.map(serializeIndustry) });
  } catch (error) {
    console.error("Admin industries list error:", error);
    return res.status(500).json({ message: "Failed to load industries" });
  }
};

export const createIndustry = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createIndustrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid industry",
      });
    }
    if (await slugTaken(parsed.data.slug)) {
      return res
        .status(409)
        .json({ message: "Another industry already uses that page address" });
    }
    const d = parsed.data;
    const json = (value: unknown) => value as Prisma.InputJsonValue;
    const count = await prisma.industry.count();
    const row = await prisma.industry.create({
      data: {
        slug: d.slug,
        title: d.title,
        headline: d.headline,
        icon: d.icon,
        tagline: d.tagline,
        summary: d.summary,
        heroImage: d.heroImage,
        heroImageAlt: d.heroImageAlt,
        intro: json(d.intro),
        audience: json(d.audience),
        challenges: json(d.challenges),
        solutions: json(d.solutions),
        services: json(d.services),
        stats: json(d.stats),
        faqs: json(d.faqs),
        ctaTitle: d.ctaTitle,
        ctaBody: d.ctaBody,
        accent: json(d.accent),
        seo: json(d.seo),
        sortOrder: d.sortOrder ?? count + 1,
        published: d.published ?? true,
      },
    });
    return res
      .status(201)
      .json({ message: "Industry created", industry: serializeIndustry(row) });
  } catch (error) {
    console.error("Create industry error:", error);
    return res.status(500).json({ message: "Failed to create industry" });
  }
};

export const updateIndustry = async (req: AuthRequest, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid industry id" });
  try {
    const parsed = updateIndustrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid industry",
      });
    }
    const exists = await prisma.industry.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) return res.status(404).json({ message: "Industry not found" });
    if (parsed.data.slug && (await slugTaken(parsed.data.slug, id))) {
      return res
        .status(409)
        .json({ message: "Another industry already uses that page address" });
    }
    const row = await prisma.industry.update({
      where: { id },
      data: toData(parsed.data),
    });
    return res
      .status(200)
      .json({ message: "Industry updated", industry: serializeIndustry(row) });
  } catch (error) {
    console.error("Update industry error:", error);
    return res.status(500).json({ message: "Failed to update industry" });
  }
};

/** PUT /api/admin/industries/order — body `{ ids }` in display order. */
export const reorderIndustries = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = reorderIndustriesSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid order",
      });
    }
    const { ids } = parsed.data;
    if (new Set(ids).size !== ids.length) {
      return res
        .status(400)
        .json({ message: "Each industry can appear only once" });
    }
    const count = await prisma.industry.count({ where: { id: { in: ids } } });
    if (count !== ids.length) {
      return res.status(400).json({
        message: "Some industries no longer exist. Refresh and try again.",
      });
    }
    await prisma.$transaction(
      ids.map((industryId, index) =>
        prisma.industry.update({
          where: { id: industryId },
          data: { sortOrder: index + 1 },
        }),
      ),
    );
    return res.status(200).json({ message: "Order saved" });
  } catch (error) {
    console.error("Reorder industries error:", error);
    return res.status(500).json({ message: "Failed to save the order" });
  }
};

export const deleteIndustry = async (req: AuthRequest, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid industry id" });
  try {
    const exists = await prisma.industry.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) return res.status(404).json({ message: "Industry not found" });
    await prisma.industry.delete({ where: { id } });
    return res.status(200).json({ message: "Industry deleted" });
  } catch (error) {
    console.error("Delete industry error:", error);
    return res.status(500).json({ message: "Failed to delete industry" });
  }
};
