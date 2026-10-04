"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, onAuthChange, type AuthUser } from "@/lib/auth";

/** One `/auth/me` request shared by every component that needs the user. */
let pending: Promise<AuthUser | null> | null = null;
let invalidating = false;

function loadUser(): Promise<AuthUser | null> {
    pending ??= getCurrentUser();
    return pending;
}

/** Registered before any component listener, so the cache is cleared first. */
function invalidateOnAuthChange() {
    if (invalidating) return;
    invalidating = true;
    onAuthChange(() => {
        pending = null;
    });
}

/**
 * The signed-in website user: `undefined` while checking, then the user or
 * `null`. Re-checks on sign-in, sign-out and profile changes.
 */
export function useCurrentUser(): AuthUser | null | undefined {
    const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

    useEffect(() => {
        let active = true;
        const refresh = () => {
            loadUser().then((current) => {
                if (active) setUser(current);
            });
        };
        invalidateOnAuthChange();
        refresh();
        const stop = onAuthChange(refresh);
        return () => {
            active = false;
            stop();
        };
    }, []);

    return user;
}
