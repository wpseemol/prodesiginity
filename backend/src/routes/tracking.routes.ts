import { Router } from "express";
import { recordPageVisit } from "../controllers/tracking.controller";

const router = Router();

router.post("/visit", recordPageVisit);

export default router;
