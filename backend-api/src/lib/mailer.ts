/**
 * Outgoing mail through the provider chosen in Dashboard → Settings → Mail:
 * Resend (API key) or any SMTP server (Gmail, Zoho, Brevo, cPanel hosting…).
 */
import nodemailer from "nodemailer";
import { Resend } from "resend";
import prisma from "./prisma.js";
import { decryptSecret } from "./secretBox.js";

export const MAIL_PROVIDERS = ["none", "resend", "smtp"] as const;
export type MailProvider = (typeof MAIL_PROVIDERS)[number];

const SETTINGS_KEY = "default";

export type MailMessage = {
  to: string | string[];
  subject: string;
  /** Plain-text body. Paragraphs are separated by blank lines. */
  text: string;
  html?: string;
  replyTo?: string;
};

export type MailResult =
  | { ok: true; provider: MailProvider; id?: string }
  | { ok: false; provider: MailProvider; error: string };

export type MailSettingRow = Awaited<ReturnType<typeof getMailSettingsRow>>;

export async function getMailSettingsRow() {
  const existing = await prisma.mailSetting.findUnique({ where: { key: SETTINGS_KEY } });
  if (existing) return existing;
  try {
    return await prisma.mailSetting.create({ data: { key: SETTINGS_KEY } });
  } catch {
    return prisma.mailSetting.findUniqueOrThrow({ where: { key: SETTINGS_KEY } });
  }
}

function oneLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Plain text → a simple branded HTML email. All text is escaped. */
export function renderEmailHtml(text: string, brand: string) {
  const paragraphs = text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#f4f5f9;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
<tr><td style="background:linear-gradient(90deg,#7c3aed,#2563eb);padding:20px 28px;color:#ffffff;font-weight:800;font-size:18px">${escapeHtml(brand)}</td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.6">${paragraphs}</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b">Sent by ${escapeHtml(brand)}</td></tr>
</table></td></tr></table></body></html>`;
}

function fromHeader(row: MailSettingRow) {
  if (!row.fromEmail) return null;
  const name = row.fromName ? oneLine(row.fromName).replace(/"/g, "'") : "";
  return name ? `"${name}" <${row.fromEmail}>` : row.fromEmail;
}

/** Why mail can't be sent with these settings, or `null` when it can. */
export function mailConfigProblem(row: MailSettingRow): string | null {
  if (row.provider === "none") return "Outgoing mail is turned off.";
  if (!row.fromEmail) return "Set a From address first.";
  if (row.provider === "resend") {
    return decryptSecret(row.resendApiKey) ? null : "Add a Resend API key.";
  }
  if (row.provider === "smtp") {
    if (!row.smtpHost || !row.smtpPort) return "Add the SMTP host and port.";
    if (row.smtpUser && !decryptSecret(row.smtpPass)) return "Add the SMTP password.";
    return null;
  }
  return "Unknown mail provider.";
}

export async function sendMailWith(row: MailSettingRow, message: MailMessage): Promise<MailResult> {
  const provider = row.provider as MailProvider;
  const problem = mailConfigProblem(row);
  if (problem) return { ok: false, provider, error: problem };

  const from = fromHeader(row)!;
  const subject = oneLine(message.subject).slice(0, 200);
  const replyTo = message.replyTo ?? row.replyTo ?? undefined;
  const html = message.html ?? renderEmailHtml(message.text, row.fromName || "ProDesignity");

  try {
    if (provider === "resend") {
      const resend = new Resend(decryptSecret(row.resendApiKey)!);
      const { data, error } = await resend.emails.send({
        from,
        to: message.to,
        subject,
        text: message.text,
        html,
        ...(replyTo ? { replyTo } : {}),
      });
      if (error) return { ok: false, provider, error: error.message || "Resend rejected the email" };
      return { ok: true, provider, id: data?.id };
    }

    const transport = nodemailer.createTransport({
      host: row.smtpHost!,
      port: row.smtpPort!,
      secure: row.smtpSecure,
      requireTLS: !row.smtpSecure && row.smtpPort === 587,
      ...(row.smtpUser
        ? { auth: { user: row.smtpUser, pass: decryptSecret(row.smtpPass)! } }
        : {}),
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    const info = await transport.sendMail({
      from,
      to: message.to,
      subject,
      text: message.text,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    return { ok: true, provider, id: info.messageId };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Could not send the email";
    return { ok: false, provider, error: msg.slice(0, 480) };
  }
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  return sendMailWith(await getMailSettingsRow(), message);
}
