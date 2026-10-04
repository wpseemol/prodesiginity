import type { Response } from "express";
import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/auth.js";

/** Admins see shared (userId = null) notifications plus their own. */
function visibleTo(req: AuthRequest): Prisma.NotificationWhereInput {
  const userId = req.user!.userId;
  return req.user!.role === "admin" ? { OR: [{ userId: null }, { userId }] } : { userId };
}

function parseId(raw: unknown) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const listNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const unreadOnly = req.query.unread === "1";
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const where = visibleTo(req);

    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: unreadOnly ? { AND: [where, { readAt: null }] } : where,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          link: true,
          readAt: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where: { AND: [where, { readAt: null }] } }),
    ]);

    return res.status(200).json({ notifications: items, unreadCount });
  } catch (error) {
    console.error("List notifications error:", error);
    return res.status(500).json({ message: "Failed to load notifications" });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid notification id" });
  try {
    const result = await prisma.notification.updateMany({
      where: { AND: [visibleTo(req), { id, readAt: null }] },
      data: { readAt: new Date() },
    });
    return res.status(200).json({ updated: result.count });
  } catch (error) {
    console.error("Mark notification error:", error);
    return res.status(500).json({ message: "Failed to update notification" });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { AND: [visibleTo(req), { readAt: null }] },
      data: { readAt: new Date() },
    });
    return res.status(200).json({ updated: result.count });
  } catch (error) {
    console.error("Mark all notifications error:", error);
    return res.status(500).json({ message: "Failed to update notifications" });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid notification id" });
  try {
    const result = await prisma.notification.deleteMany({
      where: { AND: [visibleTo(req), { id }] },
    });
    if (result.count === 0) return res.status(404).json({ message: "Notification not found" });
    return res.status(200).json({ message: "Notification removed" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ message: "Failed to remove notification" });
  }
};
