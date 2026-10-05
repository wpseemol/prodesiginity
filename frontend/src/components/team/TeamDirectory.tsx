"use client";

import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";

import SocialLinks from "@/components/team/SocialLinks";
import StaffAvatar from "@/components/team/StaffAvatar";
import StaffCard from "@/components/team/StaffCard";
import StaffPortrait from "@/components/team/StaffPortrait";
import { resolveStaffStyle, STAFF_STYLES, type StaffStyleKey } from "@/data/staffStyles";
import type { TeamMember } from "@/data/teamData";
import { staffHref } from "@/lib/team-api";
import { useLiveTeam } from "@/lib/useTeam";
import { cn } from "@/lib/utils";

/** Speciality chips. Live, so the counts follow the dashboard roster. */
export function TeamSpecialities({ initialTeam }: { initialTeam: TeamMember[] }) {
    const { team } = useLiveTeam(initialTeam);
    const counts = team.reduce<Partial<Record<StaffStyleKey, number>>>((acc, member) => {
        const key = resolveStaffStyle(member).key;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
    }, {});

    return (
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
    );
}

/**
 * The lead spotlight and the staff grid. Starts from the build-time roster,
 * then swaps in the live API roster (names, photos, socials, new members).
 */
export default function TeamDirectory({ initialTeam }: { initialTeam: TeamMember[] }) {
    const { team } = useLiveTeam(initialTeam);
    const lead = team.find((member) => member.lead);
    const rest = team.filter((member) => member !== lead);
    const leadStyle = lead ? resolveStaffStyle(lead) : null;

    return (
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
    );
}
