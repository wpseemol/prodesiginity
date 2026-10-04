import { Router } from "express";
import {
  getPublicIndustries,
  getPublicIndustry,
} from "../controllers/industries.controller.js";

const router = Router();

router.get("/", getPublicIndustries);
router.get("/:slug", getPublicIndustry);

export default router;
