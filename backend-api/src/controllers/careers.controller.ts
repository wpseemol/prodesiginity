import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { NextFunction, Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { getMailSettingsRow, mailConfigProblem, sendMail, sendMailWith } from "../lib/mailer.js";
import { notifyAdmins } from "../lib/notify.js";
import { scanForThreats, threatMessage } from "../lib/security.js";
import { ACCESS_SECRET } from "../lib/tokens.js";
import { CAREERS_STORAGE_ROOT, fileMatchesMime } from "../lib/uploads.js";
import {
  applySchema,
  blockEmailSchema,
  listApplicationsQuery,
  replyApplicationSchema,
  updateApplicationSchema,
} from "../lib/zod/careers.js";
import type { AuthRequest } from "../middleware/auth.js";

/** Faster than this and it was not a person filling in the form. */
const MIN_FILL_MS = 4_000;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function removeFile(filePath: string | undefined) {
  if (!filePath) return;
  fs.promises.unlink(filePath).catch(() => {});
}

function resumePath(resumeFile: string) {
  return path.join(CAREERS_STORAGE_ROOT, path.basename(resumeFile));
}

function hashIp(req: Request) {
  const ip = req.ip || req.socket.remoteAddress || "";
  return crypto.createHmac("sha256", ACCESS_SECRET).update(ip).digest("hex");
}

function parseId(raw: unknown) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function isBlocked(email: string) {
  const row = await prisma.blockedEmail.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  });
  return row !== null;
}

function blockEmail(email: string, reason?: string) {
  const normalized = email.trim().toLowerCase();
  return prisma.blockedEmail.upsert({
    where: { email: normalized },
    create: { email: normalized, reason: reason || null },
    update: reason ? { reason } : {},
  });
}

/** Original filename made safe for storage and Content-Disposition. */
function safeOriginalName(name: string) {
  const ext = path.extname(name).toLowerCase();
  const base = path
    .basename(name, path.extname(name))
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 120);
  return `${base || "cv"}${ext}`;
}

export function careersUploadErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!err) return next();
  const code = (err as { code?: string }).code;
  if (code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Your CV must be 5 MB or smaller" });
  }
  if (code && code.startsWith("LIMIT_")) {
    return res.status(400).json({ message: "The form submission is too large" });
  }
  return res.status(400).json({
    message: err instanceof Error ? err.message : "Upload failed",
  });
}

async function sendApplicationEmails(application: {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  jobTitle: string;
  experience: string;
  portfolioUrl: string | null;
}) {
  const settings = await getMailSettingsRow();
  if (mailConfigProblem(settings)) return;

  const firstName = application.name.split(" ")[0] || application.name;
  const brand = settings.fromName || "ProDesignity";

  if (settings.careersAutoReply) {
    const result = await sendMailWith(settings, {
      to: application.email,
      subject: `We received your application — ${application.jobTitle}`,
      text: `Hi ${firstName},\n\nThank you for applying for the ${application.jobTitle} role at ${brand}. Our team reviews every CV personally, and we will get back to you by email.\n\nThis is an automatic confirmation, but you can reply to this email if you need to add anything.\n\nBest regards,\n${brand} Talent Team`,
    });
    if (!result.ok) console.warn("[careers] auto-reply failed:", result.error);
  }

  if (settings.notifyOnApplication && settings.notifyEmail) {
    const result = await sendMailWith(settings, {
      to: settings.notifyEmail,
      replyTo: application.email,
      subject: `New application: ${application.name} — ${application.jobTitle}`,
      text: [
        `${application.name} applied for ${application.jobTitle}.`,
        `Email: ${application.email}\nWhatsApp: ${application.phone}\nCity: ${application.city}\nExperience: ${application.experience}${application.portfolioUrl ? `\nPortfolio: ${application.portfolioUrl}` : ""}`,
        "Open Dashboard → Careers to read the CV and reply.",
      ].join("\n\n"),
    });
    if (!result.ok) console.warn("[careers] admin alert failed:", result.error);
  }
}

