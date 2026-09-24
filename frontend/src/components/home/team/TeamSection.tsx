"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Crown } from "lucide-react";

import { HeaderPill } from "@/components/HeaderPill";
import {
    TEAM_INITIAL_INDEX,
    TEAM_MEMBERS,
    type TeamMember,
} from "@/data/teamData";

/**
 * Team coverflow.
 *
 * The stage is a single `perspective` container and every card is absolutely
 * centred inside it; position comes entirely from a transform driven by the
 * card's *signed distance* from the active index. That distance wraps around
 * the ends of the array, so the carousel is genuinely circular — there is no
 * cloned-slide trick and no scroll container to keep in sync.
 *
 * Cards past VISIBLE_DEPTH stay mounted but are faded to zero and taken out of
 * the hit-testing, which keeps the DOM stable (no remount flashes on the photos)
 * while the rendering cost stays flat.
 */

const COUNT = TEAM_MEMBERS.length;

/** How many cards deep the stack goes on each side before it fades out. */
const VISIBLE_DEPTH = 2;
/** Horizontal step per depth level, as a share of one card's width. */
const STEP_X = 70;
/** How far back each depth level sits, in px, before perspective is applied. */
const STEP_Z = 180;
/** Yaw applied per depth level. Negative so side cards face the middle. */
const STEP_ROT = 30;

const AUTOPLAY_MS = 4500;
const DRAG_THRESHOLD = 60;

/**
 * Distance from `index` to `active` taking the shorter way around the ring.
 * For 6 members this returns -3..3, so card 5 sits one step *left* of card 0
 * rather than five steps right.
 */
function signedOffset(index: number, active: number): number {
    let d = index - active;
    if (d > COUNT / 2) d -= COUNT;
    if (d < -COUNT / 2) d += COUNT;
    return d;
}

