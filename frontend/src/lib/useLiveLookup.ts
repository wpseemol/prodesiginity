"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export type LiveLookup<T> =
    | { status: "found"; data: T }
    | { status: "missing" }
    | { status: "error" };

const subscribe = () => () => {};

/**
 * Read the browser URL: on the static 404 page the router's pathname is the
 * not-found route, not what the visitor requested.
 */
function requestedSlug(pattern: RegExp): string | null {
    const match = window.location.pathname.match(pattern);
    if (!match) return null;
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
}

/**
 * Resolves the slug in the requested URL against the live API. `slug` is null
 * when the URL is not one of `pattern`'s pages; `lookup` is null while the
 * request is in flight. `load` must be a stable (module-level) function.
 */
export function useLiveLookup<T>(
    pattern: RegExp,
    load: (slug: string) => Promise<LiveLookup<T>>,
) {
    const slug = useSyncExternalStore(
        subscribe,
        () => requestedSlug(pattern),
        () => null,
    );
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState<{
        key: string;
        lookup: LiveLookup<T>;
    } | null>(null);
    const key = `${slug}#${attempt}`;

    useEffect(() => {
        if (!slug) return;
        let active = true;
        const requestKey = `${slug}#${attempt}`;

        void load(slug)
            .catch((): LiveLookup<T> => ({ status: "error" }))
            .then((lookup) => {
                if (active) setResult({ key: requestKey, lookup });
            });

        return () => {
            active = false;
        };
    }, [slug, attempt, load]);

    const retry = useCallback(() => setAttempt((n) => n + 1), []);

    return {
        slug,
        lookup: slug && result?.key === key ? result.lookup : null,
        retry,
    };
}
