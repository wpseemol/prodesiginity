"use client";

import { useEffect, useState } from "react";

import type { Industry } from "@/data/industriesData";
import { STATIC_INDUSTRIES, fetchIndustries } from "@/lib/industries-catalog";

let livePromise: Promise<Industry[] | null> | null = null;

/**
 * Starts from the list baked into the static export, then swaps in the live
 * API list so industries an admin adds or edits show up without a redeploy.
 * Components mounting together share one request; later mounts (e.g. after a
 * client-side navigation) fetch again so the data never goes stale.
 *
 * `live` turns true once the API answered, so callers can tell "not in the
 * live list" (hidden or deleted in the dashboard) from "still loading".
 */
export function useLiveIndustries(
    initial: Industry[] = STATIC_INDUSTRIES,
): { industries: Industry[]; live: boolean } {
    const [state, setState] = useState({ industries: initial, live: false });

    useEffect(() => {
        let active = true;
        let request = livePromise;
        if (!request) {
            const fresh = fetchIndustries();
            request = livePromise = fresh;
            void fresh.finally(() => {
                if (livePromise === fresh) livePromise = null;
            });
        }
        void request.then((industries) => {
            if (active && industries) setState({ industries, live: true });
        });
        return () => {
            active = false;
        };
    }, []);

    return state;
}

export function useIndustries(
    initial: Industry[] = STATIC_INDUSTRIES,
): Industry[] {
    return useLiveIndustries(initial).industries;
}
