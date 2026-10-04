"use client";

import { useEffect, useState } from "react";

import type { Industry } from "@/data/industriesData";
import { STATIC_INDUSTRIES, fetchIndustries } from "@/lib/industries-catalog";

let livePromise: Promise<Industry[] | null> | null = null;

/**
 * Starts from the list baked into the static export, then swaps in the live
 * API list so industries an admin adds show up without a redeploy. One request
 * is shared by every component on the page.
 */
export function useIndustries(
    initial: Industry[] = STATIC_INDUSTRIES,
): Industry[] {
    const [industries, setIndustries] = useState(initial);

    useEffect(() => {
        let active = true;
        livePromise ??= fetchIndustries();
        void livePromise.then((live) => {
            if (active && live) setIndustries(live);
        });
        return () => {
            active = false;
        };
    }, []);

    return industries;
}
