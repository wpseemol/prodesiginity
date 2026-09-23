import { Router } from "express";
import itemRoutes from "./item.routes.js";
import careerRoutes from "./career.routes.js";

const rootRouter = Router();

// Health check route
rootRouter.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Resource routes
rootRouter.use("/items", itemRoutes);
rootRouter.use("/career", careerRoutes);

export default rootRouter;
