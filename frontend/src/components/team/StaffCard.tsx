/**
 * components/team/StaffCard.tsx
 * ---------------------------------------------------------------------------
 * One staff member in the /team directory and the "More of the team" strip.
 * The banner, avatar frame and badge all come from the member's profile
 * style, so a grid of cards reads as a team of different specialists rather
 * than a row of identical tiles.
 */

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import SocialLinks from "@/components/team/SocialLinks";
import StaffAvatar from "@/components/team/StaffAvatar";
import { resolveStaffStyle } from "@/data/staffStyles";
import type { TeamMember } from "@/data/teamData";
import { staffHref } from "@/lib/team-api";
import { cn } from "@/lib/utils";

/** Per-layout banner texture, so cards differ in more than colour. */
const BANNER_TEXTURE: Record<string, string> = {
    spotlight:
        "bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.45),transparent_55%)]",
    studio: "bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:18px_18px]",
    poster: "bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.18)_0_10px,transparent_10px_22px)]",
    terminal:
        "bg-[radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:10px_10px]",
    motion: "bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.22)_0_2px,transparent_2px_16px)]",
    classic:
        "bg-[radial-gradient(circle_at_80%_-20%,rgba(255,255,255,0.4),transparent_50%)]",
};

export default function StaffCard({
    member,
    compact = false,
}: {
    member: TeamMember;
    compact?: boolean;
}) {
    const style = resolveStaffStyle(member);
    const Icon = style.icon;

    return (
        <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border-color bg-card-bg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-dark-border-color dark:bg-dark-card-bg">
            <div
                className={cn(
                    "relative bg-linear-to-br",
                    compact ? "h-20" : "h-28",
                    style.classes.gradient,
                )}
            >
                <div
                    aria-hidden="true"
                    className={cn("absolute inset-0", BANNER_TEXTURE[style.layout])}
                />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
                    <Icon className="h-3 w-3" aria-hidden="true" />
                    {style.label}
                </span>
            </div>

            <div className={cn("relative flex flex-1 flex-col px-5 pb-5", compact ? "-mt-10" : "-mt-14")}>
                <StaffAvatar
                    member={member}
                    style={style}
                    className={cn(
                        "transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3",
                        compact ? "h-20 w-20" : "h-28 w-28",
                    )}
                    sizes={compact ? "80px" : "112px"}
                />

                <h3
                    className={cn(
                        "mt-4 font-black leading-tight text-slate-900 dark:text-white",
                        compact ? "text-base" : "text-lg",
                    )}
                >
                    <Link
                        href={staffHref(member)}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                        {member.name}
                    </Link>
                </h3>
                <p className={cn("mt-1 text-xs font-bold uppercase tracking-wider", style.classes.text)}>
                    {member.role}
                </p>

                {!compact && (member.tagline || member.description) ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {member.tagline || member.description}
                    </p>
                ) : null}

                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    {/* Above the stretched link so the icons stay clickable. */}
                    <div className="relative z-10">
                        <SocialLinks
                            socials={member.socials}
                            ownerName={member.name}
                            size="sm"
                        />
                    </div>
                    <span
                        className={cn(
                            "ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all group-hover:rotate-45",
                            style.classes.border,
                            style.classes.soft,
                            style.classes.text,
                        )}
                        aria-hidden="true"
                    >
                        <ArrowUpRight className="h-4 w-4" />
                    </span>
                </div>
            </div>
        </article>
    );
}
