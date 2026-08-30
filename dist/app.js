"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cors_2 = __importDefault(require("./config/cors"));
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
// CORS must run before the routes and before the body parsers.
app.use((0, cors_1.default)(cors_2.default));
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api", index_1.default);
// Centralized error handler
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});
exports.default = app;
