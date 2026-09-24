import { Router } from "express";
import { recordPageVisit } from "../controllers/tracking.controller.js";

const router = Router();

router.post("/visit", recordPageVisit);

export default router;
