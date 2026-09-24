import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
  updateProfile,
  deleteAccount,
} from "../controllers/auth.controller";
import {
  listMyPhotos,
  setActivePhoto,
  uploadErrorHandler,
  uploadProfilePhoto,
} from "../controllers/photo.controller";
import { requireAuth } from "../middleware/auth";
import { profilePhotoUpload } from "../middleware/upload";

const router = Router();

router.post("/register", register);
router.post("/login", login);
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
router.post("/me/photos/:photoId/activate", requireAuth, setActivePhoto);

export default router;
