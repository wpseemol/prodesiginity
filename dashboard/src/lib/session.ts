import { decryptValue, encryptValue } from "./crypto";

const ACCESS_COOKIE = "dashboard_access_token";
const REFRESH_COOKIE = "dashboard_refresh_token";
const USER_COOKIE = "dashboard_user";
const LEGACY_TOKEN_COOKIE = "dashboard_token";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type DashboardPhoto = {
  id: number;
  url: string;
  altText: string | null;
  description?: string | null;
  createdAt?: string;
};

export type DashboardUser = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  photo?: DashboardPhoto | null;
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

function clearLegacyStorage() {
  localStorage.removeItem(LEGACY_TOKEN_COOKIE);
  localStorage.removeItem(USER_COOKIE);
  localStorage.removeItem(ACCESS_COOKIE);
  localStorage.removeItem(REFRESH_COOKIE);
  clearCookie(LEGACY_TOKEN_COOKIE);
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_COOKIE) ?? getCookie(LEGACY_TOKEN_COOKIE);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_COOKIE);
}

/** @deprecated use getAccessToken */
export function getDashboardToken(): string | null {
  return getAccessToken();
}

export async function getDashboardUser(): Promise<DashboardUser | null> {
  const encrypted = getCookie(USER_COOKIE);
  if (!encrypted) return null;

  const plain = await decryptValue(encrypted);
  if (!plain) return null;

  try {
    const user = JSON.parse(plain) as DashboardUser;
    if (!user.username) return null;
    return user;
  } catch {
    return null;
  }
}

export async function setDashboardSession(
  accessToken: string,
  refreshToken: string,
  user: DashboardUser,
): Promise<void> {
  const encryptedUser = await encryptValue(JSON.stringify(user));
  setCookie(ACCESS_COOKIE, accessToken, 60 * 60); // 1 hour cookie window; JWT may expire sooner
  setCookie(REFRESH_COOKIE, refreshToken, MAX_AGE_SECONDS);
  setCookie(USER_COOKIE, encryptedUser, MAX_AGE_SECONDS);
  clearLegacyStorage();
}

export async function updateDashboardUser(user: DashboardUser): Promise<void> {
  const encryptedUser = await encryptValue(JSON.stringify(user));
  setCookie(USER_COOKIE, encryptedUser, MAX_AGE_SECONDS);
}

export function clearDashboardSession() {
  clearCookie(ACCESS_COOKIE);
  clearCookie(REFRESH_COOKIE);
  clearCookie(USER_COOKIE);
  clearLegacyStorage();
}