/** POST /api/careers/apply — public, multipart with a `resume` file. */
export const applyForJob = async (req: Request, res: Response) => {
  const file = req.file;
  try {
    if (!file) {
      return res.status(400).json({ message: "Attach your CV (PDF, DOC or DOCX)" });
    }

    const threat = scanForThreats(req.body, "body");
    if (threat) {
      removeFile(file.path);
      return res.status(400).json({ message: threatMessage(threat) });
    }

    const parsed = applySchema.safeParse(req.body);
    if (!parsed.success) {
      removeFile(file.path);
      const issue = parsed.error.issues[0];
      const isBot = issue?.path[0] === "website" || issue?.path[0] === "startedAt";
      return res.status(400).json({
        message: isBot ? "Your submission could not be verified. Please reload and try again." : issue?.message || "Check the form and try again",
        field: isBot ? undefined : issue?.path[0],
      });
    }
    const data = parsed.data;

    const age = Date.now() - data.startedAt;
    if (age < MIN_FILL_MS || age > MAX_FORM_AGE_MS) {
      removeFile(file.path);
      return res.status(400).json({
        message: "Your submission could not be verified. Please reload the page and try again.",
      });
    }

    if (!fileMatchesMime(file.path, file.mimetype)) {
      removeFile(file.path);
      return res.status(400).json({
        message: "That file does not look like a real PDF or Word document",
        field: "resume",
      });
    }

    if (await isBlocked(data.email)) {
      removeFile(file.path);
      return res.status(403).json({
        message: "We can't accept applications from this email address.",
        field: "email",
      });
    }

    const duplicate = await prisma.jobApplication.findFirst({
      where: {
        email: data.email,
        jobTitle: data.jobTitle,
        createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      },
      select: { id: true },
    });
    if (duplicate) {
      removeFile(file.path);
      return res.status(409).json({
        message: "You already applied for this role today. We will be in touch soon.",
      });
    }

    const application = await prisma.jobApplication.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        jobTitle: data.jobTitle,
        experience: data.experience,
        portfolioUrl: data.portfolioUrl || null,
        coverLetter: data.coverLetter || null,
        resumeFile: path.basename(file.path),
        resumeName: safeOriginalName(file.originalname),
        resumeMime: file.mimetype,
        resumeSize: file.size,
        ipHash: hashIp(req),
        userAgent: req.get("user-agent")?.slice(0, 255) ?? null,
      },
    });

    await notifyAdmins({
      type: "careers.application",
      title: `New application: ${application.name}`,
      body: `${application.jobTitle} · ${application.city} · ${application.experience}`,
      link: `/admin/careers?id=${application.id}`,
    });

    void sendApplicationEmails(application).catch((error) =>
      console.error("[careers] email error:", error),
    );

    return res.status(201).json({
      success: true,
      message: "Application received",
      reference: `PD-${String(application.id).padStart(5, "0")}`,
    });
  } catch (error) {
    removeFile(file?.path);
    console.error("Apply error:", error);
    return res.status(500).json({ message: "Could not submit your application. Please try again." });
  }
};

const listSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  city: true,
  jobTitle: true,
  experience: true,
  status: true,
  rating: true,
  readAt: true,
  createdAt: true,
  _count: { select: { replies: true } },
} satisfies Prisma.JobApplicationSelect;

