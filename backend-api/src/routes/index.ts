import { Router } from "express";

import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import homepageRoutes from "./homepage.routes.js";
import teamRoutes from "./team.routes.js";
import settingsRoutes from "./settings.routes.js";
import trackingRoutes from "./tracking.routes.js";
import servicesRoutes from "./services.routes.js";
import blogRoutes from "./blog.routes.js";
import blogManageRoutes from "./blogManage.routes.js";
import careersRoutes from "./careers.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import prisma from "../lib/prisma.js";

const rootRouter = Router();

// Health check — also verifies MySQL/Prisma connection
rootRouter.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("Health DB check failed:", error);
    return res.status(503).json({
      status: "error",
      database: "disconnected",
      uptime: process.uptime(),
      message:
        error instanceof Error ? error.message : "Database connection failed",
    });
  }
});

rootRouter.use("/auth", authRoutes);
rootRouter.use("/homepage", homepageRoutes);
rootRouter.use("/team", teamRoutes);
rootRouter.use("/settings", settingsRoutes);
rootRouter.use("/track", trackingRoutes);
rootRouter.use("/services", servicesRoutes);
rootRouter.use("/blog", blogRoutes);
rootRouter.use("/manage/blog", blogManageRoutes);
rootRouter.use("/careers", careersRoutes);
rootRouter.use("/notifications", notificationsRoutes);
rootRouter.use("/admin", adminRoutes);

export default rootRouter;
