"use client";

import { useEffect, useState } from "react";

import {
    STATIC_SERVICES_CATALOG,
    fetchServicesCatalog,
    type ServicesCatalog,
} from "@/lib/services-catalog";

let livePromise: Promise<ServicesCatalog | null> | null = null;

/**
 * Starts from the catalog baked into the static export, then swaps in the live
 * API catalog so services an admin adds or edits show up without a redeploy.
 * Components mounting together share one request; later mounts (e.g. after a
 * client-side navigation) fetch again so the data never goes stale.
 *
 * `live` turns true once the API answered, so callers can tell "not in the
 * live catalog" (hidden or deleted in the dashboard) from "still loading".
 */
export function useLiveServicesCatalog(
    initial: ServicesCatalog = STATIC_SERVICES_CATALOG,
): { catalog: ServicesCatalog; live: boolean } {
    const [state, setState] = useState({ catalog: initial, live: false });

    useEffect(() => {
        let active = true;
        let request = livePromise;
        if (!request) {
            const fresh = fetchServicesCatalog();
            request = livePromise = fresh;
            void fresh.finally(() => {
                if (livePromise === fresh) livePromise = null;
            });
        }
        void request.then((catalog) => {
            if (active && catalog) setState({ catalog, live: true });
        });
        return () => {
            active = false;
        };
    }, []);

    return state;
}

export function useServicesCatalog(
    initial: ServicesCatalog = STATIC_SERVICES_CATALOG,
): ServicesCatalog {
    return useLiveServicesCatalog(initial).catalog;
}
