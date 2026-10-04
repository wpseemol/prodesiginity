/**
 * components/team/StaffHero.tsx
 * ---------------------------------------------------------------------------
 * The top of a staff profile, in one of six layouts picked by the member's
 * profile style (data/staffStyles.ts):
 *
 *   spotlight — founder: gradient-framed portrait, crown, signature quote
 *   studio    — 3D designer: portrait inside a render-viewport window
 *   poster    — graphic designer: colour-blocked poster, taped print, swatches
 *   terminal  — developer: the bio is a shell session
 *   motion    — animator: onion-skinned portrait over a timeline scrubber
 *   classic   — marketing / people: banner + overlapping avatar
 *
 * Every layout renders the page's single <h1> (the member's name).
 */

import Link from "next/link";
import { ArrowRight, ChevronRight, Crown, Play, Quote, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

import SmartImage from "@/components/home/portfolio/SmartImage";
import SocialLinks from "@/components/team/SocialLinks";
import StaffAvatar from "@/components/team/StaffAvatar";
import { siteConfig } from "@/config/site";
import type { StaffStyle } from "@/data/staffStyles";
import type { TeamMember } from "@/data/teamData";
import { firstName, staffSlug, TEAM_BASE_PATH } from "@/lib/team-api";
import { cn } from "@/lib/utils";

interface HeroProps {
    member: TeamMember;
    style: StaffStyle;
    skills: string[];
}

/* ------------------------------------------------------------ Shared bits */

function Crumbs({ member, tone = "default" }: { member: TeamMember; tone?: "default" | "light" }) {
    const muted =
        tone === "light" ? "text-white/70" : "text-slate-500 dark:text-slate-400";
    const current = tone === "light" ? "text-white" : "text-slate-900 dark:text-white";

    return (
        <nav aria-label="Breadcrumb" className={cn("mb-8 text-xs font-medium", muted)}>
            <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                    <Link href="/" className="transition-opacity hover:opacity-80">
                        Home
                    </Link>
                </li>
                <li aria-hidden="true">
                    <ChevronRight className="h-3 w-3" />
                </li>
                <li>
                    <Link href={TEAM_BASE_PATH} className="transition-opacity hover:opacity-80">
                        Team
                    </Link>
                </li>
                <li aria-hidden="true">
                    <ChevronRight className="h-3 w-3" />
                </li>
                <li className={cn("font-semibold", current)} aria-current="page">
                    {member.name}
                </li>
            </ol>
        </nav>
    );
}

function Kicker({ style, className }: { style: StaffStyle; className?: string }) {
    const Icon = style.icon;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-widest",
                style.classes.border,
                style.classes.soft,
                style.classes.text,
                className,
            )}
        >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {style.label}
        </span>
    );
}

function Actions({
    member,
    style,
    tone = "default",
}: {
    member: TeamMember;
    style: StaffStyle;
    tone?: "default" | "light" | "terminal";
}) {
    return (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
                href={siteConfig.contactPath}
                className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl",
                    tone === "light"
                        ? "bg-white text-slate-900"
                        : cn("bg-linear-to-r text-white", style.classes.gradient),
                    tone === "terminal" && "font-mono text-slate-950",
                )}
            >
                {style.cta} with {firstName(member)}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
                href={TEAM_BASE_PATH}
                className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-bold transition-all",
                    tone === "light"
                        ? "border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                        : tone === "terminal"
                          ? "border-emerald-500/30 bg-emerald-500/5 font-mono text-emerald-300 hover:bg-emerald-500/10"
                          : "border-border-color bg-slate-100 text-slate-700 hover:border-primary/40 dark:border-dark-border-color dark:bg-slate-800/70 dark:text-slate-200",
                )}
            >
                <UsersRound className="h-4 w-4" aria-hidden="true" />
                Meet the team
            </Link>
        </div>
    );
}

