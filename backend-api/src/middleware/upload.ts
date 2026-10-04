import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { Request, RequestHandler } from "express";
import multer from "multer";
import {
  ensureAvatarUploadDir,
  ensureBlogUploadDir,
  ensureCareersStorageDir,
  ensureHomepageUploadDir,
  ensureSiteUploadDir,
  ensureTeamUploadDir,
  ensureUserUploadDir,
  fileMatchesMime,
  uniqueUploadNameForMime,
} from "../lib/uploads.js";
import type { AuthRequest } from "./auth.js";

function uploadedFiles(req: Request): Express.Multer.File[] {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  return req.files ? Object.values(req.files).flat() : [];
}

/**
 * The browser picks the MIME type, so after multer stores the files their
 * leading bytes are checked too. A script or HTML page labelled `image/png`
 * is deleted before any controller sees it.
 */
function withContentCheck(upload: RequestHandler): RequestHandler {
  return (req, res, next) => {
    upload(req, res, (err?: unknown) => {
      if (err) return next(err);
      const files = uploadedFiles(req);
      if (files.every((file) => fileMatchesMime(file.path, file.mimetype))) return next();
      for (const file of files) fs.promises.unlink(file.path).catch(() => undefined);
      req.file = undefined;
      req.files = undefined;
      return next(new Error("That file is not a valid image or video. Please upload a different file."));
    });
  };
}

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
    cb(null, uniqueUploadNameForMime(file.mimetype));
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
    cb(null, uniqueUploadNameForMime(file.mimetype));
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
    cb(null, uniqueUploadNameForMime(file.mimetype));
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
    cb(null, uniqueUploadNameForMime(file.mimetype));
  },
});

const avatarStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    try {
      cb(null, ensureAvatarUploadDir());
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename(_req, file, cb) {
    cb(null, uniqueUploadNameForMime(file.mimetype));
  },
});

/** Admin avatar presets that staff and clients can pick from. */
export const avatarPresetUpload = withContentCheck(
  multer({
    storage: avatarStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  }).single("image"),
);

export const profilePhotoUpload = withContentCheck(
  multer({
    storage: profileStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  }).single("photo"),
);

/** Team portrait (`photo`) and optional avatar image (`avatar`). */
export const teamPhotoUpload = withContentCheck(
  multer({
    storage: teamStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  }).fields([
    { name: "photo", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
);

export const siteFaviconUpload = withContentCheck(
  multer({
    storage: siteStorage,
    fileFilter: faviconFileFilter,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  }).single("favicon"),
);

export const siteLoginLogoUpload = withContentCheck(
  multer({
    storage: siteStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  }).single("logo"),
);

/** Open Graph / social share image (recommended 1200×630). */
export const siteOgImageUpload = withContentCheck(
  multer({
    storage: siteStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  }).single("ogImage"),
);

/** Site brand logo used in schema.org / SEO (not the staff login logo). */
export const siteBrandLogoUpload = withContentCheck(
  multer({
    storage: siteStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  }).single("brandLogo"),
);

/** Brand / marquee logos only — hard cap 1 MB. */
export const homepageLogoUpload = withContentCheck(
  multer({
    storage: homepageStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 1 * 1024 * 1024, files: 1 },
  }).single("file"),
);

const blogStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    try {
      cb(null, ensureBlogUploadDir());
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename(_req, file, cb) {
    cb(null, uniqueUploadNameForMime(file.mimetype));
  },
});

/** Blog covers, category images and in-article media: images 5 MB, videos 120 MB. */
export const blogMediaUpload = multer({
  storage: blogStorage,
  fileFilter: homepageMediaFilter,
  limits: { fileSize: 120 * 1024 * 1024, files: 1, fields: 5, fieldSize: 1024 },
}).single("file");

const RESUME_EXT_BY_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};
const RESUME_EXT = new Set(Object.values(RESUME_EXT_BY_MIME));
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

const careersStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    try {
      cb(null, ensureCareersStorageDir());
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename(_req, file, cb) {
    const ext = RESUME_EXT_BY_MIME[file.mimetype] ?? ".bin";
    cb(null, `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${ext}`);
  },
});

/** CV from the public careers form: PDF / DOC / DOCX, 5 MB, private storage. */
export const careerResumeUpload = multer({
  storage: careersStorage,
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!RESUME_EXT_BY_MIME[file.mimetype] || !RESUME_EXT.has(ext)) {
      cb(new Error("Upload your CV as a PDF, DOC or DOCX file"));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: RESUME_MAX_BYTES, files: 1, fields: 15, fieldSize: 8 * 1024, parts: 20 },
}).single("resume");

/** Homepage CMS media: images up to 5 MB, videos up to 120 MB. */
export const homepageMediaUpload = withContentCheck(
  multer({
    storage: homepageStorage,
    fileFilter: homepageMediaFilter,
    limits: { fileSize: 120 * 1024 * 1024, files: 1 },
  }).single("file"),
);
