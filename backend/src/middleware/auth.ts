import { Response, NextFunction } from "express";
import {
  verifyAccessToken,
  type AccessTokenPayload,
} from "../lib/tokens";
import type { Request } from "express";

export type AuthPayload = AccessTokenPayload;

export type AuthRequest = Request & {
  user?: AuthPayload;
};

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const token = header.slice("Bearer ".length).trim();
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