/** GET /api/careers/applications */
export const listApplications = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = listApplicationsQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid filters" });
    }
    const { status, q, page, pageSize } = parsed.data;

    const search: Prisma.JobApplicationWhereInput | undefined = q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { jobTitle: { contains: q } },
            { city: { contains: q } },
          ],
        }
      : undefined;
    const where: Prisma.JobApplicationWhereInput = {
      ...(status ? { status } : {}),
      ...(search ?? {}),
    };

    const [items, total, byStatus, unread] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: listSelect,
      }),
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.groupBy({
        by: ["status"],
        where: search,
        _count: { _all: true },
      }),
      prisma.jobApplication.count({ where: { readAt: null } }),
    ]);

    return res.status(200).json({
      applications: items.map(({ _count, ...rest }) => ({ ...rest, replyCount: _count.replies })),
      total,
      page,
      pageSize,
      unread,
      counts: Object.fromEntries(byStatus.map((row) => [row.status, row._count._all])),
    });
  } catch (error) {
    console.error("List applications error:", error);
    return res.status(500).json({ message: "Failed to load applications" });
  }
};

async function loadApplication(id: number) {
  const application = await prisma.jobApplication.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      jobTitle: true,
      experience: true,
      portfolioUrl: true,
      coverLetter: true,
      resumeName: true,
      resumeMime: true,
      resumeSize: true,
      status: true,
      rating: true,
      notes: true,
      readAt: true,
      createdAt: true,
      updatedAt: true,
      replies: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          subject: true,
          body: true,
          status: true,
          provider: true,
          error: true,
          createdAt: true,
          sentBy: { select: { fullName: true } },
        },
      },
    },
  });
  if (!application) return null;
  return { ...application, blocked: await isBlocked(application.email) };
}

/** GET /api/careers/applications/:id — also marks it as read. */
export const getApplication = async (req: AuthRequest, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid application id" });
  try {
    await prisma.jobApplication.updateMany({
      where: { id, readAt: null },
      data: { readAt: new Date() },
    });
    const application = await loadApplication(id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    return res.status(200).json({ application });
  } catch (error) {
    console.error("Get application error:", error);
    return res.status(500).json({ message: "Failed to load application" });
  }
};

/** PATCH /api/careers/applications/:id — status, rating, private notes. */
export const updateApplication = async (req: AuthRequest, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid application id" });
  try {
    const parsed = updateApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid update" });
    }
    const exists = await prisma.jobApplication.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return res.status(404).json({ message: "Application not found" });

    const { status, rating, notes } = parsed.data;
    await prisma.jobApplication.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(rating !== undefined ? { rating } : {}),
        ...(notes !== undefined ? { notes: notes.trim() || null } : {}),
      },
    });
    return res.status(200).json({ message: "Application updated", application: await loadApplication(id) });
  } catch (error) {
    console.error("Update application error:", error);
    return res.status(500).json({ message: "Failed to update application" });
  }
};

/** GET /api/careers/applications/:id/resume — streams the CV to an admin. */
export const downloadResume = async (req: AuthRequest, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid application id" });
  try {
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      select: { resumeFile: true, resumeName: true, resumeMime: true },
    });
    if (!application) return res.status(404).json({ message: "Application not found" });

    const filePath = resumePath(application.resumeFile);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "The CV file is missing from storage" });
    }

    const inline = req.query.download !== "1" && application.resumeMime === "application/pdf";
    const encoded = encodeURIComponent(application.resumeName);
    res.setHeader("Content-Type", application.resumeMime);
    res.setHeader(
      "Content-Disposition",
      `${inline ? "inline" : "attachment"}; filename="${application.resumeName.replace(/[^\w.-]/g, "_")}"; filename*=UTF-8''${encoded}`,
    );
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "sandbox; default-src 'none'");
    fs.createReadStream(filePath)
      .on("error", () => {
        if (!res.headersSent) res.status(500).end();
        else res.destroy();
      })
      .pipe(res);
  } catch (error) {
    console.error("Download resume error:", error);
    if (!res.headersSent) res.status(500).json({ message: "Failed to load the CV" });
  }
};

