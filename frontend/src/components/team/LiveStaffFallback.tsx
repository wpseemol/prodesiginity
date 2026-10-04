"use client";

import {
    useEffect,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";

import StaffProfileView from "@/components/team/StaffProfileView";
import type { TeamMember } from "@/data/teamData";
import { fetchLiveStaff, fetchTeamFromApi, TEAM_BASE_PATH } from "@/lib/team-api";

const PROFILE_PATH = new RegExp(`^${TEAM_BASE_PATH}/([a-zA-Z0-9._-]{1,80})/?$`);

const subscribe = () => () => {};

/** On the static 404 page the router pathname is the not-found route. */
function requestedSlug(): string | null {
    const match = window.location.pathname.match(PROFILE_PATH);
    return match ? match[1] : null;
}

type Lookup = { slug: string; member: TeamMember | null; team: TeamMember[] };

/**
 * The static host serves 404.html for any URL it has no file for, including
 * staff added in the dashboard after the last build. This looks the slug up
 * in the live API and renders the profile; anything else shows `children`.
 */
export default function LiveStaffFallback({ children }: { children: ReactNode }) {
    const slug = useSyncExternalStore(subscribe, requestedSlug, () => null);
    const [lookup, setLookup] = useState<Lookup | null>(null);

    useEffect(() => {
        if (!slug) return;
        let active = true;

        void Promise.all([fetchLiveStaff(slug), fetchTeamFromApi()]).then(([member, team]) => {
            if (!active) return;
            if (member) document.title = `${member.name} — ${member.role}`;
            setLookup({ slug, member, team: team ?? [] });
        });

        return () => {
            active = false;
        };
    }, [slug]);

    if (!slug) return <>{children}</>;

    if (lookup?.slug !== slug) {
        return (
            <div
                className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-[#070B14]"
                aria-busy="true"
            >
                <span className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
        );
    }

    if (lookup.member) return <StaffProfileView member={lookup.member} team={lookup.team} />;

    return <>{children}</>;
}
