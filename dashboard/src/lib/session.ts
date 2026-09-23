import { decryptValue, encryptValue } from "./crypto";

const TOKEN_COOKIE = "dashboard_token";
const USER_COOKIE = "dashboard_user";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type DashboardUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

function cookieAttributes(maxAge = MAX_AGE_SECONDS): string {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure}`;
}

function setCookie(name: string, value: string, maxAge = MAX_AGE_SECONDS) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${cookieAttributes(maxAge)}`;
}

function getCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

function clearCookie(name: string) {
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Strict`;
}

function clearLegacyLocalStorage() {
  localStorage.removeItem(TOKEN_COOKIE);
  localStorage.removeItem(USER_COOKIE);
}

export function getDashboardToken(): string | null {
  return getCookie(TOKEN_COOKIE);
}

export async function getDashboardUser(): Promise<DashboardUser | null> {
  const encrypted = getCookie(USER_COOKIE);
  if (!encrypted) return null;

  const plain = await decryptValue(encrypted);
  if (!plain) return null;

  try {
    return JSON.parse(plain) as DashboardUser;
  } catch {
    return null;
  }
}

export async function setDashboardSession(
  token: string,
  user: DashboardUser,
): Promise<void> {
  const encryptedUser = await encryptValue(JSON.stringify(user));
  setCookie(TOKEN_COOKIE, token);
  setCookie(USER_COOKIE, encryptedUser);
  clearLegacyLocalStorage();
}

export function clearDashboardSession() {
  clearCookie(TOKEN_COOKIE);
  clearCookie(USER_COOKIE);
  clearLegacyLocalStorage();
}
