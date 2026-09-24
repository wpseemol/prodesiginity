import express from "express";
import fs from "fs";
import cors from "cors";
import corsDelegate from "./config/cors.js";
import rootRouter from "./routes/index.js";
import { getApiIndex } from "./lib/apiCatalog.js";
import { ASSETS_UPLOAD_ROOT, HOMEPAGE_UPLOAD_ROOT, SITE_UPLOAD_ROOT, TEAM_UPLOAD_ROOT, UPLOADS_ROOT, USERS_UPLOAD_ROOT, } from "./lib/uploads.js";
const app = express();
const PORT = Number(process.env.PORT || 4000);
// Ensure upload roots exist
fs.mkdirSync(USERS_UPLOAD_ROOT, { recursive: true });
fs.mkdirSync(TEAM_UPLOAD_ROOT, { recursive: true });
fs.mkdirSync(SITE_UPLOAD_ROOT, { recursive: true });
fs.mkdirSync(HOMEPAGE_UPLOAD_ROOT, { recursive: true });
fs.mkdirSync(ASSETS_UPLOAD_ROOT, { recursive: true });
// CORS must run before the routes and before the body parsers.
app.use(cors(corsDelegate));
// Middleware
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
// Serve uploads: /uploads/users|team|site/...
app.use("/uploads", express.static(UPLOADS_ROOT));
// Landing: list all routers + routes (port 4000 by default)
app.get("/", (_req, res) => {
    res.status(200).json(getApiIndex(PORT));
});
app.get("/api", (_req, res) => {
    res.status(200).json(getApiIndex(PORT));
});
// Routes
app.use("/api", rootRouter);
// Centralized error handler
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});
export default app;
//# sourceMappingURL=app.js.map