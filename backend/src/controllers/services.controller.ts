import type { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import {
  createServiceGroupSchema,
  createServiceSchema,
  updateServiceGroupSchema,
  updateServiceSchema,
} from "../lib/zod/services";
import type { AuthRequest } from "../middleware/auth";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

function serializeService(
  row: {
    id: number;
    slug: string;
    title: string;
    groupId: number;
    icon: string;
    tagline: string;
    summary: string;
    intro: unknown;
    deliverables: unknown;
    idealFor: unknown;
    process: unknown;
    faqs: unknown;
    timeline: string;
    startingAt: string;
    accent: unknown;
    seo: unknown;
    sortOrder: number;
    published: boolean;
    updatedAt: Date;
    group?: { slug: string; title: string; blurb: string; icon: string };
  },
) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    groupId: row.groupId,
    group: row.group?.slug ?? undefined,
    groupMeta: row.group
      ? {
          slug: row.group.slug,
          title: row.group.title,
          blurb: row.group.blurb,
          icon: row.group.icon,
        }
      : undefined,
    icon: row.icon,
    tagline: row.tagline,
    summary: row.summary,
    intro: asStringArray(row.intro),
    deliverables: asStringArray(row.deliverables),
    idealFor: asStringArray(row.idealFor),
    process: row.process,
    faqs: row.faqs,
    timeline: row.timeline,
    startingAt: row.startingAt,
    accent: row.accent,
    seo: row.seo,
    sortOrder: row.sortOrder,
    published: row.published,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Public catalog for marketing site. */
export const getPublicServicesCatalog = async (_req: Request, res: Response) => {
  try {
    const [groups, services] = await Promise.all([
      prisma.serviceGroup.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.service.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: {
          group: {
            select: { slug: true, title: true, blurb: true, icon: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      groups: groups.map((g) => ({
        slug: g.slug,
        title: g.title,
        blurb: g.blurb,
        icon: g.icon,
        sortOrder: g.sortOrder,
      })),
      services: services.map((s) => serializeService(s)),
    });
  } catch (error) {
    console.error("Public services catalog error:", error);
    return res.status(500).json({ message: "Failed to load services" });
  }
};

export const listAdminServices = async (_req: AuthRequest, res: Response) => {
  try {
    const [groups, services] = await Promise.all([
      prisma.serviceGroup.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.service.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          group: {
            select: { slug: true, title: true, blurb: true, icon: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      groups,
      services: services.map((s) => serializeService(s)),
    });
  } catch (error) {
    console.error("Admin services list error:", error);
    return res.status(500).json({ message: "Failed to load services" });
  }
};

export const createServiceGroup = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createServiceGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid group",
      });
    }
    const count = await prisma.serviceGroup.count();
    const group = await prisma.serviceGroup.create({
      data: {
        ...parsed.data,
        sortOrder: parsed.data.sortOrder ?? count + 1,
      },
    });
    return res.status(201).json({ message: "Group created", group });
  } catch (error) {
    console.error("Create service group error:", error);
    return res.status(500).json({ message: "Failed to create group" });
  }
};

export const updateServiceGroup = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid group id" });
    }
    const parsed = updateServiceGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid group",
      });
    }
    const group = await prisma.serviceGroup.update({
      where: { id },
      data: parsed.data,
    });
    return res.status(200).json({ message: "Group updated", group });
  } catch (error) {
    console.error("Update service group error:", error);
    return res.status(500).json({ message: "Failed to update group" });
  }
};

export const deleteServiceGroup = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid group id" });
    }
    const linked = await prisma.service.count({ where: { groupId: id } });
    if (linked > 0) {
      return res.status(400).json({
        message: `Move or delete ${linked} service(s) in this group first.`,
      });
    }
    await prisma.serviceGroup.delete({ where: { id } });
    return res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    console.error("Delete service group error:", error);
    return res.status(500).json({ message: "Failed to delete group" });
  }
};

export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid service",
      });
    }
    const group = await prisma.serviceGroup.findUnique({
      where: { id: parsed.data.groupId },
    });
    if (!group) {
      return res.status(400).json({ message: "Service group not found" });
    }
    const count = await prisma.service.count();
    const data = parsed.data;
    const service = await prisma.service.create({
      data: {
        slug: data.slug,
        title: data.title,
        groupId: data.groupId,
        icon: data.icon,
        tagline: data.tagline,
        summary: data.summary,
        intro: data.intro as Prisma.InputJsonValue,
        deliverables: data.deliverables as Prisma.InputJsonValue,
        idealFor: data.idealFor as Prisma.InputJsonValue,
        process: data.process as Prisma.InputJsonValue,
        faqs: data.faqs as Prisma.InputJsonValue,
        timeline: data.timeline,
        startingAt: data.startingAt,
        accent: data.accent as Prisma.InputJsonValue,
        seo: data.seo as Prisma.InputJsonValue,
        sortOrder: data.sortOrder ?? count + 1,
        published: data.published ?? true,
      },
      include: {
        group: {
          select: { slug: true, title: true, blurb: true, icon: true },
        },
      },
    });
    return res.status(201).json({
      message: "Service created",
      service: serializeService(service),
    });
  } catch (error) {
    console.error("Create service error:", error);
    return res.status(500).json({ message: "Failed to create service" });
  }
};

export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid service id" });
    }
    const parsed = updateServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid service",
      });
    }
    if (parsed.data.groupId !== undefined) {
      const group = await prisma.serviceGroup.findUnique({
        where: { id: parsed.data.groupId },
      });
      if (!group) {
        return res.status(400).json({ message: "Service group not found" });
      }
    }
    const d = parsed.data;
    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(d.slug !== undefined ? { slug: d.slug } : {}),
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.groupId !== undefined ? { groupId: d.groupId } : {}),
        ...(d.icon !== undefined ? { icon: d.icon } : {}),
        ...(d.tagline !== undefined ? { tagline: d.tagline } : {}),
        ...(d.summary !== undefined ? { summary: d.summary } : {}),
        ...(d.intro !== undefined
          ? { intro: d.intro as Prisma.InputJsonValue }
          : {}),
        ...(d.deliverables !== undefined
          ? { deliverables: d.deliverables as Prisma.InputJsonValue }
          : {}),
        ...(d.idealFor !== undefined
          ? { idealFor: d.idealFor as Prisma.InputJsonValue }
          : {}),
        ...(d.process !== undefined
          ? { process: d.process as Prisma.InputJsonValue }
          : {}),
        ...(d.faqs !== undefined
          ? { faqs: d.faqs as Prisma.InputJsonValue }
          : {}),
        ...(d.timeline !== undefined ? { timeline: d.timeline } : {}),
        ...(d.startingAt !== undefined ? { startingAt: d.startingAt } : {}),
        ...(d.accent !== undefined
          ? { accent: d.accent as Prisma.InputJsonValue }
          : {}),
        ...(d.seo !== undefined
          ? { seo: d.seo as Prisma.InputJsonValue }
          : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
        ...(d.published !== undefined ? { published: d.published } : {}),
      },
      include: {
        group: {
          select: { slug: true, title: true, blurb: true, icon: true },
        },
      },
    });
    return res.status(200).json({
      message: "Service updated",
      service: serializeService(service),
    });
  } catch (error) {
    console.error("Update service error:", error);
    return res.status(500).json({ message: "Failed to update service" });
  }
};

export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid service id" });
    }
    await prisma.service.delete({ where: { id } });
    return res.status(200).json({ message: "Service deleted" });
  } catch (error) {
    console.error("Delete service error:", error);
    return res.status(500).json({ message: "Failed to delete service" });
  }
};
