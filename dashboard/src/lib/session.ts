import { decryptValue, encryptValue } from "./crypto";

const ACCESS_COOKIE = "dashboard_access_token";
const REFRESH_COOKIE = "dashboard_refresh_token";
const USER_COOKIE = "dashboard_user";
const LEGACY_TOKEN_COOKIE = "dashboard_token";

/** Access cookie mirrors short JWT life (+ small buffer). */
const ACCESS_MAX_AGE_SECONDS = 20 * 60; // 20 minutes
/** Refresh cookie: admin default 1d, employer 3d — use the longer bound. */
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 3;

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

function cookieAttributes(maxAge: number): string {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure}`;
}

function setCookie(name: string, value: string, maxAge: number) {
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

function refreshMaxAgeSeconds(
  role: string,
  refreshExpiresInDays?: number,
): number {
  if (typeof refreshExpiresInDays === "number" && refreshExpiresInDays > 0) {
    return Math.floor(refreshExpiresInDays * 24 * 60 * 60);
  }
  // Safe upper bound when API omits the field
  if (role === "admin") return 60 * 60 * 24; // 1 day
  if (role === "employer") return 60 * 60 * 24 * 3; // 3 days
  return REFRESH_MAX_AGE_SECONDS;
}

async function readEncryptedCookie(name: string): Promise<string | null> {
  const raw = getCookie(name);
  if (!raw) return null;

  // Prefer encrypted payload; fall back to legacy plain JWT during rollout.
  const decrypted = await decryptValue(raw);
  if (decrypted) return decrypted;
  if (raw.includes(".") && raw.split(".").length >= 3) return raw;
  return null;
}

export async function getAccessToken(): Promise<string | null> {
  return (
    (await readEncryptedCookie(ACCESS_COOKIE)) ?? getCookie(LEGACY_TOKEN_COOKIE)
  );
}

export async function getRefreshToken(): Promise<string | null> {
  return readEncryptedCookie(REFRESH_COOKIE);
}

/** @deprecated use getAccessToken */
export async function getDashboardToken(): Promise<string | null> {
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
  refreshExpiresInDays?: number,
): Promise<void> {
  const [encryptedAccess, encryptedRefresh, encryptedUser] = await Promise.all([
    encryptValue(accessToken),
    encryptValue(refreshToken),
    encryptValue(JSON.stringify(user)),
  ]);

  setCookie(ACCESS_COOKIE, encryptedAccess, ACCESS_MAX_AGE_SECONDS);
  setCookie(
    REFRESH_COOKIE,
    encryptedRefresh,
    refreshMaxAgeSeconds(user.role, refreshExpiresInDays),
  );
  setCookie(
    USER_COOKIE,
    encryptedUser,
    refreshMaxAgeSeconds(user.role, refreshExpiresInDays),
  );
  clearLegacyStorage();
}

export async function updateDashboardUser(user: DashboardUser): Promise<void> {
  const encryptedUser = await encryptValue(JSON.stringify(user));
  const refreshDays = user.role === "admin" ? 1 : 3;
  setCookie(USER_COOKIE, encryptedUser, refreshMaxAgeSeconds(user.role, refreshDays));
}

export function clearDashboardSession() {
  clearCookie(ACCESS_COOKIE);
  clearCookie(REFRESH_COOKIE);
  clearCookie(USER_COOKIE);
  clearLegacyStorage();
}
