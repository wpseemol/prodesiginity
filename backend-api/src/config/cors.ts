import type { CorsOptions, CorsOptionsDelegate } from "cors";
import type { Request } from "express";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Origins allowed to send writes (POST/PUT/PATCH/DELETE) and cookies in
 * production. Set in .env as a comma-separated list:
 *   ALLOWED_ORIGINS=https://prodesignity.com,https://dashboard.prodesignity.com
 *
 * Forgiving on purpose, because a near-miss here shows up in the browser only
 * as an opaque "CORS error" / "Failed to fetch":
 *   - entries are normalised (trailing slash, path and letter case ignored)
 *   - the www / non-www twin of every entry is allowed too
 *   - SITE_URL and STAFF_PORTAL_URL (or DASHBOARD_URL) are added if set
 *   - `https://*.example.com` allows exactly one subdomain level of a domain
 *     you own. Never use it for shared hosts such as *.vercel.app.
 */
function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

function wwwTwin(origin: string): string {
  const url = new URL(origin);
  url.hostname = url.hostname.startsWith("www.") ? url.hostname.slice(4) : `www.${url.hostname}`;
  return url.origin;
}

const configured = [
  ...(process.env.ALLOWED_ORIGINS ?? "").split(","),
  process.env.SITE_URL ?? "",
  process.env.STAFF_PORTAL_URL ?? "",
  process.env.DASHBOARD_URL ?? "",
];

const exactOrigins = new Set<string>();
const wildcardOrigins: RegExp[] = [];
const ignoredEntries: string[] = [];

for (const entry of configured) {
  const raw = entry
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "")
    .toLowerCase();
  if (!raw) continue;
  const wildcard = raw.match(/^(https?):\/\/\*\.([a-z0-9.-]+(?::\d+)?)$/);
  if (wildcard) {
    const [, scheme, rest] = wildcard;
    const escaped = rest.replace(/[.]/g, "\\.");
    wildcardOrigins.push(new RegExp(`^${scheme}://[a-z0-9-]+\\.${escaped}$`));
    continue;
  }
  const origin = normalizeOrigin(raw);
  if (!origin) {
    ignoredEntries.push(entry.trim());
    continue;
  }
  exactOrigins.add(origin);
  if (!/^https?:\/\/(localhost|\d+\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) exactOrigins.add(wwwTwin(origin));
}

export const allowedOrigins = [...exactOrigins];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  const normalized = origin.toLowerCase();
  return exactOrigins.has(normalized) || wildcardOrigins.some((re) => re.test(normalized));
}

/** Whether a browser request comes from our own site (always true in development). */
export function isTrustedOrigin(origin: string | undefined): boolean {
  if (isDev) return true;
  return isAllowedOrigin(origin);
}

if (!isDev) {
  if (exactOrigins.size === 0 && wildcardOrigins.length === 0) {
    console.warn(
      "[cors] ALLOWED_ORIGINS is empty — browsers can read the API but every login, form and dashboard save will be blocked.",
    );
  } else {
    console.log(`[cors] trusted origins: ${[...allowedOrigins, ...wildcardOrigins.map(String)].join(", ")}`);
  }
  if (ignoredEntries.length) {
    console.warn(`[cors] ignored invalid ALLOWED_ORIGINS entries: ${ignoredEntries.join(", ")}`);
  }
}

/** Methods that only read. Safe to expose to any origin. */
const READ_ONLY_METHODS = ["GET", "HEAD", "OPTIONS"];
const ALL_METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

const baseOptions: CorsOptions = {
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
  maxAge: 86400, // cache preflight for 24h
  optionsSuccessStatus: 204,
};

/** One log line per unknown origin per hour, so the fix is easy to spot in pm2 logs. */
const reported = new Map<string, number>();
function reportBlocked(origin: string, method: string, path: string) {
  const now = Date.now();
  if ((reported.get(origin) ?? 0) > now - 3_600_000) return;
  if (reported.size > 500) reported.clear();
  reported.set(origin, now);
  console.warn(
    `[cors] blocked ${method} ${path} from ${origin} — if this is your site or dashboard, add it to ALLOWED_ORIGINS and restart.`,
  );
}

const corsDelegate: CorsOptionsDelegate<Request> = (req, callback) => {
  const origin = req.headers.origin;

  // --- Development: no restrictions at all ---
  if (isDev) {
    callback(null, {
      ...baseOptions,
      origin: true, // reflect whatever origin asked
      credentials: true,
      methods: ALL_METHODS,
    });
    return;
  }

  // --- Production ---

  // No Origin header means it isn't a browser cross-origin call
  // (same-origin navigation, curl, server-to-server). CORS doesn't apply.
  if (!origin) {
    callback(null, { ...baseOptions, origin: false });
    return;
  }

  // Your own frontend: full access, cookies allowed.
  if (isAllowedOrigin(origin)) {
    callback(null, {
      ...baseOptions,
      origin: true,
      credentials: true,
      methods: ALL_METHODS,
    });
    return;
  }

  // On a preflight, req.method is OPTIONS and the method the browser
  // actually wants lives in this header. Check that one, not OPTIONS.
  const intendedMethod = (
    req.method === "OPTIONS"
      ? ((req.headers["access-control-request-method"] as string) ?? "OPTIONS")
      : req.method
  ).toUpperCase();

  // Any other origin: reads only, and never with credentials.
  if (READ_ONLY_METHODS.includes(intendedMethod)) {
    callback(null, {
      ...baseOptions,
      origin: true,
      credentials: false,
      methods: READ_ONLY_METHODS,
    });
    return;
  }

  // Unknown origin trying to write: no CORS headers, browser blocks it.
  reportBlocked(origin, intendedMethod, req.originalUrl.split("?")[0]);
  callback(null, { ...baseOptions, origin: false });
};

export default corsDelegate;
