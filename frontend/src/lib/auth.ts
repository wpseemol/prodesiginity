import { apiBaseUrl } from "@/config/api";

const AUTH_KEY = "prodesignity_auth";

export type AuthUser = {
    email: string;
    name: string;
    picture?: string | null;
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
        user?: { fullName: string; email: string; picture?: string | null };
    };
    if (!res.ok || !data.accessToken || !data.user) {
        throw new Error(data.message || "Google sign-in failed. Please try again.");
    }
    const user: AuthUser = {
        email: data.user.email,
        name: data.user.fullName,
        picture: data.user.picture ?? null,
        provider: "google",
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
    };
    setAuthUser(user);
    return user;
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
