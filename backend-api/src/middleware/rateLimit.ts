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

/** Public careers form: a handful of applications per IP per hour. */
export const careersApplyLimiter = limiter(
  60 * 60 * 1000,
  5,
  "Too many applications from this network. Please try again in an hour.",
);

/** Dashboard replies to applicants. */
export const careersReplyLimiter = limiter(
  15 * 60 * 1000,
  60,
  "Too many emails in a short time. Please wait a few minutes.",
);

/** Mail settings "send test email". */
export const mailTestLimiter = limiter(
  15 * 60 * 1000,
  10,
  "Too many test emails. Please wait a few minutes.",
);

/** Google sign-in token exchange. */
export const googleAuthLimiter = limiter(
  15 * 60 * 1000,
  30,
  "Too many sign-in attempts. Please wait a few minutes.",
);

/** Blog media uploads. */
export const blogUploadLimiter = limiter(
  15 * 60 * 1000,
  60,
  "Too many uploads in a short time. Please wait a few minutes.",
);
