import { Router } from "express";
import { getPublicBlog, getPublicBlogPost } from "../controllers/blog.controller.js";
import { blogReadLimiter } from "../middleware/rateLimit.js";
import { blockMaliciousInput } from "../lib/security.js";

const router = Router();

router.use(blogReadLimiter, blockMaliciousInput);

router.get("/", getPublicBlog);
router.get("/:slug", getPublicBlogPost);

export default router;
