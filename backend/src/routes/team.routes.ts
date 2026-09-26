import { Router } from "express";
import {
  getMyTeamProfile,
  listPublicTeam,
  teamUploadErrorHandler,
  updateMyTeamProfile,
} from "../controllers/team.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { teamPhotoUpload } from "../middleware/upload.js";

const router = Router();

router.get("/", listPublicTeam);

router.get("/me", requireAuth, getMyTeamProfile);
router.put(
  "/me",
  requireAuth,
  (req, res, next) => {
    teamPhotoUpload(req, res, (err) => {
      if (err) return teamUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  updateMyTeamProfile,
);

export default router;
