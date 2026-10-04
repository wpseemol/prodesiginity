import type { Response } from "express";
import prisma from "../lib/prisma.js";
import {
  getMailSettingsRow,
  mailConfigProblem,
  sendMailWith,
  type MailSettingRow,
} from "../lib/mailer.js";
import { decryptSecret, encryptSecret, maskSecret } from "../lib/secretBox.js";
import { testMailSchema, updateMailSettingsSchema } from "../lib/zod/mail.js";
import type { AuthRequest } from "../middleware/auth.js";

function toPayload(row: MailSettingRow) {
  const resendKey = decryptSecret(row.resendApiKey);
  const problem = mailConfigProblem(row);
  return {
    provider: row.provider,
    fromName: row.fromName ?? "",
    fromEmail: row.fromEmail ?? "",
    replyTo: row.replyTo ?? "",
    notifyEmail: row.notifyEmail ?? "",
    resendApiKeySet: Boolean(resendKey),
    resendApiKeyMasked: maskSecret(resendKey),
    smtpPreset: row.smtpPreset ?? "custom",
    smtpHost: row.smtpHost ?? "",
    smtpPort: row.smtpPort,
    smtpSecure: row.smtpSecure,
    smtpUser: row.smtpUser ?? "",
    smtpPassSet: Boolean(decryptSecret(row.smtpPass)),
    careersAutoReply: row.careersAutoReply,
    notifyOnApplication: row.notifyOnApplication,
    lastTestAt: row.lastTestAt,
    lastTestOk: row.lastTestOk,
    lastError: row.lastError,
    ready: problem === null,
    problem,
    encryptionKeyConfigured: Boolean(process.env.SETTINGS_ENCRYPTION_KEY),
    updatedAt: row.updatedAt,
  };
}

const blankToNull = (value: string | undefined) =>
  value === undefined ? undefined : value.trim() === "" ? null : value.trim();

export const getMailSettings = async (_req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json({ settings: toPayload(await getMailSettingsRow()) });
  } catch (error) {
    console.error("Get mail settings error:", error);
    return res.status(500).json({ message: "Failed to load mail settings" });
  }
};

export const updateMailSettings = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateMailSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid mail settings",
      });
    }
    const d = parsed.data;
    const row = await getMailSettingsRow();

    const resendApiKey = d.clearResendApiKey
      ? null
      : d.resendApiKey
        ? encryptSecret(d.resendApiKey)
        : undefined;
    const smtpPass = d.clearSmtpPass
      ? null
      : d.smtpPass
        ? encryptSecret(d.smtpPass)
        : undefined;

    const updated = await prisma.mailSetting.update({
      where: { id: row.id },
      data: {
        ...(d.provider !== undefined ? { provider: d.provider } : {}),
        ...(d.fromName !== undefined ? { fromName: blankToNull(d.fromName) } : {}),
        ...(d.fromEmail !== undefined ? { fromEmail: blankToNull(d.fromEmail) } : {}),
        ...(d.replyTo !== undefined ? { replyTo: blankToNull(d.replyTo) } : {}),
        ...(d.notifyEmail !== undefined ? { notifyEmail: blankToNull(d.notifyEmail) } : {}),
        ...(resendApiKey !== undefined ? { resendApiKey } : {}),
        ...(d.smtpPreset !== undefined ? { smtpPreset: blankToNull(d.smtpPreset) } : {}),
        ...(d.smtpHost !== undefined ? { smtpHost: blankToNull(d.smtpHost) } : {}),
        ...(d.smtpPort !== undefined ? { smtpPort: d.smtpPort } : {}),
        ...(d.smtpSecure !== undefined ? { smtpSecure: d.smtpSecure } : {}),
        ...(d.smtpUser !== undefined ? { smtpUser: blankToNull(d.smtpUser) } : {}),
        ...(smtpPass !== undefined ? { smtpPass } : {}),
        ...(d.careersAutoReply !== undefined ? { careersAutoReply: d.careersAutoReply } : {}),
        ...(d.notifyOnApplication !== undefined
          ? { notifyOnApplication: d.notifyOnApplication }
          : {}),
      },
    });

    return res.status(200).json({ message: "Mail settings saved", settings: toPayload(updated) });
  } catch (error) {
    console.error("Update mail settings error:", error);
    return res.status(500).json({ message: "Failed to save mail settings" });
  }
};

export const sendTestMail = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = testMailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid email" });
    }

    const row = await getMailSettingsRow();
    const result = await sendMailWith(row, {
      to: parsed.data.to,
      subject: "Test email from your dashboard",
      text: `This is a test email sent with the ${row.provider.toUpperCase()} provider.\n\nIf you can read this, outgoing mail is working.`,
    });

    const updated = await prisma.mailSetting.update({
      where: { id: row.id },
      data: {
        lastTestAt: new Date(),
        lastTestOk: result.ok,
        lastError: result.ok ? null : result.error,
      },
    });

    if (!result.ok) {
      return res.status(502).json({ message: result.error, settings: toPayload(updated) });
    }
    return res.status(200).json({
      message: `Test email sent to ${parsed.data.to}`,
      settings: toPayload(updated),
    });
  } catch (error) {
    console.error("Test mail error:", error);
    return res.status(500).json({ message: "Failed to send the test email" });
  }
};
