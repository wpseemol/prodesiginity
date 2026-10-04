import { Response } from "express";
import prisma from "../lib/prisma.js";
import { decryptSecret, encryptSecret, maskSecret } from "../lib/secretBox.js";
import { updateGoogleSettingsSchema } from "../lib/zod/googleAuth.js";
import type { AuthRequest } from "../middleware/auth.js";

const SETTINGS_KEY = "default";

async function loadRow() {
  return prisma.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    update: {},
    create: { key: SETTINGS_KEY },
    select: { googleClientId: true, googleClientSecret: true, updatedAt: true },
  });
}

function toPayload(row: Awaited<ReturnType<typeof loadRow>>) {
  const secret = decryptSecret(row.googleClientSecret);
  const envClientId = process.env.GOOGLE_CLIENT_ID?.trim() || null;
  return {
    clientId: row.googleClientId,
    clientSecretSet: Boolean(secret),
    clientSecretMasked: maskSecret(secret),
    /** True when the dashboard value is empty and the server env provides one. */
    usingEnvClientId: !row.googleClientId && Boolean(envClientId),
    enabled: Boolean(row.googleClientId || envClientId),
    updatedAt: row.updatedAt,
  };
}

/** GET /api/admin/settings/google */
export const getGoogleSettings = async (_req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json({ settings: toPayload(await loadRow()) });
  } catch (error) {
    console.error("Get Google settings error:", error);
    return res.status(500).json({ message: "Failed to load Google sign-in settings" });
  }
};

/** PUT /api/admin/settings/google */
export const updateGoogleSettings = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateGoogleSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid settings",
      });
    }
    const { clientId, clientSecret, clearClientSecret } = parsed.data;

    await loadRow();
    const row = await prisma.siteSetting.update({
      where: { key: SETTINGS_KEY },
      data: {
        ...(clientId !== undefined ? { googleClientId: clientId || null } : {}),
        ...(clearClientSecret
          ? { googleClientSecret: null }
          : clientSecret
            ? { googleClientSecret: encryptSecret(clientSecret) }
            : {}),
      },
      select: { googleClientId: true, googleClientSecret: true, updatedAt: true },
    });

    return res.status(200).json({
      message: "Google sign-in settings saved",
      settings: toPayload(row),
    });
  } catch (error) {
    console.error("Update Google settings error:", error);
    return res.status(500).json({ message: "Failed to save Google sign-in settings" });
  }
};
