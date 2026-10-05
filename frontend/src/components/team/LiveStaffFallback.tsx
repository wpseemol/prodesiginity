"use client";

import { useEffect, type ReactNode } from "react";

import StaffProfileView from "@/components/team/StaffProfileView";
import LoadErrorView from "@/components/ui/LoadErrorView";
import NotFoundView from "@/components/ui/NotFoundView";
import PageLoader from "@/components/ui/PageLoader";
import type { TeamMember } from "@/data/teamData";
import { LIVE_ROUTES } from "@/lib/live-routes";
import { fetchLiveStaff, fetchTeamFromApi, TEAM_BASE_PATH } from "@/lib/team-api";
import { useLiveLookup, type LiveLookup } from "@/lib/useLiveLookup";

type Found = { member: TeamMember; team: TeamMember[] };

async function loadStaff(slug: string): Promise<LiveLookup<Found>> {
    const [member, team] = await Promise.all([fetchLiveStaff(slug), fetchTeamFromApi()]);
    if (member) return { status: "found", data: { member, team: team ?? [] } };
    return team ? { status: "missing" } : { status: "error" };
}

/**
 * The static host serves 404.html for any URL it has no file for, including
 * staff added in the dashboard after the last build. This looks the slug up
 * in the live API and renders the profile; anything else shows `children`.
 */
export default function LiveStaffFallback({ children }: { children: ReactNode }) {
    const { slug, lookup, retry } = useLiveLookup(LIVE_ROUTES.staff, loadStaff);

    useEffect(() => {
        if (lookup?.status !== "found") return;
        const { member } = lookup.data;
        document.title = `${member.name} — ${member.role}`;
    }, [lookup]);

    if (!slug) return <>{children}</>;
    if (!lookup) return <PageLoader label="Loading profile" />;

    if (lookup.status === "error") {
        return (
            <LoadErrorView onRetry={retry} backHref={TEAM_BASE_PATH} backLabel="Meet the team" />
        );
    }

    if (lookup.status === "missing") {
        return (
            <NotFoundView
                title="Profile not found"
                message="This person may have moved on or changed their profile address."
                action={{ href: TEAM_BASE_PATH, label: "Meet the team" }}
            />
        );
    }

    return <StaffProfileView member={lookup.data.member} team={lookup.data.team} />;
}
