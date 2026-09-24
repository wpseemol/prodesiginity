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

/**
 * Exchange the encrypted refresh cookie for a new access/refresh pair.
 * On any failure the session is cleared so the user must sign in again.
 */
export async function refreshSession(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    clearDashboardSession();
    return false;
  }

  try {
    const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.accessToken || !data.refreshToken || !data.user) {
      clearDashboardSession();
      return false;
    }

    await setDashboardSession(
      data.accessToken as string,
      data.refreshToken as string,
      data.user as DashboardUser,
      typeof data.refreshExpiresInDays === "number"
        ? data.refreshExpiresInDays
        : undefined,
    );
    return true;
  } catch {
    clearDashboardSession();
    return false;
  }
}

async function refreshSessionSingleFlight(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiFetch(path: string, options: ApiOptions = {}) {
  const {
    skipAuth = false,
    retryOnAuthFail = true,
    headers,
    ...rest
  } = options;

  const buildHeaders = async () => {
    const next = new Headers(headers);
    const isFormData =
      typeof FormData !== "undefined" && rest.body instanceof FormData;
    if (!next.has("Content-Type") && rest.body && !isFormData) {
      next.set("Content-Type", "application/json");
    }
    if (!skipAuth) {
      const token = await getAccessToken();
      if (token) next.set("Authorization", `Bearer ${token}`);
    }
    return next;
  };

  let res = await fetch(`${apiBaseUrl}${path}`, {
    ...rest,
    headers: await buildHeaders(),
  });

  if (res.status === 401 && !skipAuth && retryOnAuthFail) {
    const refreshed = await refreshSessionSingleFlight();
    if (refreshed) {
      res = await fetch(`${apiBaseUrl}${path}`, {
        ...rest,
        headers: await buildHeaders(),
      });
    }
  }

  return res;
}

export async function logoutRequest() {
  const refreshToken = await getRefreshToken();
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
