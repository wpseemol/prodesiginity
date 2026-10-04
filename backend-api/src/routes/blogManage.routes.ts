import { Router } from "express";
import {
  blogUploadErrorHandler,
  createBlogCategory,
  createBlogPost,
  deleteBlogCategory,
  deleteBlogPost,
  getManagedPost,
  listBlogCategories,
  listManagedPosts,
  updateBlogCategory,
  updateBlogPost,
  uploadBlogMedia,
} from "../controllers/blog.controller.js";
import { blockMaliciousInput } from "../lib/security.js";
import { requireAdmin, requireAuth, requireStaff } from "../middleware/auth.js";
import { blogUploadLimiter, blogWriteLimiter } from "../middleware/rateLimit.js";
import { blogMediaUpload } from "../middleware/upload.js";

/** Dashboard blog management: admin + staff. Categories are admin-only. */
const router = Router();

router.use(requireAuth, requireStaff, blogWriteLimiter);

router.post(
  "/media",
  blogUploadLimiter,
  (req, res, next) => {
    blogMediaUpload(req, res, (err) => {
      if (err) return blogUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  uploadBlogMedia,
);

router.use(blockMaliciousInput);

router.get("/categories", listBlogCategories);
router.post("/categories", requireAdmin, createBlogCategory);
router.put("/categories/:id", requireAdmin, updateBlogCategory);
router.delete("/categories/:id", requireAdmin, deleteBlogCategory);

router.get("/posts", listManagedPosts);
router.get("/posts/:id", getManagedPost);
router.post("/posts", createBlogPost);
router.put("/posts/:id", updateBlogPost);
router.delete("/posts/:id", deleteBlogPost);

export default router;
