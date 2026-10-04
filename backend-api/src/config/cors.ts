import type { CorsOptions, CorsOptionsDelegate } from "cors";
import type { Request } from "express";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Origins allowed to send writes (POST/PUT/PATCH/DELETE) in production.
 * Set in .env as a comma-separated list:
 *   ALLOWED_ORIGINS=https://prodesignity.com,https://www.prodesignity.com
 */
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

/** Methods that only read. Safe to expose to any origin. */
const READ_ONLY_METHODS = ["GET", "HEAD", "OPTIONS"];

const baseOptions: CorsOptions = {
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // cache preflight for 24h
    optionsSuccessStatus: 204,
};

const corsDelegate: CorsOptionsDelegate<Request> = (req, callback) => {
    const origin = req.headers.origin;

    // --- Development: no restrictions at all ---
    if (isDev) {
        callback(null, {
            ...baseOptions,
            origin: true, // reflect whatever origin asked
            credentials: true,
            methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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

    // On a preflight, req.method is OPTIONS and the method the browser
    // actually wants lives in this header. Check that one, not OPTIONS.
    const intendedMethod = (
        req.method === "OPTIONS"
            ? (req.headers["access-control-request-method"] as string) ?? "OPTIONS"
            : req.method
    ).toUpperCase();

    // Your own frontend: full access, cookies allowed.
    if (allowedOrigins.includes(origin)) {
        callback(null, {
            ...baseOptions,
            origin: true,
            credentials: true,
            methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        });
        return;
    }

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
    callback(null, { ...baseOptions, origin: false });
};

export default corsDelegate;