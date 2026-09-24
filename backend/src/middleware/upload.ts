import multer from "multer";
import {
  ensureHomepageUploadDir,
  ensureSiteUploadDir,
  ensureTeamUploadDir,
  ensureUserUploadDir,
  uniqueUploadName,
} from "../lib/uploads.js";
import type { AuthRequest } from "./auth.js";

const IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const FAVICON_MIME = new Set([
  ...IMAGE_MIME,
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/svg+xml",
]);

function imageFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (!IMAGE_MIME.has(file.mimetype)) {
    cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed"));
    return;
  }
  cb(null, true);
}

function homepageMediaFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (IMAGE_MIME.has(file.mimetype) || VIDEO_MIME.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(
    new Error(
      "Only images (JPEG, PNG, WebP, GIF) or videos (MP4, WebM, MOV) are allowed",
    ),
  );
}

function faviconFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (!FAVICON_MIME.has(file.mimetype)) {
    cb(new Error("Favicon must be ICO, PNG, SVG, JPEG, WebP, or GIF"));
    return;
  }
  cb(null, true);
}

const profileStorage = multer.diskStorage({
  destination(req, _file, cb) {
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) {
      cb(new Error("Authentication required for upload"), "");
      return;
    }
    try {
      cb(null, ensureUserUploadDir(userId));
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename(_req, file, cb) {
    cb(null, uniqueUploadName(file.originalname, ".jpg"));
  },
});

const teamStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    try {
      cb(null, ensureTeamUploadDir());
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename(_req, file, cb) {
    cb(null, uniqueUploadName(file.originalname, ".jpg"));
  },
});

const siteStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    try {
      cb(null, ensureSiteUploadDir());
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename(_req, file, cb) {
    cb(null, uniqueUploadName(file.originalname, ".png"));
  },
});

const homepageStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    try {
      cb(null, ensureHomepageUploadDir());
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename(_req, file, cb) {
    const fallback = VIDEO_MIME.has(file.mimetype) ? ".mp4" : ".jpg";
    cb(null, uniqueUploadName(file.originalname, fallback));
  },
});

export const profilePhotoUpload = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single("photo");

export const teamPhotoUpload = multer({
  storage: teamStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single("photo");

export const siteFaviconUpload = multer({
  storage: siteStorage,
  fileFilter: faviconFileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
}).single("favicon");

export const siteLoginLogoUpload = multer({
  storage: siteStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single("logo");

/** Open Graph / social share image (recommended 1200×630). */
export const siteOgImageUpload = multer({
  storage: siteStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single("ogImage");

/** Site brand logo used in schema.org / SEO (not the staff login logo). */
export const siteBrandLogoUpload = multer({
  storage: siteStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single("brandLogo");

/** Brand / marquee logos only — hard cap 1 MB. */
export const homepageLogoUpload = multer({
  storage: homepageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 1 * 1024 * 1024, files: 1 },
}).single("file");

/** Homepage CMS media: images up to 5 MB, videos up to 120 MB. */
export const homepageMediaUpload = multer({
  storage: homepageStorage,
  fileFilter: homepageMediaFilter,
  limits: { fileSize: 120 * 1024 * 1024, files: 1 },
}).single("file");
