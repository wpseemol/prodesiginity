import { apiBaseUrl } from "@/config";
import {
  clearDashboardSession,
  getAccessToken,
  getRefreshToken,
  setDashboardSession,
  type DashboardUser,
} from "@/lib/session";

type ApiOptions = RequestInit & {
  skipAuth?: boolean;
  retryOnAuthFail?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      clearDashboardSession();
      return false;
    }

    await setDashboardSession(
      data.accessToken,
      data.refreshToken,
      data.user as DashboardUser,
    );
    return true;
  } catch {
    clearDashboardSession();
    return false;
  }
}

export async function apiFetch(path: string, options: ApiOptions = {}) {
  const {
    skipAuth = false,
    retryOnAuthFail = true,
    headers,
    ...rest
  } = options;

  const buildHeaders = () => {
    const next = new Headers(headers);
    const isFormData =
      typeof FormData !== "undefined" && rest.body instanceof FormData;
    if (!next.has("Content-Type") && rest.body && !isFormData) {
      next.set("Content-Type", "application/json");
    }
    if (!skipAuth) {
      const token = getAccessToken();
      if (token) next.set("Authorization", `Bearer ${token}`);
    }
    return next;
  };

  let res = await fetch(`${apiBaseUrl}${path}`, {
    ...rest,
    headers: buildHeaders(),
  });

  if (res.status === 401 && !skipAuth && retryOnAuthFail) {
    if (!refreshPromise) {
      refreshPromise = refreshSession().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;
    if (refreshed) {
      res = await fetch(`${apiBaseUrl}${path}`, {
        ...rest,
        headers: buildHeaders(),
      });
    }
  }

  return res;
}

export async function logoutRequest() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // ignore network errors on logout
    }
  }
  clearDashboardSession();
}
