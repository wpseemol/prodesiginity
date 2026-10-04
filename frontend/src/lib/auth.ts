import { apiBaseUrl } from "@/config/api";

/**
 * Website (client) sessions.
 *
 * The site is a static export, so there is no server here to hold a session.
 * The API sets HttpOnly cookies on sign-in and the browser sends them with
 * every `credentials: "include"` request; page scripts never see the tokens.
 * The only thing kept locally is a flag so signed-out visitors don't hit the API.
 */
const SESSION_HINT_KEY = "prodesignity_signed_in";
const LEGACY_SESSION_KEY = "prodesignity_auth";

export type AuthUser = {
    email: string;
    name: string;
    /** What to show: the chosen avatar, otherwise the Google photo. */
    picture: string | null;
    googlePicture: string | null;
    avatarPresetId: number | null;
};

export type ApiAccount = {
    fullName: string;
    email: string;
    googlePictureUrl?: string | null;
    avatarPreset?: { id: number; url: string } | null;
};

export function toAuthUser(account: ApiAccount): AuthUser {
    const googlePicture = account.googlePictureUrl ?? null;
    return {
        email: account.email,
        name: account.fullName,
        picture: account.avatarPreset?.url ?? googlePicture,
        googlePicture,
        avatarPresetId: account.avatarPreset?.id ?? null,
    };
}

function hasSessionHint(): boolean {
    if (typeof window === "undefined") return false;
    try {
        return localStorage.getItem(SESSION_HINT_KEY) === "1";
    } catch {
        return false;
    }
}

function setSessionHint(signedIn: boolean) {
    try {
        if (signedIn) localStorage.setItem(SESSION_HINT_KEY, "1");
        else localStorage.removeItem(SESSION_HINT_KEY);
        sessionStorage.removeItem(LEGACY_SESSION_KEY);
    } catch {
        // Storage can be blocked (private mode); the cookie session still works.
    }
}

function apiFetch(path: string, init: RequestInit = {}) {
    return fetch(`${apiBaseUrl}${path}`, {
        ...init,
        credentials: "include",
        headers: {
            ...(init.body ? { "Content-Type": "application/json" } : {}),
            ...init.headers,
        },
    });
}

let refreshing: Promise<boolean> | null = null;

/**
 * Rotates the session cookies. Shared between concurrent callers: the API
 * treats a reused refresh token as theft and ends every session.
 */
function refreshSession(): Promise<boolean> {
    refreshing ??= apiFetch("/auth/refresh", { method: "POST", body: "{}" })
        .then((res) => res.ok)
        .catch(() => false)
        .finally(() => {
            refreshing = null;
        });
    return refreshing;
}

/**
 * Authenticated API request. On 401 the session is refreshed once and the
 * request retried; if that fails the user is treated as signed out.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const res = await apiFetch(path, init);
    if (res.status !== 401) return res;

    if (!(await refreshSession())) {
        setSessionHint(false);
        return res;
    }
    const retry = await apiFetch(path, init);
    if (retry.status === 401) setSessionHint(false);
    return retry;
}

/** The signed-in client, or null. Only calls the API if a session may exist. */
export async function getCurrentUser(): Promise<AuthUser | null> {
    if (!hasSessionHint()) return null;
    try {
        const res = await authFetch("/auth/me");
        if (!res.ok) return null;
        const data = (await res.json()) as { user?: ApiAccount };
        return data.user ? toAuthUser(data.user) : null;
    } catch {
        return null;
    }
}

/** Exchanges a Google Identity Services credential for an API session. */
export async function signInWithGoogle(credential: string): Promise<AuthUser> {
    const res = await apiFetch("/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential }),
    });
    const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        user?: ApiAccount;
    };
    if (!res.ok || !data.user) {
        throw new Error(data.message || "Google sign-in failed. Please try again.");
    }
    setSessionHint(true);
    return toAuthUser(data.user);
}

/** Revokes the session on the API, which also clears its cookies. */
export async function signOut(): Promise<void> {
    setSessionHint(false);
    if (typeof window !== "undefined") window.google?.accounts.id.disableAutoSelect();
    await apiFetch("/auth/logout", { method: "POST", body: "{}" }).catch(() => {});
}
