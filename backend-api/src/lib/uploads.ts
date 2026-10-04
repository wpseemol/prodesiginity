import fs from "fs";
import path from "path";

export const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
export const USERS_UPLOAD_ROOT = path.join(UPLOADS_ROOT, "users");
export const TEAM_UPLOAD_ROOT = path.join(UPLOADS_ROOT, "team");
export const SITE_UPLOAD_ROOT = path.join(UPLOADS_ROOT, "site");
export const HOMEPAGE_UPLOAD_ROOT = path.join(UPLOADS_ROOT, "homepage");
export const BLOG_UPLOAD_ROOT = path.join(UPLOADS_ROOT, "blog");

/** Not served by express.static: files here are only streamed to admins. */
export const PRIVATE_STORAGE_ROOT = path.resolve(process.cwd(), "storage");
export const CAREERS_STORAGE_ROOT = path.join(PRIVATE_STORAGE_ROOT, "careers");

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

export function ensureBlogUploadDir(): string {
  return ensureDir(BLOG_UPLOAD_ROOT);
}

export function ensureCareersStorageDir(): string {
  return ensureDir(CAREERS_STORAGE_ROOT);
}

export function publicBlogUploadPath(filename: string): string {
  return `/uploads/blog/${filename}`;
}

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

/** Filename whose extension comes from the MIME type, never from the client. */
export function uniqueUploadNameForMime(mimetype: string) {
  const ext = MIME_EXTENSIONS[mimetype] ?? ".bin";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
}

/**
 * Checks the file's leading bytes against its declared MIME type so a script
 * renamed to `photo.png` is rejected.
 */
export function fileMatchesMime(filePath: string, mimetype: string): boolean {
  let header: Buffer;
  try {
    const fd = fs.openSync(filePath, "r");
    header = Buffer.alloc(16);
    fs.readSync(fd, header, 0, 16, 0);
    fs.closeSync(fd);
  } catch {
    return false;
  }

  const ascii = (start: number, end: number) => header.toString("latin1", start, end);

  switch (mimetype) {
    case "image/jpeg":
      return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    case "image/png":
      return header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/gif":
      return ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a";
    case "image/webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    case "video/mp4":
    case "video/quicktime":
      return ascii(4, 8) === "ftyp" || ["moov", "mdat", "wide", "free"].includes(ascii(4, 8));
    case "video/webm":
      return header[0] === 0x1a && header[1] === 0x45 && header[2] === 0xdf && header[3] === 0xa3;
    case "application/pdf":
      return ascii(0, 5) === "%PDF-";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return header.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    case "application/msword":
      return header.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
    default:
      return false;
  }
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
