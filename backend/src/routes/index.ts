import { Router } from "express";

import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import homepageRoutes from "./homepage.routes";
import teamRoutes from "./team.routes";
import settingsRoutes from "./settings.routes";
import trackingRoutes from "./tracking.routes";
import servicesRoutes from "./services.routes";

const rootRouter = Router();

// Health check route
rootRouter.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

rootRouter.use("/auth", authRoutes);
rootRouter.use("/homepage", homepageRoutes);
rootRouter.use("/team", teamRoutes);
rootRouter.use("/settings", settingsRoutes);
rootRouter.use("/track", trackingRoutes);
rootRouter.use("/services", servicesRoutes);
rootRouter.use("/admin", adminRoutes);

export default rootRouter;
