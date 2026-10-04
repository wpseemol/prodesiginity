import prisma from "./prisma.js";

export type NotificationInput = {
  type: string;
  title: string;
  body?: string;
  /** Dashboard route, e.g. `/admin/careers?id=12`. */
  link?: string;
};

function clip(input: NotificationInput) {
  return {
    type: input.type.slice(0, 40),
    title: input.title.slice(0, 160),
    body: input.body?.slice(0, 500) ?? null,
    link: input.link?.slice(0, 255) ?? null,
  };
}

/** Shared by every admin. Never throws: a failed notification must not fail the request. */
export async function notifyAdmins(input: NotificationInput) {
  try {
    await prisma.notification.create({ data: { userId: null, ...clip(input) } });
  } catch (error) {
    console.error("[notify] admins:", error);
  }
}

export async function notifyUser(userId: number, input: NotificationInput) {
  try {
    await prisma.notification.create({ data: { userId, ...clip(input) } });
  } catch (error) {
    console.error("[notify] user:", error);
  }
}
