import { apiBaseUrl } from "@/config/api";

const AUTH_KEY = "prodesignity_auth";

export type AuthUser = {
    email: string;
    name: string;
    /** What to show: the chosen avatar, otherwise the Google photo. */
    picture?: string | null;
    googlePicture?: string | null;
    avatarPresetId?: number | null;
    provider?: "google";
    accessToken?: string;
    refreshToken?: string;
};

export function getAuthUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(AUTH_KEY);
        if (!raw) return null;
        const user = JSON.parse(raw) as AuthUser;
        // Sessions from the old placeholder login have no API token.
        return user.accessToken ? user : null;
    } catch {
        return null;
    }
}

export function setAuthUser(user: AuthUser): void {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
    sessionStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
    return getAuthUser() !== null;
}

/** Exchanges a Google Identity Services credential for an API session. */
export async function signInWithGoogle(credential: string): Promise<AuthUser> {
    const res = await fetch(`${apiBaseUrl}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
    });
    const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        accessToken?: string;
        refreshToken?: string;
        user?: {
            fullName: string;
            email: string;
            picture?: string | null;
            googlePictureUrl?: string | null;
            avatarPreset?: { id: number; url: string } | null;
        };
    };
    if (!res.ok || !data.accessToken || !data.user) {
        throw new Error(data.message || "Google sign-in failed. Please try again.");
    }
    const user: AuthUser = {
        email: data.user.email,
        name: data.user.fullName,
        picture: data.user.picture ?? null,
        googlePicture: data.user.googlePictureUrl ?? null,
        avatarPresetId: data.user.avatarPreset?.id ?? null,
        provider: "google",
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
    };
    setAuthUser(user);
    return user;
}

async function refreshSession(user: AuthUser): Promise<AuthUser | null> {
    if (!user.refreshToken) return null;
    const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: user.refreshToken }),
    }).catch(() => null);
    if (!res?.ok) return null;
    const data = (await res.json().catch(() => ({}))) as {
        accessToken?: string;
        refreshToken?: string;
    };
    if (!data.accessToken) return null;
    const next = { ...user, accessToken: data.accessToken, refreshToken: data.refreshToken };
    setAuthUser(next);
    return next;
}

/**
 * Authenticated API request. Refreshes the short-lived access token once on
 * 401; if that fails the session is cleared and the 401 is returned.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const send = (token?: string) =>
        fetch(`${apiBaseUrl}${path}`, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                ...init.headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

    const user = getAuthUser();
    const res = await send(user?.accessToken);
    if (res.status !== 401 || !user) return res;

    const refreshed = await refreshSession(user);
    if (!refreshed) {
        clearAuthUser();
        return res;
    }
    return send(refreshed.accessToken);
}

/** Revokes the refresh token on the API, then clears the local session. */
export async function signOut(): Promise<void> {
    const refreshToken = getAuthUser()?.refreshToken;
    clearAuthUser();
    if (typeof window !== "undefined") window.google?.accounts.id.disableAutoSelect();
    if (!refreshToken) return;
    await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
}
