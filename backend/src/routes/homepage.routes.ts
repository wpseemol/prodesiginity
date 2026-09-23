import { Router } from "express";
import {
  getHomepage,
  getHomepageSection,
} from "../controllers/homepage.controller";

const router = Router();

router.get("/", getHomepage);
router.get("/:key", getHomepageSection);

export default router;
