/**
 * components/team/StaffProfileView.tsx
 * ---------------------------------------------------------------------------
 * A whole staff profile page. Rendered by /team/[slug] at build time (server)
 * and by LiveStaffFallback for members added after the last build (client),
 * so both paths produce the same markup and structured data.
 *
 * Layout: style-specific hero (StaffHero) → about / specialties / articles
 * with a sticky Connect rail → the rest of the team.
 */

import Link from "next/link";
import { ArrowRight, Mail, PenLine, Sparkles } from "lucide-react";

import BlogCard from "@/components/blog/BlogCard";
import JsonLd from "@/components/home/JsonLd";
import SocialLinks, { socialEntries } from "@/components/team/SocialLinks";
import StaffAvatar from "@/components/team/StaffAvatar";
import StaffCard from "@/components/team/StaffCard";
import StaffHero from "@/components/team/StaffHero";
import { siteConfig } from "@/config/site";
import type { BlogPost } from "@/data/blog/types";
import { resolveStaffStyle } from "@/data/staffStyles";
import type { TeamMember } from "@/data/teamData";
import { firstName, staffHref, staffSlug, TEAM_BASE_PATH } from "@/lib/team-api";
import { breadcrumbSchema, graph, staffProfileSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

interface StaffProfileViewProps {
    member: TeamMember;
    team: TeamMember[];
    posts?: BlogPost[];
}

/** Bio paragraphs, or a sensible default so the page is never empty. */
function bioParagraphs(member: TeamMember, label: string): string[] {
    const text = member.description?.trim();
    if (text) return text.split(/\n{2,}|\r\n\r\n/).map((p) => p.trim()).filter(Boolean);
    return [
        `${member.name} is part of the ${siteConfig.name} studio, working as ${member.role}. ${firstName(member)} works directly with clients — no account managers relaying messages — so the person you brief is the person doing the work.`,
        `Every project ${firstName(member)} touches goes through the studio's review before delivery, so what lands in your inbox is ready to publish. Reach out through the contact page to brief ${firstName(member)} on your next ${label.toLowerCase()} project.`,
    ];
}

export function staffSchema(member: TeamMember, skills: string[]) {
    const path = staffHref(member);
    return graph(
        staffProfileSchema({
            name: member.name,
            role: member.role,
            path,
            image: member.photo,
            description: member.description ?? member.tagline,
            sameAs: socialEntries(member.socials).map((entry) => entry.url),
            knowsAbout: skills,
        }),
        breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Team", path: TEAM_BASE_PATH },
            { name: member.name, path },
        ]),
    );
}

