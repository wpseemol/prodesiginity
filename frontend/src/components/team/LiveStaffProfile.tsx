"use client";

import Link from "next/link";
import { useEffect } from "react";

import StaffProfileView from "@/components/team/StaffProfileView";
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
        if (!live) return null;
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-4 text-center dark:bg-[#070B14]">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    This profile is no longer available
                </h1>
                <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
                    This person may have moved on or changed their profile
                    address. Meet the rest of the team instead.
                </p>
                <Link
                    href={TEAM_BASE_PATH}
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
                >
                    Meet the team
                </Link>
            </div>
        );
    }

    return <StaffProfileView member={member} team={team} posts={posts} />;
}
