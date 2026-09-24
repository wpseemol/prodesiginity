"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Crown, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TEAM_MEMBERS, type TeamMember } from "@/data/teamData";
import { HeaderPill } from "../HeaderPill";
import { siteConfig } from "@/config/site";
import { shiftAndShuffle } from "@/lib/utils";

const ROTATE_INTERVAL_SEC = 30;

export default function OurTeamMemberSection() {
    const lead = useMemo(() => TEAM_MEMBERS.find((member) => member.lead), []);
    const restMembers = useMemo(
        () => TEAM_MEMBERS.filter((member) => !member.lead),
        [],
    );

    const [shuffledList, setShuffledList] = useState<TeamMember[]>(restMembers);
    const [secondsLeft, setSecondsLeft] = useState<number>(ROTATE_INTERVAL_SEC);

    const triggerShuffle = useCallback(() => {
        setShuffledList((prev) => shiftAndShuffle(prev));
        setSecondsLeft(ROTATE_INTERVAL_SEC);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setShuffledList((current) => shiftAndShuffle(current));
                    return ROTATE_INTERVAL_SEC;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // SVG Progress Calculation (Circumference of r=7 is ~44px)
    const progressPercent = (secondsLeft / ROTATE_INTERVAL_SEC) * 100;
    const strokeDashoffset = 44 - (44 * progressPercent) / 100;

    return (
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand-violet/10 dark:bg-dark-brand-violet/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <HeaderPill text="Our Team" className="sm:mb-6" />

                <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                    The People Doing the Work
                </h2>

                <p className="mt-3 text-center text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                    Small studio, specialist roles. You work directly with the
                    creators and engineers — no account managers relaying
                    messages.
                </p>

                {/* Founder Spotlight Card */}
                {lead && (
                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-9 lg:p-10 rounded-3xl bg-linear-to-br from-card-bg via-slate-50 to-slate-100 dark:from-[#0E1322] dark:via-[#0A0E1A] dark:to-[#070A12] border border-border-color dark:border-dark-border-color shadow-2xl">
                        <div className="lg:col-span-4">
                            <div className="relative aspect-4/5 w-full max-w-xs mx-auto rounded-2xl overflow-hidden ring-2 ring-primary/40 shadow-xl group">
                                <Image
                                    src={lead.photo}
                                    alt={`${lead.name}, ${lead.role} at ${siteConfig.name}`}
                                    fill
                                    sizes="(max-width: 1024px) 70vw, 22rem"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    priority
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 dark:bg-dark-brand-orange/15 text-brand-orange dark:text-dark-brand-orange text-[11px] font-extrabold uppercase tracking-widest border border-brand-orange/20">
                                <Crown
                                    className="w-3.5 h-3.5"
                                    aria-hidden="true"
                                />
                                Founder &amp; Creative Lead
                            </span>

                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
                                {lead.name}
                            </h3>

                            <p className="text-sm sm:text-base font-bold text-primary dark:text-dark-primary">
                                {lead.role}
                            </p>

                            {lead.tagline && (
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2 max-w-2xl">
                                    {lead.tagline}. Every project brief is
                                    personally reviewed and guided to ensure
                                    high production fidelity before delivery.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Subtitle Bar with Live Progress & Manual Shuffle Button */}
                <div className="mt-14 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Core Specialists
                        </h4>
                    </div>

                    {/* Interactive Timer & Shuffle Badge */}
                    <button
                        type="button"
                        onClick={triggerShuffle}
                        title="Click to shuffle now"
                        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-border-color dark:border-dark-border-color text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-primary/50 transition-all cursor-pointer shadow-xs"
                    >
                        {/* Circular Countdown Gauge */}
                        <div className="relative w-4 h-4 flex items-center justify-center">
                            <svg
                                className="w-4 h-4 -rotate-90"
                                viewBox="0 0 18 18"
                            >
                                <circle
                                    cx="9"
                                    cy="9"
                                    r="7"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    fill="none"
                                    className="text-slate-300 dark:text-slate-700"
                                />
                                <circle
                                    cx="9"
                                    cy="9"
                                    r="7"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    fill="none"
                                    strokeDasharray="44"
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className="text-primary transition-all duration-1000 ease-linear"
                                />
                            </svg>
                        </div>

                        <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300">
                            {secondsLeft}s
                        </span>

                        <RefreshCw className="w-3 h-3 text-slate-400 group-hover:text-primary group-hover:rotate-180 transition-all duration-500" />
                    </button>
                </div>

                {/* Animated Dynamic Team Grid */}
                <motion.ul
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {shuffledList.map((member, index) => (
                            <motion.li
                                layout
                                key={member.id}
                                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 280,
                                    damping: 24,
                                    mass: 0.8,
                                    delay: index * 0.03,
                                }}
                                className="group p-3.5 sm:p-4 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-md hover:border-primary/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="relative aspect-4/5 w-full rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800/80">
                                        <Image
                                            src={member.photo}
                                            alt={`${member.name}, ${member.role} at ${siteConfig.name}`}
                                            fill
                                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16rem"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors">
                                        {member.name}
                                    </h3>
                                </div>

                                <p className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
                                    {member.role}
                                </p>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </motion.ul>
            </div>
        </section>
    );
}
