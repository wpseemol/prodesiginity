import { Router } from "express";
import { recordPageVisit } from "../controllers/tracking.controller.js";
import { trackingLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/visit", trackingLimiter, recordPageVisit);

export default router;
