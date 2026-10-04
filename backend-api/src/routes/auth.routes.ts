import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
  updateProfile,
  deleteAccount,
  googleLogin,
} from "../controllers/auth.controller.js";
import { googleAuthLimiter } from "../middleware/rateLimit.js";
import {
  clearProfilePhoto,
  deleteMyPhoto,
  listMyPhotos,
  setActivePhoto,
  uploadErrorHandler,
  uploadProfilePhoto,
} from "../controllers/photo.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { profilePhotoUpload } from "../middleware/upload.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuthLimiter, googleLogin);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, updateProfile);
router.delete("/me", requireAuth, deleteAccount);

router.get("/me/photos", requireAuth, listMyPhotos);
router.post(
  "/me/photo",
  requireAuth,
  (req, res, next) => {
    profilePhotoUpload(req, res, (err) => {
      if (err) return uploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  uploadProfilePhoto,
);
router.delete("/me/photo", requireAuth, clearProfilePhoto);
router.post("/me/photos/:photoId/activate", requireAuth, setActivePhoto);
router.delete("/me/photos/:photoId", requireAuth, deleteMyPhoto);

export default router;

