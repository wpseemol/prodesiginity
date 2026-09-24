import { createHash, randomUUID } from "crypto";
import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { trackPageVisitSchema } from "../lib/zod/team.js";
import {
  parseUserAgent,
  requestClientIp,
  resolveVisitorCountry,
  sendMetaCapiPageView,
} from "../lib/tracking.js";
import type { AuthRequest } from "../middleware/auth.js";
import { siteConfigUrl } from "../lib/site-url.js";

function groupCount<T extends string | null | undefined>(
  rows: { key: T; _count: { _all: number } }[],
) {
  return rows
    .map((row) => ({
      key: row.key ?? "Unknown",
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Public beacon from the marketing site. */
export const recordPageVisit = async (req: Request, res: Response) => {
  try {
    const parsed = trackPageVisitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid visit payload",
      });
    }

    const uaHeader = req.headers["user-agent"];
    const userAgent = typeof uaHeader === "string" ? uaHeader : undefined;
    const { deviceType, browser } = parseUserAgent(userAgent);
    const geo = await resolveVisitorCountry(req, {
      countryCode: parsed.data.countryCode,
      country: parsed.data.country,
    });
    const countryCode = geo.countryCode;
    const country = geo.country;

    const sessionId =
      parsed.data.sessionId?.trim() ||
      createHash("sha256")
        .update(`${requestClientIp(req)}:${userAgent ?? ""}`)
        .digest("hex")
        .slice(0, 32);

    const visit = await prisma.pageVisit.create({
      data: {
        path: parsed.data.path.slice(0, 512),
        referrer: parsed.data.referrer?.trim()
          ? parsed.data.referrer.trim().slice(0, 512)
          : null,
        country,
        countryCode,
        deviceType,
        browser,
        sessionId,
      },
      select: { id: true },
    });

    const eventSourceUrl = (() => {
      try {
        return new URL(parsed.data.path, siteConfigUrl()).toString();
      } catch {
        return parsed.data.path;
      }
    })();

    void sendMetaCapiPageView({
      eventSourceUrl,
      clientUserAgent: userAgent,
      clientIpAddress: requestClientIp(req) || undefined,
      eventId: randomUUID(),
    });

    return res.status(201).json({
      ok: true,
      id: visit.id,
      geo: { countryCode, country, source: geo.source },
    });
  } catch (error) {
    console.error("Record page visit error:", error);
    return res.status(500).json({ message: "Failed to record visit" });
  }
};

/** Admin overview: country / device / path + tracking credential status. */
export const getAnalyticsOverview = async (req: AuthRequest, res: Response) => {
  try {
    const daysRaw = Number(req.query.days ?? 30);
    const days = Number.isFinite(daysRaw)
      ? Math.min(Math.max(Math.floor(daysRaw), 1), 90)
      : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalVisits,
      sessions,
      byCountry,
      byDevice,
      byBrowser,
      byPath,
      recent,
      settings,
    ] = await Promise.all([
      prisma.pageVisit.count({ where: { createdAt: { gte: since } } }),
      prisma.pageVisit.groupBy({
        by: ["sessionId"],
        where: { createdAt: { gte: since }, sessionId: { not: null } },
        _count: { _all: true },
      }),
      prisma.pageVisit.groupBy({
        by: ["country"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        orderBy: { _count: { country: "desc" } },
        take: 12,
      }),
      prisma.pageVisit.groupBy({
        by: ["deviceType"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        orderBy: { _count: { deviceType: "desc" } },
      }),
      prisma.pageVisit.groupBy({
        by: ["browser"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        orderBy: { _count: { browser: "desc" } },
        take: 8,
      }),
      prisma.pageVisit.groupBy({
        by: ["path"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 8,
      }),
      prisma.pageVisit.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          path: true,
          country: true,
          countryCode: true,
          deviceType: true,
          browser: true,
          referrer: true,
          createdAt: true,
        },
      }),
      prisma.siteSetting.findUnique({
        where: { key: "default" },
        select: {
          trackingEnabled: true,
          metaPixelId: true,
          googleMeasurementId: true,
          googleAdsId: true,
          metaCapiAccessToken: true,
          googleEnhancedConversionsApiKey: true,
          googleAdsConversionLabel: true,
        },
      }),
    ]);

    return res.status(200).json({
      days,
      totalVisits,
      uniqueSessions: sessions.length,
      byCountry: byCountry.map((row) => ({
        country: row.country ?? "Unknown",
        count: row._count._all,
      })),
      byDevice: groupCount(
        byDevice.map((row) => ({
          key: row.deviceType,
          _count: row._count,
        })),
      ),
      byBrowser: groupCount(
        byBrowser.map((row) => ({
          key: row.browser,
          _count: row._count,
        })),
      ),
      byPath: byPath.map((row) => ({
        path: row.path,
        count: row._count._all,
      })),
      recent,
      tracking: {
        enabled: Boolean(settings?.trackingEnabled),
        metaPixel: Boolean(settings?.metaPixelId),
        googleTag: Boolean(settings?.googleMeasurementId),
        googleAds: Boolean(settings?.googleAdsId),
        metaCapi: Boolean(settings?.metaCapiAccessToken),
        googleEnhancedConversions: Boolean(
          settings?.googleEnhancedConversionsApiKey &&
            settings?.googleAdsConversionLabel,
        ),
      },
      demographicsNote:
        "Age and gender are not available as first-party fields. After Meta Pixel and GA4 are live, open Meta Ads Manager → Audiences / Events Manager and GA4 → User attributes → Demographics for aggregated age & gender of your website visitors.",
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return res.status(500).json({ message: "Failed to load analytics" });
  }
};
