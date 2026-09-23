"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const cors_2 = __importDefault(require("./config/cors"));
const index_1 = __importDefault(require("./routes/index"));
const uploads_1 = require("./lib/uploads");
const app = (0, express_1.default)();
// Ensure upload roots exist
fs_1.default.mkdirSync(uploads_1.USERS_UPLOAD_ROOT, { recursive: true });
fs_1.default.mkdirSync(uploads_1.TEAM_UPLOAD_ROOT, { recursive: true });
fs_1.default.mkdirSync(uploads_1.SITE_UPLOAD_ROOT, { recursive: true });
fs_1.default.mkdirSync(uploads_1.HOMEPAGE_UPLOAD_ROOT, { recursive: true });
fs_1.default.mkdirSync(uploads_1.ASSETS_UPLOAD_ROOT, { recursive: true });
// CORS must run before the routes and before the body parsers.
app.use((0, cors_1.default)(cors_2.default));
// Middleware
app.use(express_1.default.json({ limit: "2mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploads: /uploads/users|team|site/...
app.use("/uploads", express_1.default.static(uploads_1.UPLOADS_ROOT));
// Routes
app.use("/api", index_1.default);
// Centralized error handler
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});
exports.default = app;
