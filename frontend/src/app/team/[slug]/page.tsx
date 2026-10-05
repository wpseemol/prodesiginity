/**
 * /team/[slug]
 * ---------------------------------------------------------------------------
 * One profile page per staff member, from the dashboard-managed roster
 * (GET /api/team, falling back to data/teamData.ts).
 *
 * `generateStaticParams` emits every member known at build time, which is
 * what makes these routes work under `output: "export"`. The prebuilt HTML is
 * then refreshed in the browser from the live API (LiveStaffProfile), so bio,
 * photo and social-link edits in the dashboard apply without a redeploy.
 * Members added after the build are rendered client-side by LiveStaffFallback
 * (from the 404 page) until the next deploy.
 *
 * SEO: canonical URL, per-person title/description, ProfilePage + Person
 * (with sameAs socials) + BreadcrumbList JSON-LD (in StaffProfileView).
 */

import { notFound } from "next/navigation";

import LiveStaffProfile from "@/components/team/LiveStaffProfile";
import { siteConfig } from "@/config/site";
import { resolveStaffStyle } from "@/data/staffStyles";
import { getBlogData } from "@/lib/blog-api";
import { buildMetadata } from "@/lib/seo";
import {
    findStaff,
    getTeamData,
    postsByMember,
    staffHref,
    staffImage,
    staffSlug,
} from "@/lib/team-api";

import type { Metadata } from "next";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
    const team = await getTeamData();
    return team.map((member) => ({ slug: staffSlug(member) }));
}

export const dynamicParams = false;

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { slug } = await params;
    const member = findStaff(await getTeamData(), slug);

    if (!member) {
        return { title: "Team member not found", robots: { index: false, follow: true } };
    }

    const style = resolveStaffStyle(member);
    const description =
        member.tagline ??
        member.description?.slice(0, 155) ??
        `${member.name} is a ${member.role} at ${siteConfig.name}. Specialties: ${style.focus.slice(0, 3).join(", ")}.`;

    return buildMetadata({
        title: `${member.name} — ${member.role}`,
        description,
        path: staffHref(member),
        image: staffImage(member),
        imageAlt: member.photoAlt ?? `${member.name}, ${member.role}`,
    });
}

export default async function StaffProfilePage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { slug } = await params;
    const [team, { posts }] = await Promise.all([getTeamData(), getBlogData()]);
    const member = findStaff(team, slug);

    if (!member) notFound();

    return (
        <LiveStaffProfile
            slug={staffSlug(member)}
            initialTeam={team}
            posts={postsByMember(posts, member)}
        />
    );
}
