import { Router } from "express";
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notifications.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireStaff);

router.get("/", listNotifications);
router.post("/read-all", markAllNotificationsRead);
router.post("/:id/read", markNotificationRead);
router.delete("/:id", deleteNotification);

export default router;