/** POST /api/careers/applications/:id/reply — emails the applicant. */
export const replyToApplication = async (req: AuthRequest, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid application id" });
  try {
    const parsed = replyApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid reply" });
    }
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      select: { id: true, email: true },
    });
    if (!application) return res.status(404).json({ message: "Application not found" });

    const { subject, body, status } = parsed.data;
    const result = await sendMail({ to: application.email, subject, text: body });

    await prisma.applicationReply.create({
      data: {
        applicationId: id,
        subject,
        body,
        status: result.ok ? "sent" : "failed",
        provider: result.provider,
        error: result.ok ? null : result.error,
        sentById: req.user?.userId ?? null,
      },
    });

    if (result.ok && status) {
      await prisma.jobApplication.update({ where: { id }, data: { status } });
    }

    const updated = await loadApplication(id);
    if (!result.ok) {
      return res.status(502).json({ message: `Email not sent: ${result.error}`, application: updated });
    }
    return res.status(200).json({ message: `Reply sent to ${application.email}`, application: updated });
  } catch (error) {
    console.error("Reply application error:", error);
    return res.status(500).json({ message: "Failed to send the reply" });
  }
};

/**
 * DELETE /api/careers/applications/:id — removes the record and the CV file.
 * `?block=1` also blocks the applicant's email from applying again.
 */
export const deleteApplication = async (req: AuthRequest, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid application id" });
  try {
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      select: { resumeFile: true, email: true, jobTitle: true },
    });
    if (!application) return res.status(404).json({ message: "Application not found" });
    const block = req.query.block === "1";
    if (block) await blockEmail(application.email, `Deleted application for ${application.jobTitle}`.slice(0, 255));
    await prisma.jobApplication.delete({ where: { id } });
    removeFile(resumePath(application.resumeFile));
    return res.status(200).json({
      message: block ? "Application deleted and email blocked" : "Application deleted",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    return res.status(500).json({ message: "Failed to delete application" });
  }
};

/** GET /api/careers/blocked */
export const listBlockedEmails = async (_req: AuthRequest, res: Response) => {
  try {
    const blocked = await prisma.blockedEmail.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json({ blocked });
  } catch (error) {
    console.error("List blocked emails error:", error);
    return res.status(500).json({ message: "Failed to load blocked emails" });
  }
};

/** POST /api/careers/blocked — body `{ email, reason? }`. */
export const addBlockedEmail = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = blockEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Enter a valid email address" });
    }
    const blocked = await blockEmail(parsed.data.email, parsed.data.reason);
    return res.status(200).json({ message: `${blocked.email} is blocked`, blocked });
  } catch (error) {
    console.error("Block email error:", error);
    return res.status(500).json({ message: "Failed to block the email" });
  }
};

/** DELETE /api/careers/blocked?email= — lets that address apply again. */
export const removeBlockedEmail = async (req: AuthRequest, res: Response) => {
  try {
    const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : "";
    if (!email) return res.status(400).json({ message: "Email is required" });
    const { count } = await prisma.blockedEmail.deleteMany({ where: { email } });
    if (count === 0) return res.status(404).json({ message: "That email is not blocked" });
    return res.status(200).json({ message: `${email} can apply again` });
  } catch (error) {
    console.error("Unblock email error:", error);
    return res.status(500).json({ message: "Failed to unblock the email" });
  }
};

/**
 * GET /api/careers/me/applications — the signed-in user's applications (by
 * account email) with the messages the team sent. Notes and ratings stay private.
 */
export const listMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Authentication required." });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) return res.status(401).json({ message: "Authentication required." });

    const rows = await prisma.jobApplication.findMany({
      where: { email: user.email.toLowerCase() },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        jobTitle: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        replies: {
          where: { status: "sent" },
          orderBy: { createdAt: "desc" },
          select: { id: true, subject: true, body: true, createdAt: true },
        },
      },
    });

    return res.status(200).json({
      applications: rows.map((row) => ({
        ...row,
        reference: `PD-${String(row.id).padStart(5, "0")}`,
      })),
    });
  } catch (error) {
    console.error("List my applications error:", error);
    return res.status(500).json({ message: "Failed to load your applications" });
  }
};
