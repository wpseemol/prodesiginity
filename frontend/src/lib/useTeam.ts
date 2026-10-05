"use client";

import { useEffect, useState } from "react";

import type { TeamMember } from "@/data/teamData";
import { fetchTeamFromApi } from "@/lib/team-api";

let livePromise: Promise<TeamMember[] | null> | null = null;

/**
 * Starts from the roster baked into the static export, then swaps in the live
 * API roster so profile edits in the dashboard (bio, photo, socials, skills…)
 * show up without a redeploy. Components mounting together share one request;
 * later mounts (e.g. after a client-side navigation) fetch again.
 *
 * `live` turns true once the API answered, so callers can tell "not in the
 * live roster" (removed in the dashboard) from "still loading".
 */
export function useLiveTeam(initial: TeamMember[]): { team: TeamMember[]; live: boolean } {
    const [state, setState] = useState({ team: initial, live: false });

    useEffect(() => {
        let active = true;
        let request = livePromise;
        if (!request) {
            const fresh = fetchTeamFromApi();
            request = livePromise = fresh;
            void fresh.finally(() => {
                if (livePromise === fresh) livePromise = null;
            });
        }
        void request.then((team) => {
            if (active && team) setState({ team, live: true });
        });
        return () => {
            active = false;
        };
    }, []);

    return state;
}
