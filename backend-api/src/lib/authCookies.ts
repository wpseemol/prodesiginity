import type { CookieOptions, Request, Response } from "express";
import { accessTokenMaxAgeSeconds } from "./tokens.js";

/**
 * HttpOnly session cookies for the public website (a static export with no
 * server of its own). Page scripts never see the tokens; the browser attaches
 * them to API requests made with `credentials: "include"`.
 *
 * SameSite=Lax works when the site and API share a registrable domain
 * (prodesignity.com + api.prodesignity.com, or localhost:3000 + localhost:4000).
 * If they ever live on unrelated domains set AUTH_COOKIE_SAMESITE=none (HTTPS only).
 */
export const ACCESS_COOKIE = "pd_access";
export const REFRESH_COOKIE = "pd_refresh";

const isProd = process.env.NODE_ENV === "production";
const sameSite: CookieOptions["sameSite"] =
  process.env.AUTH_COOKIE_SAMESITE?.toLowerCase() === "none" ? "none" : "lax";
const domain = process.env.AUTH_COOKIE_DOMAIN?.trim() || undefined;

function baseOptions(path: string): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd || sameSite === "none",
    sameSite,
    domain,
    path,
  };
}

/** Sent on every API call. */
const accessOptions = () => baseOptions("/api");
/** Only sent to /api/auth/* (refresh + logout), so it rarely leaves the browser. */
const refreshOptions = () => baseOptions("/api/auth");

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string; refreshExpiresInDays: number },
) {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...accessOptions(),
    maxAge: accessTokenMaxAgeSeconds() * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...refreshOptions(),
    maxAge: tokens.refreshExpiresInDays * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, accessOptions());
  res.clearCookie(REFRESH_COOKIE, refreshOptions());
}

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() !== name) continue;
    const value = part.slice(index + 1).trim();
    try {
      return decodeURIComponent(value) || null;
    } catch {
      return value || null;
    }
  }
  return null;
}
