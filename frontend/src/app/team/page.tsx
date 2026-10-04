/**
 * /team — the staff directory. Every card links to that member's profile
 * (/team/<slug>), and each one is styled for their craft (see
 * data/staffStyles.ts), so the grid previews the profile it leads to.
 */

import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";

import { HeaderPill } from "@/components/HeaderPill";
import JsonLd from "@/components/home/JsonLd";
import SocialLinks from "@/components/team/SocialLinks";
import StaffAvatar from "@/components/team/StaffAvatar";
import StaffCard from "@/components/team/StaffCard";
import StaffPortrait from "@/components/team/StaffPortrait";
import { siteConfig } from "@/config/site";
import { resolveStaffStyle, STAFF_STYLES, type StaffStyleKey } from "@/data/staffStyles";
import { breadcrumbSchema, buildMetadata, graph } from "@/lib/seo";
import { getTeamData, staffHref, TEAM_BASE_PATH } from "@/lib/team-api";
import { cn } from "@/lib/utils";

import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
    title: "Our Team — the specialists behind every project",
    description: `Meet the ${siteConfig.name} team: 3D product designers, graphic designers, developers, animators and marketers. You work directly with the people doing the work.`,
    path: TEAM_BASE_PATH,
});

export default async function TeamPage() {
    const team = await getTeamData();
    const lead = team.find((member) => member.lead);
    const rest = team.filter((member) => member !== lead);

    const counts = team.reduce<Partial<Record<StaffStyleKey, number>>>((acc, member) => {
        const key = resolveStaffStyle(member).key;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
    }, {});

    const leadStyle = lead ? resolveStaffStyle(lead) : null;

    return (
        <div className="relative overflow-x-clip bg-white font-sans text-slate-900 transition-colors duration-300 dark:bg-[#070B14] dark:text-slate-100">
            <JsonLd
                data={graph(
                    breadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Team", path: TEAM_BASE_PATH },
                    ]),
                )}
            />

            <header className="relative px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8">
                <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-linear-to-tr from-brand-violet/20 via-primary/10 to-cyan-400/20 blur-3xl" />
                <div className="container relative mx-auto max-w-3xl px-4">
                    <HeaderPill text="The Crew Behind It" className="sm:mb-6" />
                    <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                        Specialists, not{" "}
                        <span className="bg-linear-to-r from-primary via-brand-violet to-cyan-500 bg-clip-text text-transparent dark:from-primary dark:via-dark-primary dark:to-cyan-400">
                            account managers
                        </span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                        Small studio, specialist roles. Open any profile to see what
                        each person works on and where to find their work.
                    </p>

                    <ul className="mt-8 flex flex-wrap justify-center gap-2">
                        {(Object.keys(counts) as StaffStyleKey[]).map((key) => {
                            const style = STAFF_STYLES[key];
                            const Icon = style.icon;
                            return (
                                <li
                                    key={key}
                                    className={cn(
                                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold",
                                        style.classes.border,
                                        style.classes.soft,
                                        style.classes.text,
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                    {style.label}
                                    <span className="rounded-full bg-white/70 px-1.5 text-[10px] tabular-nums text-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                                        {counts[key]}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </header>

            <section className="relative px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
                <div className="container mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
                    {lead && leadStyle ? (
                        <article className={cn("group relative rounded-[2rem] bg-linear-to-br p-[2px] shadow-2xl", leadStyle.classes.gradient)}>
                            <div className="relative grid items-center gap-8 overflow-hidden rounded-[calc(2rem-2px)] bg-white p-6 sm:p-8 md:grid-cols-12 dark:bg-[#0A0E1A]">
                                <div aria-hidden="true" className={cn("pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full blur-3xl", leadStyle.classes.glow)} />
                                <div className="relative mx-auto aspect-4/5 w-full max-w-[15rem] overflow-hidden rounded-3xl shadow-xl md:col-span-4">
                                    <StaffPortrait
                                        member={lead}
                                        sizes="15rem"
                                        priority
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        initialsClassName="text-6xl"
                                    />
                                    {lead.photo ? (
                                        <span className="absolute bottom-3 right-3">
                                            <StaffAvatar member={lead} style={leadStyle} className="h-16 w-16" sizes="64px" />
                                        </span>
                                    ) : null}
                                </div>
                                <div className="relative md:col-span-8">
                                    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-linear-to-r px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white", leadStyle.classes.gradient)}>
                                        <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                                        {leadStyle.label}
                                    </span>
                                    <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                        <Link href={staffHref(lead)} className="after:absolute after:inset-0 after:content-['']">
                                            {lead.name}
                                        </Link>
                                    </h2>
                                    <p className={cn("mt-1.5 text-sm font-bold", leadStyle.classes.text)}>{lead.role}</p>
                                    {lead.tagline || lead.description ? (
                                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                                            {lead.tagline || lead.description}
                                        </p>
                                    ) : null}
                                    <div className="mt-6 flex flex-wrap items-center gap-4">
                                        <div className="relative z-10">
                                            <SocialLinks socials={lead.socials} ownerName={lead.name} solid size="sm" />
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                                            View profile
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ) : null}

                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {rest.map((member) => (
                            <li key={member.id}>
                                <StaffCard member={member} />
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}
