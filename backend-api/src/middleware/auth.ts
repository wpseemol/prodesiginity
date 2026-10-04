import { Response, NextFunction } from "express";
import {
  isStaffRole,
  verifyAccessToken,
  type AccessTokenPayload,
} from "../lib/tokens.js";
import type { Request } from "express";
import { ACCESS_COOKIE, readCookie } from "../lib/authCookies.js";
import { isTrustedOrigin } from "../config/cors.js";

export type AuthPayload = AccessTokenPayload;

export type AuthRequest = Request & {
  user?: AuthPayload;
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Bearer header (dashboard) first, then the website's HttpOnly cookie. */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  let token = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    token = readCookie(req, ACCESS_COOKIE) ?? "";
    // Browsers attach cookies automatically, so cookie-authenticated writes
    // must come from our own site.
    if (token && !SAFE_METHODS.has(req.method) && !isTrustedOrigin(req.headers.origin)) {
      return res.status(403).json({ message: "Request origin not allowed." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired access token." });
  }

  req.user = decoded;
  return next();
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  return next();
}

/** Admin or staff (`employer`). */
export function requireStaff(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user || !isStaffRole(req.user.role)) {
    return res.status(403).json({ message: "Staff access required." });
  }
  return next();
}
