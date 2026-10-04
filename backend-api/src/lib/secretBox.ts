/**
 * AES-256-GCM for credentials stored in the database (mail API keys, SMTP
 * passwords). The key comes from SETTINGS_ENCRYPTION_KEY; without it the JWT
 * secret is used so development works, but production should set its own key
 * so rotating JWT secrets does not make saved credentials unreadable.
 */
import crypto from "crypto";
import { ACCESS_SECRET } from "./tokens.js";

const PREFIX = "v1";

if (!process.env.SETTINGS_ENCRYPTION_KEY && process.env.NODE_ENV === "production") {
  console.warn(
    "[secretBox] SETTINGS_ENCRYPTION_KEY is not set; falling back to the JWT secret.",
  );
}

const KEY = crypto
  .createHash("sha256")
  .update(process.env.SETTINGS_ENCRYPTION_KEY || `settings:${ACCESS_SECRET}`)
  .digest();

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString("base64"), tag.toString("base64"), data.toString("base64")].join(":");
}

/** `null` when the value is missing or can no longer be decrypted. */
export function decryptSecret(stored: string | null | undefined): string | null {
  if (!stored) return null;
  const [prefix, iv, tag, data] = stored.split(":");
  if (prefix !== PREFIX || !iv || !tag || !data) return null;
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(data, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

export function maskSecret(plain: string | null): string | null {
  if (!plain) return null;
  return plain.length <= 4 ? "••••" : `••••${plain.slice(-4)}`;
}