export default function TeamSection() {
    const [active, setActive] = useState(TEAM_INITIAL_INDEX);
    const [paused, setPaused] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    const dragStart = useRef<number | null>(null);

    const go = useCallback((delta: number) => {
        setActive((current) => (current + delta + COUNT) % COUNT);
    }, []);

    /* ---------------------------------------------------------------- */

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => setReducedMotion(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    // Autoplay. Held while the visitor is hovering, focused inside, or dragging,
    // and switched off entirely for reduced-motion users.
    useEffect(() => {
        if (paused || reducedMotion) return;
        const id = window.setInterval(() => go(1), AUTOPLAY_MS);
        return () => window.clearInterval(id);
    }, [paused, reducedMotion, go]);

    /* ----------------------------- input ---------------------------- */

    const onPointerDown = (e: React.PointerEvent) => {
        dragStart.current = e.clientX;
        setPaused(true);
    };

    const onPointerUp = (e: React.PointerEvent) => {
        const start = dragStart.current;
        dragStart.current = null;
        if (start === null) return;

        const dx = e.clientX - start;
        if (Math.abs(dx) > DRAG_THRESHOLD) go(dx < 0 ? 1 : -1);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
        }
    };

    /* ---------------------------------------------------------------- */

    return (
        <section
            id="team"
            className="relative py-24 sm:py-32 bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans select-none overflow-hidden"
        >
            {/* Soft ambient aurora, matching the other homepage sections. */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 sm:w-237.5 h-100 bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 dark:from-primary/15 dark:via-primary/10 dark:to-primary/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section header */}
                <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
                    <HeaderPill text="The Crew Behind It" className="sm:mb-8" />

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Meet Our <br />
                        <span className="bg-linear-to-r from-primary via-primary/70 to-cyan-500 dark:from-primary/80 dark:via-primary/70 dark:to-cyan-400 bg-clip-text text-transparent">
                            Team Members
                        </span>
                    </h2>
                </div>

                <div
                    className="relative"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    onFocus={() => setPaused(true)}
                    onBlur={() => setPaused(false)}
                >
                    {/* 3D stage */}
                    <div
                        role="group"
                        aria-roledescription="carousel"
                        aria-label="Team members"
                        tabIndex={0}
                        onKeyDown={onKeyDown}
                        onPointerDown={onPointerDown}
                        onPointerUp={onPointerUp}
                        onPointerCancel={() => {
                            dragStart.current = null;
                        }}
                        className="relative h-[430px] sm:h-[490px] md:h-[530px] cursor-grab active:cursor-grabbing focus:outline-none touch-pan-y"
                        style={{
                            perspective: "1400px",
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {TEAM_MEMBERS.map((member, index) => {
                            const offset = signedOffset(index, active);
                            const depth = Math.abs(offset);
                            const hidden = depth > VISIBLE_DEPTH;
                            const isActive = depth === 0;

                            return (
                                <div
                                    key={member.id}
                                    aria-hidden={hidden}
                                    onClick={() => !isActive && go(offset)}
                                    className={[
                                        "absolute top-1/2 left-1/2",
                                        "w-[220px] sm:w-[260px] md:w-[290px]",
                                        !isActive && !hidden
                                            ? "cursor-pointer"
                                            : "",
                                        reducedMotion
                                            ? ""
                                            : "transition-[transform,opacity] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                                    ].join(" ")}
                                    style={{
                                        transform: [
                                            "translate(-50%, -50%)",
                                            `translateX(${offset * STEP_X}%)`,
                                            `translateZ(${-depth * STEP_Z}px)`,
                                            `rotateY(${offset * -STEP_ROT}deg)`,
                                            `scale(${
                                                isActive && member.lead
                                                    ? 1.06
                                                    : 1
                                            })`,
                                        ].join(" "),
                                        opacity: hidden ? 0 : 1 - depth * 0.25,
                                        zIndex: 40 - depth * 10,
                                        pointerEvents: hidden ? "none" : "auto",
                                    }}
                                >
                                    <TeamCard
                                        member={member}
                                        active={isActive}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Controls sit outside the perspective container so they
                        are never caught by the 3D transform. */}
                    <button
                        type="button"
                        onClick={() => go(-1)}
                        aria-label="Previous team member"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-border-color dark:border-dark-border-color text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary-hover hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer focus:outline-none shadow-md"
                    >
                        <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <button
                        type="button"
                        onClick={() => go(1)}
                        aria-label="Next team member"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-border-color dark:border-dark-border-color text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary-hover hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer focus:outline-none shadow-md"
                    >
                        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Dots */}
                    <div className="flex justify-center items-center gap-2 mt-10 sm:mt-12">
                        {TEAM_MEMBERS.map((member, index) => (
                            <button
                                key={member.id}
                                type="button"
                                onClick={() => setActive(index)}
                                aria-label={`Show ${member.name}`}
                                aria-current={index === active}
                                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    index === active
                                        ? "w-8 bg-primary shadow-md shadow-primary/40"
                                        : "w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Announces the centred card to screen readers, which get
                        no benefit from the visual depth cue. */}
                    <p className="sr-only" aria-live="polite">
                        {TEAM_MEMBERS[active].name},{" "}
                        {TEAM_MEMBERS[active].role}
                    </p>
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */

function TeamCard({
    member,
    active,
}: {
    member: TeamMember;
    active: boolean;
}) {
    return member.lead ? (
        <div className="relative">
            {/* Founder-only glow. Sits behind the frame, so it reads as light
                spilling out rather than a border. */}
            <div
                className={`absolute -inset-3 rounded-[36px] bg-linear-to-br from-brand-violet/40 via-primary/30 to-brand-blue/40 blur-2xl transition-opacity duration-500 ${
                    active ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Gradient frame */}
            <div className="relative rounded-[30px] p-[2.5px] bg-linear-to-br from-brand-violet via-primary to-brand-blue shadow-2xl shadow-primary/25">
                <div className="rounded-[28px] bg-white dark:bg-slate-900 overflow-hidden">
                    <CardPhoto member={member} />

                    <div className="px-5 pt-4 pb-6 text-center min-h-[118px]">
                        <h3 className="text-lg sm:text-xl font-black leading-tight bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue bg-clip-text text-transparent">
                            {member.name}
                        </h3>

                        <p className="mt-1.5 text-[11px] sm:text-xs font-black uppercase tracking-widest text-primary">
                            {member.role}
                        </p>

                        {member.tagline ? (
                            <p className="mt-2 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                {member.tagline}
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="relative rounded-[28px] border border-border-color dark:border-dark-border-color bg-white dark:bg-slate-900 overflow-hidden shadow-xl">
            <CardPhoto member={member} />

            <div className="px-5 pt-4 pb-6 text-center min-h-[118px]">
                <h3 className="text-lg sm:text-xl font-black leading-tight text-slate-900 dark:text-white">
                    {member.name}
                </h3>

                <p className="mt-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {member.role}
                </p>
            </div>
        </div>
    );
}

function CardPhoto({ member }: { member: TeamMember }) {
    return (
        <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image
                src={member.photo}
                alt={`${member.name}, ${member.role}`}
                fill
                sizes="(max-width: 640px) 220px, (max-width: 768px) 260px, 290px"
                className="object-cover"
                draggable={false}
            />

            {/* Keeps the name legible where a photo runs bright at the bottom. */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/25 to-transparent" />

            {member.lead ? (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-brand-violet to-brand-blue px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                    <Crown className="w-3.5 h-3.5" />
                    Founder
                </span>
            ) : null}
        </div>
    );
}
