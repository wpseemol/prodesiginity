import fs from "fs";
import path from "path";

export const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
export const USERS_UPLOAD_ROOT = path.join(UPLOADS_ROOT, "users");
export const TEAM_UPLOAD_ROOT = path.join(UPLOADS_ROOT, "team");
export const SITE_UPLOAD_ROOT = path.join(UPLOADS_ROOT, "site");
export const HOMEPAGE_UPLOAD_ROOT = path.join(UPLOADS_ROOT, "homepage");

export function ensureDir(dir: string): string {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function ensureUserUploadDir(userId: number): string {
  return ensureDir(path.join(USERS_UPLOAD_ROOT, String(userId)));
}

export function ensureTeamUploadDir(): string {
  return ensureDir(TEAM_UPLOAD_ROOT);
}

export function ensureSiteUploadDir(): string {
  return ensureDir(SITE_UPLOAD_ROOT);
}

export function ensureHomepageUploadDir(): string {
  return ensureDir(HOMEPAGE_UPLOAD_ROOT);
}

/** Public URL path stored in DB, e.g. `/uploads/users/12/abc.jpg` */
export function publicUploadPath(userId: number, filename: string): string {
  return `/uploads/users/${userId}/${filename}`;
}

export function publicTeamUploadPath(filename: string): string {
  return `/uploads/team/${filename}`;
}

export function publicSiteUploadPath(filename: string): string {
  return `/uploads/site/${filename}`;
}

export function publicHomepageUploadPath(filename: string): string {
  return `/uploads/homepage/${filename}`;
}

export const ASSETS_UPLOAD_ROOT = path.join(UPLOADS_ROOT, "assets");

export function ensureAssetsUploadDir(...parts: string[]): string {
  return ensureDir(path.join(ASSETS_UPLOAD_ROOT, ...parts));
}

export function publicAssetPath(...parts: string[]): string {
  return `/uploads/assets/${parts.join("/")}`.replace(/\/{2,}/g, "/");
}

export function uniqueUploadName(originalName: string, fallbackExt = ".jpg") {
  const ext = path.extname(originalName).toLowerCase() || fallbackExt;
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
}
