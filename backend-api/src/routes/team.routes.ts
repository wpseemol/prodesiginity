import { Router } from "express";
import {
  getMyTeamProfile,
  getPublicTeamMember,
  listPublicTeam,
  teamUploadErrorHandler,
  updateMyTeamProfile,
} from "../controllers/team.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";
import { teamPhotoUpload } from "../middleware/upload.js";

const router = Router();

router.get("/", listPublicTeam);

// Team profiles belong to staff logins; clients must not reach the upload.
router.get("/me", requireAuth, requireStaff, getMyTeamProfile);
router.put(
  "/me",
  requireAuth,
  requireStaff,
  (req, res, next) => {
    teamPhotoUpload(req, res, (err) => {
      if (err) return teamUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  updateMyTeamProfile,
);

// After /me so "me" is never read as a slug.
router.get("/:slug", getPublicTeamMember);

export default router;
