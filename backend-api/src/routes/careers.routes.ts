import { Router } from "express";
import {
  applyForJob,
  careersUploadErrorHandler,
  deleteApplication,
  downloadResume,
  getApplication,
  listApplications,
  replyToApplication,
  updateApplication,
} from "../controllers/careers.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { careersApplyLimiter, careersReplyLimiter } from "../middleware/rateLimit.js";
import { careerResumeUpload } from "../middleware/upload.js";

const router = Router();

router.post(
  "/apply",
  careersApplyLimiter,
  (req, res, next) => {
    careerResumeUpload(req, res, (err) => {
      if (err) return careersUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  applyForJob,
);

router.use(requireAuth, requireAdmin);

router.get("/applications", listApplications);
router.get("/applications/:id", getApplication);
router.patch("/applications/:id", updateApplication);
router.get("/applications/:id/resume", downloadResume);
router.post("/applications/:id/reply", careersReplyLimiter, replyToApplication);
router.delete("/applications/:id", deleteApplication);

export default router;