function Portrait({
    member,
    className,
    priority = true,
}: {
    member: TeamMember;
    className?: string;
    priority?: boolean;
}) {
    return (
        <div className={cn("relative overflow-hidden bg-slate-200 dark:bg-slate-800", className)}>
            <SmartImage
                src={member.photo}
                alt={member.photoAlt ?? `${member.name}, ${member.role} at ${siteConfig.name}`}
                fallbackLabel={member.name}
                fill
                sizes="(max-width: 1024px) 90vw, 32rem"
                priority={priority}
                className="object-cover"
                draggable={false}
            />
        </div>
    );
}

function Section({
    children,
    className,
    backdrop,
}: {
    children: ReactNode;
    className?: string;
    /** Full-bleed decoration rendered behind the container. */
    backdrop?: ReactNode;
}) {
    return (
        <header className={cn("relative px-4 sm:px-6 lg:px-8", className)}>
            {backdrop}
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
        </header>
    );
}

/* -------------------------------------------------------------- Spotlight */

function SpotlightHero({ member, style }: HeroProps) {
    return (
        <Section className="pb-16 pt-10 sm:pt-14">
            <Crumbs member={member} />
            <div className={cn("relative rounded-[2.5rem] bg-linear-to-br p-[2px] shadow-2xl shadow-fuchsia-500/20", style.classes.gradient)}>
                <div className="relative overflow-hidden rounded-[calc(2.5rem-2px)] bg-white dark:bg-[#0A0E1A]">
                    <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
                    <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

                    <div className="relative grid gap-12 p-6 sm:p-10 lg:grid-cols-12 lg:items-center lg:p-14">
                        <div className="relative mx-auto w-full max-w-sm lg:col-span-5">
                            <Portrait member={member} className="aspect-4/5 rounded-[2rem] shadow-2xl ring-1 ring-black/5" />
                            <span className={cn("absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg", style.classes.gradient)}>
                                <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                                Founder
                            </span>
                            <StaffAvatar
                                member={member}
                                style={style}
                                className="absolute -bottom-8 -right-6 h-28 w-28 sm:h-32 sm:w-32"
                                sizes="128px"
                            />
                        </div>

                        <div className="lg:col-span-7">
                            <Kicker style={style} />
                            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                                {member.name}
                            </h1>
                            <p className={cn("mt-3 bg-linear-to-r bg-clip-text text-lg font-black text-transparent sm:text-xl", style.classes.gradient)}>
                                {member.role}
                            </p>
                            {member.tagline ? (
                                <blockquote className="relative mt-8 max-w-xl border-l-2 border-fuchsia-500/40 pl-6 text-lg font-medium italic leading-relaxed text-slate-600 dark:text-slate-300">
                                    <Quote className="absolute -left-3 -top-2 h-6 w-6 rounded-full bg-white p-1 text-fuchsia-500 dark:bg-[#0A0E1A]" aria-hidden="true" />
                                    {member.tagline}
                                </blockquote>
                            ) : null}
                            <SocialLinks socials={member.socials} ownerName={member.name} solid className="mt-8" />
                            <Actions member={member} style={style} />
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}

/* ----------------------------------------------------------------- Studio */

function StudioHero({ member, style, skills }: HeroProps) {
    return (
        <Section className="overflow-hidden pb-20 pt-10 sm:pt-14">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(124,58,237,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,58,237,0.07)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
            />
            <Crumbs member={member} />
            <div className="relative grid items-center gap-14 lg:grid-cols-2">
                <div>
                    <Kicker style={style} />
                    <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                        {member.name}
                    </h1>
                    <p className={cn("mt-3 text-lg font-bold", style.classes.text)}>{member.role}</p>
                    {member.tagline ? (
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                            {member.tagline}
                        </p>
                    ) : null}

                    <div className="mt-7 rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur dark:border-dark-border-color dark:bg-slate-900/50">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Scene outliner
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {skills.slice(0, 5).map((skill, i) => (
                                <li
                                    key={skill}
                                    className="inline-flex items-center gap-2 rounded-lg border border-border-color bg-white px-2.5 py-1 font-mono text-xs text-slate-700 dark:border-dark-border-color dark:bg-slate-950 dark:text-slate-300"
                                >
                                    <span className={cn("h-2 w-2 rounded-sm bg-linear-to-br", style.classes.gradient)} style={{ opacity: 1 - i * 0.12 }} />
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <SocialLinks socials={member.socials} ownerName={member.name} className="mt-7" />
                    <Actions member={member} style={style} />
                </div>

                <div className="relative mx-auto w-full max-w-lg">
                    <div aria-hidden="true" className={cn("absolute -inset-8 rounded-full blur-3xl", style.classes.glow)} />
                    <div className="relative rounded-3xl border border-slate-800 bg-slate-950 p-2 shadow-2xl">
                        <div className="flex items-center gap-2 px-3 py-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                            <span className="ml-3 truncate font-mono text-[11px] text-slate-400">
                                viewport — {staffSlug(member)}.blend
                            </span>
                            <span className={cn("ml-auto rounded-md bg-linear-to-r px-2 py-0.5 font-mono text-[10px] font-bold text-white", style.classes.gradient)}>
                                RENDER
                            </span>
                        </div>
                        <div className="relative">
                            <Portrait member={member} className="aspect-4/5 rounded-2xl sm:aspect-5/6" />
                            {(["left-3 top-3 border-l-2 border-t-2", "right-3 top-3 border-r-2 border-t-2", "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"] as const).map((pos) => (
                                <span key={pos} aria-hidden="true" className={cn("absolute h-6 w-6 border-white/70", pos)} />
                            ))}
                            <svg aria-hidden="true" viewBox="0 0 48 48" className="absolute bottom-5 left-5 h-12 w-12">
                                <line x1="12" y1="36" x2="40" y2="36" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
                                <line x1="12" y1="36" x2="12" y2="8" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
                                <line x1="12" y1="36" x2="28" y2="20" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
                                <circle cx="12" cy="36" r="3" fill="white" />
                            </svg>
                            <span className="absolute bottom-5 right-5 rounded-md bg-black/60 px-2 py-1 font-mono text-[10px] text-white/80 backdrop-blur">
                                Cycles · 2048 spp · 4K
                            </span>
                        </div>
                    </div>

                    <div className="absolute -bottom-10 -left-4 flex items-end gap-3 sm:-left-10">
                        <StaffAvatar member={member} style={style} className="h-24 w-24 sm:h-28 sm:w-28" sizes="112px" />
                    </div>
                    <span className="absolute -right-3 top-16 hidden rounded-xl border border-border-color bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xl sm:block dark:border-dark-border-color dark:bg-slate-900 dark:text-slate-200">
                        <span className={cn("mr-1.5 inline-block h-2 w-2 rounded-full bg-linear-to-br", style.classes.gradient)} />
                        Lighting pass
                    </span>
                    <span className="absolute -right-6 top-32 hidden rounded-xl border border-border-color bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xl sm:block dark:border-dark-border-color dark:bg-slate-900 dark:text-slate-200">
                        <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                        Materials ✓
                    </span>
                </div>
            </div>
        </Section>
    );
}

/* ----------------------------------------------------------------- Poster */

const SWATCHES = [
    { hex: "#D946EF", className: "bg-[#D946EF]" },
    { hex: "#EC4899", className: "bg-[#EC4899]" },
    { hex: "#FB923C", className: "bg-[#FB923C]" },
    { hex: "#FACC15", className: "bg-[#FACC15]" },
    { hex: "#0F172A", className: "bg-[#0F172A]" },
];

function PosterHero({ member, style }: HeroProps) {
    return (
        <header className={cn("relative overflow-hidden bg-linear-to-br px-4 pb-24 pt-10 text-white sm:px-6 sm:pt-14 lg:px-8", style.classes.gradient)}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1.5px,transparent_1.5px)] bg-[size:14px_14px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
            <p
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-6 left-0 right-0 select-none whitespace-nowrap text-center text-[22vw] font-black uppercase leading-none tracking-tighter text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.22)]"
            >
                {firstName(member)}
            </p>

            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <Crumbs member={member} tone="light" />
                <div className="grid items-center gap-14 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest backdrop-blur">
                            <style.icon className="h-3.5 w-3.5" aria-hidden="true" />
                            {style.label}
                        </span>
                        <h1 className="mt-6 text-5xl font-black uppercase leading-[0.9] tracking-tight drop-shadow-sm sm:text-6xl lg:text-7xl">
                            {member.name}
                        </h1>
                        <p className="mt-6 inline-block -rotate-2 bg-slate-950 px-4 py-2 text-sm font-black uppercase tracking-widest text-white shadow-xl">
                            {member.role}
                        </p>
                        {member.tagline ? (
                            <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed text-white/90">
                                {member.tagline}
                            </p>
                        ) : null}

                        <ul className="mt-8 flex gap-2" aria-label="Signature palette">
                            {SWATCHES.map((swatch) => (
                                <li key={swatch.hex} className="group">
                                    <span className={cn("block h-12 w-12 rounded-xl border-2 border-white/80 shadow-lg transition-transform group-hover:-translate-y-1 sm:h-14 sm:w-14", swatch.className)} />
                                    <span className="mt-1 block text-center font-mono text-[9px] font-bold text-white/80">
                                        {swatch.hex}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <SocialLinks socials={member.socials} ownerName={member.name} solid className="mt-8" />
                        <Actions member={member} style={style} tone="light" />
                    </div>

                    <div className="relative mx-auto w-full max-w-sm lg:col-span-5">
                        <div className="relative rotate-3 rounded-[1.75rem] bg-white p-3 pb-16 shadow-2xl transition-transform duration-500 hover:rotate-0">
                            <span aria-hidden="true" className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-3 bg-white/70 shadow-sm backdrop-blur" />
                            <Portrait member={member} className="aspect-4/5 rounded-2xl" />
                            <p className="absolute bottom-5 left-5 right-5 flex items-baseline justify-between text-slate-900">
                                <span className="text-lg font-black">{firstName(member)}.</span>
                                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Selected work
                                </span>
                            </p>
                        </div>
                        <div className="absolute -bottom-6 -left-6 -rotate-6 sm:-left-12">
                            <StaffAvatar member={member} style={style} className="h-28 w-28 sm:h-32 sm:w-32" sizes="128px" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

/* --------------------------------------------------------------- Terminal */

function Prompt({ children }: { children: ReactNode }) {
    return (
        <p className="text-slate-500">
            <span className="text-emerald-400">➜</span>{" "}
            <span className="text-sky-400">~</span>{" "}
            <span className="text-slate-300">{children}</span>
        </p>
    );
}

function TerminalHero({ member, style, skills }: HeroProps) {
    return (
        <header className="relative overflow-hidden bg-[#05080F] px-4 pb-20 pt-10 text-slate-200 sm:px-6 sm:pt-14 lg:px-8">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.14)_1px,transparent_1px)] bg-[size:22px_22px]" />
            <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <Crumbs member={member} tone="light" />
                <div className="grid items-center gap-12 lg:grid-cols-12">
                    <div className="mx-auto flex flex-col items-center text-center lg:col-span-4">
                        <div className="relative">
                            <StaffAvatar member={member} style={style} className="h-44 w-44 sm:h-52 sm:w-52" sizes="208px" priority />
                            <span className="absolute bottom-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#05080F]">
                                <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
                            </span>
                        </div>
                        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] text-emerald-300">
                            <style.icon className="h-3.5 w-3.5" aria-hidden="true" />
                            status: shipping
                        </p>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-black/60 shadow-2xl shadow-emerald-500/10 backdrop-blur">
                            <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-3">
                                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                                <span className="ml-3 truncate font-mono text-xs text-slate-500">
                                    ~/prodesignity/team/{staffSlug(member)} — zsh
                                </span>
                            </div>
                            <div className="space-y-4 p-5 font-mono text-sm sm:p-7">
                                <div>
                                    <Prompt>whoami</Prompt>
                                    <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-5xl">
                                        {member.name}
                                    </h1>
                                </div>
                                <div>
                                    <Prompt>cat role.txt</Prompt>
                                    <p className="mt-1 text-emerald-300">{member.role}</p>
                                </div>
                                {member.tagline ? (
                                    <div>
                                        <Prompt>echo $MOTTO</Prompt>
                                        <p className="mt-1 text-amber-200/90">“{member.tagline}”</p>
                                    </div>
                                ) : null}
                                <div>
                                    <Prompt>ls ./stack</Prompt>
                                    <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                                        {skills.map((skill) => (
                                            <li key={skill} className="text-sky-300">
                                                {skill.toLowerCase().replace(/\s+/g, "-")}
                                                <span className="text-slate-600">/</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {Object.keys(member.socials ?? {}).length > 0 ? (
                                    <div>
                                        <Prompt>open --links</Prompt>
                                        <SocialLinks socials={member.socials} ownerName={member.name} variant="terminal" className="mt-1" />
                                    </div>
                                ) : null}
                                <p className="text-slate-500">
                                    <span className="text-emerald-400">➜</span> <span className="text-sky-400">~</span>{" "}
                                    <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-emerald-400" aria-hidden="true" />
                                </p>
                            </div>
                        </div>
                        <Actions member={member} style={style} tone="terminal" />
                    </div>
                </div>
            </div>
        </header>
    );
}

/* ----------------------------------------------------------------- Motion */

function MotionHero({ member, style, skills }: HeroProps) {
    return (
        <Section
            className="overflow-hidden pb-20 pt-10 sm:pt-14"
            backdrop={
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-linear-to-b from-orange-500/10 via-amber-500/5 to-transparent" />
            }
        >
            <Crumbs member={member} />
            <div className="relative grid items-center gap-16 lg:grid-cols-2">
                <div className="relative mx-auto w-full max-w-sm">
                    {/* Onion skin: previous frames trail behind the portrait. */}
                    <Portrait member={member} priority={false} className="absolute inset-x-0 top-0 aspect-4/5 -translate-x-[16%] rotate-[-6deg] rounded-3xl opacity-20 grayscale" />
                    <Portrait member={member} priority={false} className="absolute inset-x-0 top-0 aspect-4/5 -translate-x-[8%] rotate-[-3deg] rounded-3xl opacity-40 grayscale" />
                    <Portrait member={member} className="relative aspect-4/5 rounded-3xl shadow-2xl ring-4 ring-white dark:ring-slate-900" />

                    <div className="absolute -right-6 -top-6">
                        <span aria-hidden="true" className="absolute -inset-2 animate-[spin_14s_linear_infinite] rounded-full border-2 border-dashed border-orange-400/70" />
                        <StaffAvatar member={member} style={style} className="h-24 w-24 sm:h-28 sm:w-28" sizes="112px" />
                    </div>

                    <div className="relative mt-6 rounded-2xl border border-border-color bg-white/80 p-3 shadow-lg backdrop-blur dark:border-dark-border-color dark:bg-slate-900/70">
                        <div className="flex items-center gap-3">
                            <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br text-white", style.classes.gradient)}>
                                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                            </span>
                            <span className="font-mono text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200">
                                00:00:12:08
                            </span>
                            <span className="ml-auto font-mono text-[10px] text-slate-400">24 fps</span>
                        </div>
                        <div className="relative mt-3 h-6" aria-hidden="true">
                            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-800" />
                            <div className={cn("absolute left-0 top-1/2 h-1 w-[62%] -translate-y-1/2 rounded-full bg-linear-to-r", style.classes.gradient)} />
                            {[8, 30, 62, 86].map((left) => (
                                <span key={left} className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-white bg-orange-500 shadow dark:border-slate-900" style={{ left: `${left}%` }} />
                            ))}
                            <span className="absolute -top-1 bottom-[-4px] left-[62%] w-0.5 bg-orange-500" />
                        </div>
                    </div>
                </div>

                <div>
                    <Kicker style={style} />
                    <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                        {member.name}
                    </h1>
                    <p className={cn("mt-3 text-lg font-bold", style.classes.text)}>{member.role}</p>
                    {member.tagline ? (
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                            {member.tagline}
                        </p>
                    ) : null}
                    <ul className="mt-6 flex flex-wrap gap-2">
                        {skills.slice(0, 5).map((skill) => (
                            <li key={skill} className={cn("rounded-full border px-3 py-1 text-xs font-bold", style.classes.chip)}>
                                {skill}
                            </li>
                        ))}
                    </ul>
                    <SocialLinks socials={member.socials} ownerName={member.name} variant="pills" className="mt-7" />
                    <Actions member={member} style={style} />
                </div>
            </div>
        </Section>
    );
}

/* ---------------------------------------------------------------- Classic */

function ClassicHero({ member, style }: HeroProps) {
    const Icon = style.icon;

    return (
        <Section className="pb-12 pt-10 sm:pt-14">
            <Crumbs member={member} />
            <div className={cn("relative h-44 overflow-hidden rounded-[2rem] bg-linear-to-br shadow-xl sm:h-60", style.classes.gradient)}>
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_85%_-10%,rgba(255,255,255,0.45),transparent_45%)]" />
                {style.key === "marketing" ? (
                    <svg aria-hidden="true" viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-2/3 w-full">
                        <polyline points="0,110 50,95 100,100 150,70 200,78 250,45 300,52 350,20 400,10" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinejoin="round" />
                        <polygon points="0,110 50,95 100,100 150,70 200,78 250,45 300,52 350,20 400,10 400,120 0,120" fill="rgba(255,255,255,0.12)" />
                    </svg>
                ) : (
                    <Icon aria-hidden="true" className="absolute -bottom-10 right-6 h-56 w-56 text-white/15" strokeWidth={1.2} />
                )}
            </div>

            <div className="relative -mt-16 flex flex-col items-center gap-6 px-2 text-center sm:-mt-20 sm:px-8 lg:flex-row lg:items-start lg:text-left">
                <span className="shrink-0 rounded-full bg-white p-1.5 shadow-xl dark:bg-[#070B14]">
                    <StaffAvatar member={member} style={style} className="h-32 w-32 sm:h-40 sm:w-40" sizes="160px" priority />
                </span>
                <div className="min-w-0 flex-1 pb-2 lg:pt-24">
                    <Kicker style={style} />
                    <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
                        {member.name}
                    </h1>
                    <p className={cn("mt-1.5 text-base font-bold", style.classes.text)}>{member.role}</p>
                    {member.tagline ? (
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                            {member.tagline}
                        </p>
                    ) : null}
                </div>
                <div className="pb-2 lg:pt-24">
                    <SocialLinks socials={member.socials} ownerName={member.name} variant="pills" className="justify-center lg:justify-end" />
                </div>
            </div>
            <div className="flex justify-center lg:justify-start lg:pl-56">
                <Actions member={member} style={style} />
            </div>
        </Section>
    );
}

/* ------------------------------------------------------------------ Entry */

export default function StaffHero(props: HeroProps) {
    switch (props.style.layout) {
        case "spotlight":
            return <SpotlightHero {...props} />;
        case "studio":
            return <StudioHero {...props} />;
        case "poster":
            return <PosterHero {...props} />;
        case "terminal":
            return <TerminalHero {...props} />;
        case "motion":
            return <MotionHero {...props} />;
        default:
            return <ClassicHero {...props} />;
    }
}
