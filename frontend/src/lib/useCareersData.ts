"use client";

import { useEffect, useState } from "react";

import { fetchCareersData, type CareersData } from "@/lib/careers";

/**
 * Starts from the data baked into the static export, then swaps in the live
 * API copy so openings an admin adds or closes show up without a redeploy.
 */
export function useCareersData(initial: CareersData): CareersData {
    const [data, setData] = useState(initial);

    useEffect(() => {
        let active = true;
        void fetchCareersData().then((live) => {
            if (active && live) setData(live);
        });
        return () => {
            active = false;
        };
    }, []);

    return data;
}
