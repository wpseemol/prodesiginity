import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import corsDelegate from "./config/cors.js";
import rootRouter from "./routes/index.js";
import { getApiIndex } from "./lib/apiCatalog.js";
import {
  ASSETS_UPLOAD_ROOT,
  BLOG_UPLOAD_ROOT,
  HOMEPAGE_UPLOAD_ROOT,
  SITE_UPLOAD_ROOT,
  TEAM_UPLOAD_ROOT,
  UPLOADS_ROOT,
  USERS_UPLOAD_ROOT,
} from "./lib/uploads.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);

// Ensure upload roots exist
fs.mkdirSync(USERS_UPLOAD_ROOT, { recursive: true });
fs.mkdirSync(TEAM_UPLOAD_ROOT, { recursive: true });
fs.mkdirSync(SITE_UPLOAD_ROOT, { recursive: true });
fs.mkdirSync(HOMEPAGE_UPLOAD_ROOT, { recursive: true });
fs.mkdirSync(ASSETS_UPLOAD_ROOT, { recursive: true });
fs.mkdirSync(BLOG_UPLOAD_ROOT, { recursive: true });

// Rate limits key on req.ip. By default only a proxy on this machine (deploy/proxy.php
// → 127.0.0.1) may set X-Forwarded-For; direct callers can never spoof it.
// Override with TRUST_PROXY (hop count, or an Express "trust proxy" value).
const trustProxy = process.env.TRUST_PROXY?.trim();
if (trustProxy) {
  const hops = Number(trustProxy);
  app.set("trust proxy", Number.isFinite(hops) ? hops : trustProxy);
} else {
  app.set("trust proxy", "loopback");
}

// Security headers. Uploads are embedded by the website and dashboard on other origins.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS must run before the routes and before the body parsers.
app.use(cors(corsDelegate));

// Middleware
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploads: /uploads/users|team|site/...
app.use(
  "/uploads",
  express.static(UPLOADS_ROOT, {
    dotfiles: "deny",
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
      // Uploads are media, never pages: if a file is ever opened directly it
      // runs sandboxed with no scripts (embedding as <img>/<video> is unaffected).
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; sandbox",
      );
    },
  }),
);

// Landing: list all routers + routes (port 4000 by default)
app.get("/", (_req, res) => {
  res.status(200).json(getApiIndex(PORT));
});

app.get("/api", (_req, res) => {
  res.status(200).json(getApiIndex(PORT));
});

// Routes
app.use("/api", rootRouter);

// 404 for unknown API paths (keeps response JSON, does not crash)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
    method: req.method,
  });
});

// Centralized error handler — never let request errors take down the process
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[express]", err.stack || err.message || err);

  if (res.headersSent) {
    return;
  }

  const maybe = err as unknown as { status?: number; statusCode?: number };
  const status =
    typeof maybe.status === "number"
      ? maybe.status
      : typeof maybe.statusCode === "number"
        ? maybe.statusCode
        : 500;

  const isJsonParse =
    err instanceof SyntaxError || /JSON|Unexpected token/i.test(err.message || "");

  res.status(status).json({
    error:
      status >= 500
        ? "Internal Server Error"
        : isJsonParse
          ? "Invalid JSON body"
          : err.message || "Request failed",
  });
});

export default app;
