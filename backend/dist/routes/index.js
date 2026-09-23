"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const homepage_routes_1 = __importDefault(require("./homepage.routes"));
const team_routes_1 = __importDefault(require("./team.routes"));
const settings_routes_1 = __importDefault(require("./settings.routes"));
const tracking_routes_1 = __importDefault(require("./tracking.routes"));
const services_routes_1 = __importDefault(require("./services.routes"));
const rootRouter = (0, express_1.Router)();
// Health check route
rootRouter.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});
rootRouter.use("/auth", auth_routes_1.default);
rootRouter.use("/homepage", homepage_routes_1.default);
rootRouter.use("/team", team_routes_1.default);
rootRouter.use("/settings", settings_routes_1.default);
rootRouter.use("/track", tracking_routes_1.default);
rootRouter.use("/services", services_routes_1.default);
rootRouter.use("/admin", admin_routes_1.default);
exports.default = rootRouter;
