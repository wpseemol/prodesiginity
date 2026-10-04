import { createHash } from "crypto";
import type { Request } from "express";
import prisma from "./prisma.js";

const COUNTRY_NAMES: Record<string, string> = {
  BD: "Bangladesh",
  US: "United States",
  GB: "United Kingdom",
  UK: "United Kingdom",
  IN: "India",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  SG: "Singapore",
  MY: "Malaysia",
  PK: "Pakistan",
  NL: "Netherlands",
  IT: "Italy",
  ES: "Spain",
  JP: "Japan",
  KR: "South Korea",
  BR: "Brazil",
  XX: "Unknown",
};

export function countryNameFromCode(code: string | null | undefined) {
  if (!code) return null;
  const upper = code.toUpperCase();
  return COUNTRY_NAMES[upper] ?? upper;
}

export function resolveCountryCode(req: Request, bodyCode?: string | null) {
  const fromBody = bodyCode?.trim().toUpperCase();
  if (fromBody && /^[A-Z]{2}$/.test(fromBody)) return fromBody;

  const headers = [
    "cf-ipcountry",
    "x-vercel-ip-country",
    "x-country-code",
    "cloudfront-viewer-country",
  ];
  for (const key of headers) {
    const value = req.headers[key];
    const raw = Array.isArray(value) ? value[0] : value;
    if (typeof raw === "string" && /^[A-Za-z]{2}$/.test(raw.trim())) {
      const code = raw.trim().toUpperCase();
      // Cloudflare uses XX / T1 for unknown / tor
      if (code === "XX" || code === "T1") continue;
      return code;
    }
  }
  return null;
}

/**
 * Country for a visit: CDN header → MaxMind GeoLite2 → unknown.
 * Prefer edge headers when present (free + accurate behind CF/Vercel).
 */
export async function resolveVisitorCountry(
  req: Request,
  body?: { countryCode?: string | null; country?: string | null },
) {
  const headerCode = resolveCountryCode(req, body?.countryCode);
  if (headerCode) {
    return {
      countryCode: headerCode,
      country: body?.country?.trim() || countryNameFromCode(headerCode),
      source: "header" as const,
    };
  }

  const { lookupIpCountry } = await import("./geoip.js");
  const geo = await lookupIpCountry(clientIp(req));
  if (geo.countryCode) {
    return {
      countryCode: geo.countryCode,
      country: body?.country?.trim() || geo.country || countryNameFromCode(geo.countryCode),
      source: geo.source,
    };
  }

  return {
    countryCode: null,
    country: body?.country?.trim() || null,
    source: "none" as const,
  };
}

export function parseUserAgent(ua: string | undefined) {
  const value = ua ?? "";
  const lower = value.toLowerCase();
  let deviceType = "desktop";
  if (/ipad|tablet|kindle|playbook|silk|(android(?!.*mobile))/i.test(value)) {
    deviceType = "tablet";
  } else if (
    /mobi|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(value)
  ) {
    deviceType = "mobile";
  }

  let browser = "Other";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("chrome/") && !lower.includes("edg/"))
    browser = "Chrome";
  else if (lower.includes("safari/") && !lower.includes("chrome/"))
    browser = "Safari";
  else if (lower.includes("firefox/")) browser = "Firefox";

  return { deviceType, browser };
}

function clientIp(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "";
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(",")[0]?.trim() ?? "";
  }
  return req.socket.remoteAddress ?? "";
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** Fire Meta Conversions API PageView when CAPI credentials are configured. */
export async function sendMetaCapiPageView(opts: {
  eventSourceUrl: string;
  clientUserAgent?: string;
  clientIpAddress?: string;
  eventId?: string;
}) {
  const settings = await prisma.siteSetting.findUnique({
    where: { key: "default" },
    select: {
      trackingEnabled: true,
      metaPixelId: true,
      metaCapiAccessToken: true,
      metaCapiTestEventCode: true,
    },
  });

  if (
    !settings?.trackingEnabled ||
    !settings.metaPixelId ||
    !settings.metaCapiAccessToken
  ) {
    return;
  }

  const event: Record<string, unknown> = {
    event_name: "PageView",
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: opts.eventSourceUrl,
    action_source: "website",
    user_data: {
      client_user_agent: opts.clientUserAgent || undefined,
      client_ip_address: opts.clientIpAddress || undefined,
    },
  };
  if (opts.eventId) event.event_id = opts.eventId;

  const body: Record<string, unknown> = {
    data: [event],
  };
  if (settings.metaCapiTestEventCode) {
    body.test_event_code = settings.metaCapiTestEventCode;
  }

  const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(settings.metaPixelId)}/events?access_token=${encodeURIComponent(settings.metaCapiAccessToken)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Meta CAPI error:", res.status, text.slice(0, 300));
    }
  } catch (error) {
    console.error("Meta CAPI request failed:", error);
  }
}

export function requestClientIp(req: Request) {
  return clientIp(req);
}

export function requestUaHash(req: Request) {
  const ua = req.headers["user-agent"];
  return typeof ua === "string" ? hashValue(ua).slice(0, 32) : null;
}
