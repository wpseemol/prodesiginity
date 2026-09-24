import { Router } from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import homepageRoutes from "./homepage.routes.js";
import teamRoutes from "./team.routes.js";
import settingsRoutes from "./settings.routes.js";
import trackingRoutes from "./tracking.routes.js";
import servicesRoutes from "./services.routes.js";
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
//# sourceMappingURL=index.js.map