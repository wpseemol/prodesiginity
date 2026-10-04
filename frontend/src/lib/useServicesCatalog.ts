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
 * API catalog so services an admin adds show up without a redeploy. One
 * request is shared by every component on the page.
 */
export function useServicesCatalog(
    initial: ServicesCatalog = STATIC_SERVICES_CATALOG,
): ServicesCatalog {
    const [catalog, setCatalog] = useState(initial);

    useEffect(() => {
        let active = true;
        livePromise ??= fetchServicesCatalog();
        void livePromise.then((live) => {
            if (active && live) setCatalog(live);
        });
        return () => {
            active = false;
        };
    }, []);

    return catalog;
}
