"use client";

import { useEffect } from "react";

import StaffProfileView from "@/components/team/StaffProfileView";
import NotFoundView from "@/components/ui/NotFoundView";
import PageLoader from "@/components/ui/PageLoader";
import type { BlogPost } from "@/data/blog/types";
import type { TeamMember } from "@/data/teamData";
import { findStaff, TEAM_BASE_PATH } from "@/lib/team-api";
import { useLiveTeam } from "@/lib/useTeam";

/**
 * Renders the profile baked into the static export, then swaps in the live
 * API version so dashboard edits (bio, photo, socials, skills, style) show up
 * without a redeploy.
 */
export default function LiveStaffProfile({
    slug,
    initialTeam,
    posts,
}: {
    slug: string;
    initialTeam: TeamMember[];
    posts: BlogPost[];
}) {
    const { team, live } = useLiveTeam(initialTeam);
    const member = findStaff(team, slug);

    useEffect(() => {
        if (!live || !member) return;
        document.title = `${member.name} — ${member.role}`;
        const description = member.tagline ?? member.description?.slice(0, 155);
        if (description) {
            document
                .querySelector('meta[name="description"]')
                ?.setAttribute("content", description);
        }
    }, [live, member]);

    if (!member) {
        if (!live) return <PageLoader label="Loading profile" />;
        return (
            <NotFoundView
                title="This profile is no longer available"
                message="This person may have moved on or changed their profile address. Meet the rest of the team instead."
                action={{ href: TEAM_BASE_PATH, label: "Meet the team" }}
            />
        );
    }

    return <StaffProfileView member={member} team={team} posts={posts} />;
}
