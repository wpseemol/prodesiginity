import { rateLimit } from "express-rate-limit";

function limiter(windowMs: number, limit: number, message: string) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message },
  });
}

/** Public blog reads. Generous: a static build fetches every article. */
export const blogReadLimiter = limiter(60 * 1000, 300, "Too many requests. Please slow down.");

/** Dashboard blog writes (create / update / delete). */
export const blogWriteLimiter = limiter(
  15 * 60 * 1000,
  300,
  "Too many changes in a short time. Please wait a few minutes.",
);

/** Blog media uploads. */
export const blogUploadLimiter = limiter(
  15 * 60 * 1000,
  60,
  "Too many uploads in a short time. Please wait a few minutes.",
);