export default function StaffProfileView({ member, team, posts = [] }: StaffProfileViewProps) {
    const style = resolveStaffStyle(member);
    const skills = member.skills?.length ? member.skills : style.focus;
    const first = firstName(member);
    const others = team.filter((m) => staffSlug(m) !== staffSlug(member)).slice(0, 4);
    const hasSocials = socialEntries(member.socials).length > 0;
    const hasSeparateAvatar = Boolean(member.avatar && member.avatar !== member.photo);

    return (
        <div className="relative overflow-x-clip bg-white font-sans text-slate-900 transition-colors duration-300 dark:bg-[#070B14] dark:text-slate-100">
            <JsonLd data={staffSchema(member, skills)} />

            <StaffHero member={member} style={style} skills={skills} />

            <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="container mx-auto grid grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
                    <div className="space-y-14 lg:col-span-8">
                        <div>
                            <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                <span className={cn("h-8 w-1.5 rounded-full bg-linear-to-b", style.classes.gradient)} aria-hidden="true" />
                                About {first}
                            </h2>
                            <div className="mt-6 space-y-4 text-[15px] leading-8 text-slate-600 sm:text-base dark:text-slate-300">
                                {bioParagraphs(member, style.label).map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                <span className={cn("h-8 w-1.5 rounded-full bg-linear-to-b", style.classes.gradient)} aria-hidden="true" />
                                What {first} works on
                            </h2>
                            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                                {skills.map((skill, i) => (
                                    <li
                                        key={skill}
                                        className="group flex items-center gap-3 rounded-2xl border border-border-color bg-card-bg p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-dark-border-color dark:bg-dark-card-bg"
                                    >
                                        <span
                                            className={cn(
                                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-black",
                                                style.classes.chip,
                                            )}
                                        >
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            {skill}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {posts.length > 0 && (
                            <div>
                                <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                    <span className={cn("h-8 w-1.5 rounded-full bg-linear-to-b", style.classes.gradient)} aria-hidden="true" />
                                    Articles by {first}
                                </h2>
                                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {posts.slice(0, 4).map((post) => (
                                        <BlogCard key={post.slug} post={post} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="lg:col-span-4">
                        <div className="space-y-5 lg:sticky lg:top-28">
                            {/* Profile card: avatar + real portrait side by side. */}
                            <div className="overflow-hidden rounded-3xl border border-border-color bg-card-bg shadow-lg dark:border-dark-border-color dark:bg-dark-card-bg">
                                <div className={cn("h-16 bg-linear-to-r", style.classes.gradient)} />
                                <div className="-mt-10 flex items-end gap-3 px-5">
                                    <StaffAvatar member={member} style={style} className="h-20 w-20" sizes="80px" />
                                    {hasSeparateAvatar ? (
                                        <StaffAvatar
                                            member={member}
                                            style={style}
                                            source="photo"
                                            shape="circle"
                                            ring={false}
                                            className="mb-1 h-11 w-11 border-2 border-white shadow-md dark:border-slate-900"
                                            sizes="44px"
                                        />
                                    ) : null}
                                </div>
                                <div className="px-5 pb-5 pt-3">
                                    <p className="text-base font-black text-slate-900 dark:text-white">{member.name}</p>
                                    <p className={cn("text-xs font-bold uppercase tracking-wider", style.classes.text)}>
                                        {member.role}
                                    </p>
                                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                        {style.label} at {siteConfig.name}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-border-color bg-card-bg p-5 shadow-lg dark:border-dark-border-color dark:bg-dark-card-bg">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-900 dark:text-white">
                                    Connect with {first}
                                </h2>
                                {hasSocials ? (
                                    <SocialLinks
                                        socials={member.socials}
                                        ownerName={member.name}
                                        variant="tiles"
                                        className="mt-4"
                                    />
                                ) : (
                                    <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        {first} has not linked any social accounts yet. Reach the studio
                                        directly and we will put you in touch.
                                    </p>
                                )}
                            </div>

                            <div className={cn("relative overflow-hidden rounded-3xl bg-linear-to-br p-6 text-white shadow-xl", style.classes.gradient)}>
                                <div aria-hidden="true" className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                                <p className="relative text-lg font-black leading-snug">
                                    Work with {first}
                                </p>
                                <p className="relative mt-1.5 text-sm text-white/85">
                                    Book a 30-minute call — scope, timeline and cost, no obligation.
                                </p>
                                <Link
                                    href={siteConfig.contactPath}
                                    className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5"
                                >
                                    <Mail className="h-4 w-4" aria-hidden="true" />
                                    {style.cta}
                                </Link>
                            </div>

                            {posts.length > 0 ? (
                                <p className="inline-flex items-center gap-2 px-1 text-xs text-slate-500 dark:text-slate-400">
                                    <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                                    {posts.length} article{posts.length === 1 ? "" : "s"} in the Journal
                                </p>
                            ) : null}
                        </div>
                    </aside>
                </div>
            </section>

            {others.length > 0 && (
                <section className="relative border-t border-border-color bg-slate-50/60 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 dark:border-dark-border-color dark:bg-[#0A0F1C]">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                More of the team
                            </h2>
                            <Link
                                href={TEAM_BASE_PATH}
                                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-primary-hover dark:text-dark-primary"
                            >
                                Everyone at {siteConfig.name}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>
                        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {others.map((other) => (
                                <li key={other.id}>
                                    <StaffCard member={other} compact />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </div>
    );
}
