import type { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { scanForThreats, threatMessage } from "../lib/security.js";
import {
  DEFAULT_CAREERS_PAGE,
  careerJobSchema,
  careersPageSchema,
  reorderCareerJobsSchema,
  updateCareerJobSchema,
  type CareersPageContent,
} from "../lib/zod/careersContent.js";
import type { AuthRequest } from "../middleware/auth.js";

const PAGE_KEY = "default";

const jobSelect = {
  id: true,
  title: true,
  department: true,
  type: true,
  location: true,
  experience: true,
  salary: true,
  description: true,
  published: true,
  sortOrder: true,
  updatedAt: true,
} satisfies Prisma.CareerJobSelect;

function parseId(raw: unknown) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Stored copy that no longer passes validation falls back to the defaults. */
async function loadPageContent(): Promise<CareersPageContent> {
  const row = await prisma.careersPage.findUnique({ where: { key: PAGE_KEY } });
  if (!row) return DEFAULT_CAREERS_PAGE;
  const parsed = careersPageSchema.safeParse(row.content);
  return parsed.success ? parsed.data : DEFAULT_CAREERS_PAGE;
}

async function titleTaken(title: string, exceptId?: number) {
  const existing = await prisma.careerJob.findFirst({
    where: { title, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    select: { id: true },
  });
  return existing !== null;
}

/** GET /api/careers/page — public copy + published openings. */
export const getPublicCareersPage = async (_req: Request, res: Response) => {
  try {
    const [content, jobs] = await Promise.all([
      loadPageContent(),
      prisma.careerJob.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: jobSelect,
      }),
    ]);
    return res.status(200).json({ content, jobs });
  } catch (error) {
    console.error("Public careers page error:", error);
    return res.status(500).json({ message: "Failed to load the careers page" });
  }
};

/** GET /api/admin/careers — copy + every opening, hidden ones included. */
export const getAdminCareersContent = async (_req: AuthRequest, res: Response) => {
  try {
    const [content, jobs] = await Promise.all([
      loadPageContent(),
      prisma.careerJob.findMany({
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: jobSelect,
      }),
    ]);
    return res.status(200).json({ content, jobs });
  } catch (error) {
    console.error("Admin careers content error:", error);
    return res.status(500).json({ message: "Failed to load careers content" });
  }
};

/** PUT /api/admin/careers/page */
export const updateCareersPage = async (req: AuthRequest, res: Response) => {
  try {
    const threat = scanForThreats(req.body, "body");
    if (threat) return res.status(400).json({ message: threatMessage(threat) });

    const parsed = careersPageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Check the page content" });
    }
    const content = parsed.data as unknown as Prisma.InputJsonValue;
    await prisma.careersPage.upsert({
      where: { key: PAGE_KEY },
      create: { key: PAGE_KEY, content },
      update: { content },
    });
    return res.status(200).json({ message: "Careers page saved", content: parsed.data });
  } catch (error) {
    console.error("Update careers page error:", error);
    return res.status(500).json({ message: "Failed to save the careers page" });
  }
};

/** POST /api/admin/careers/jobs — new openings go to the end of the list. */
export const createCareerJob = async (req: AuthRequest, res: Response) => {
  try {
    const threat = scanForThreats(req.body, "body");
    if (threat) return res.status(400).json({ message: threatMessage(threat) });

    const parsed = careerJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Check the job details" });
    }
    if (await titleTaken(parsed.data.title)) {
      return res.status(409).json({ message: "Another opening already uses this title" });
    }
    const last = await prisma.careerJob.aggregate({ _max: { sortOrder: true } });
    const job = await prisma.careerJob.create({
      data: {
        ...parsed.data,
        published: parsed.data.published ?? true,
        sortOrder: (last._max.sortOrder ?? 0) + 1,
      },
      select: jobSelect,
    });
    return res.status(201).json({ message: "Job opening added", job });
  } catch (error) {
    console.error("Create career job error:", error);
    return res.status(500).json({ message: "Failed to add the job opening" });
  }
};

/** PUT /api/admin/careers/jobs/:id — any subset of fields. */
export const updateCareerJob = async (req: AuthRequest, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid job id" });
  try {
    const threat = scanForThreats(req.body, "body");
    if (threat) return res.status(400).json({ message: threatMessage(threat) });

    const parsed = updateCareerJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Check the job details" });
    }
    const exists = await prisma.careerJob.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return res.status(404).json({ message: "Job opening not found" });
    if (parsed.data.title && (await titleTaken(parsed.data.title, id))) {
      return res.status(409).json({ message: "Another opening already uses this title" });
    }
    const job = await prisma.careerJob.update({
      where: { id },
      data: parsed.data,
      select: jobSelect,
    });
    return res.status(200).json({ message: "Job opening updated", job });
  } catch (error) {
    console.error("Update career job error:", error);
    return res.status(500).json({ message: "Failed to update the job opening" });
  }
};

/** PUT /api/admin/careers/jobs/order — `ids` in the new display order. */
export const reorderCareerJobs = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = reorderCareerJobsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid order" });
    }
    const { ids } = parsed.data;
    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({ message: "Each opening can appear only once" });
    }
    const count = await prisma.careerJob.count({ where: { id: { in: ids } } });
    if (count !== ids.length) {
      return res.status(400).json({ message: "Some openings no longer exist. Refresh and try again." });
    }
    await prisma.$transaction(
      ids.map((jobId, index) =>
        prisma.careerJob.update({ where: { id: jobId }, data: { sortOrder: index + 1 } }),
      ),
    );
    return res.status(200).json({ message: "Order saved" });
  } catch (error) {
    console.error("Reorder career jobs error:", error);
    return res.status(500).json({ message: "Failed to save the order" });
  }
};

/** DELETE /api/admin/careers/jobs/:id — past applications keep their job title. */
export const deleteCareerJob = async (req: AuthRequest, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid job id" });
  try {
    const exists = await prisma.careerJob.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return res.status(404).json({ message: "Job opening not found" });
    await prisma.careerJob.delete({ where: { id } });
    return res.status(200).json({ message: "Job opening deleted" });
  } catch (error) {
    console.error("Delete career job error:", error);
    return res.status(500).json({ message: "Failed to delete the job opening" });
  }
};
