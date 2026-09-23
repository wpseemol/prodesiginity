"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const item_routes_js_1 = __importDefault(require("./item.routes.js"));
const career_routes_js_1 = __importDefault(require("./career.routes.js"));
const rootRouter = (0, express_1.Router)();
// Health check route
rootRouter.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});
// Resource routes
rootRouter.use("/items", item_routes_js_1.default);
rootRouter.use("/career", career_routes_js_1.default);
exports.default = rootRouter;
