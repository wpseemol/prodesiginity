const AUTH_KEY = "prodesignity_auth";

export type AuthUser = {
    email: string;
    name: string;
    provider?: "email" | "google";
};

export function getAuthUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(AUTH_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as AuthUser;
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
