"use client";

import { useRef } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    CheckCircle2,
} from "lucide-react";

/* Shared furniture for every modal view. Deliberately plain — the
   personality lives in the per-discipline media panels, not here. */

export function SectionHeading({
    icon: Icon,
    children,
}: {
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-primary" />
            {children}
        </h4>
    );
}

export function StatGrid({
    stats,
}: {
    stats: { label: string; value: string; icon?: React.ElementType }[];
}) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#13192a] border border-border-color dark:border-dark-border-color">
            {stats.map(({ label, value, icon: Icon }) => (
                <div key={label}>
                    <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        {Icon && <Icon className="w-3 h-3" />}
                        {label}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {value}
                    </p>
                </div>
            ))}
        </div>
    );
}

/** Outcome tiles with a delta — used by anything that moved a number. */
export function ResultGrid({
    results,
}: {
    results: { label: string; value: string; delta: string }[];
}) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {results.map((r) => (
                <div
                    key={r.label}
                    className="p-4 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color"
                >
                    <p className="text-xl sm:text-2xl font-black tabular-nums text-slate-900 dark:text-white leading-none">
                        {r.value}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mt-1.5">
                        {r.label}
                    </p>
                    <p className="text-[11px] font-black text-emerald-500 mt-1">
                        {r.delta}
                    </p>
                </div>
            ))}
        </div>
    );
}

export function ChipRow({ items }: { items: string[] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((chip) => (
                <span
                    key={chip}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-border-color dark:border-dark-border-color text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                    {chip}
                </span>
            ))}
        </div>
    );
}

export function TickList({ items }: { items: string[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {items.map((s) => (
                <div
                    key={s}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color"
                >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {s}
                    </span>
                </div>
            ))}
        </div>
    );
}

export function Overview({ text }: { text: string }) {
    return (
        <div className="space-y-2">
            <SectionHeading icon={Sparkles}>Overview</SectionHeading>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {text}
            </p>
        </div>
    );
}

/** Snap rail with arrow controls. Every gallery discipline reuses this. */
export function HorizontalRail({ children }: { children: React.ReactNode }) {
    const railRef = useRef<HTMLDivElement>(null);

    const nudge = (dir: 1 | -1) => {
        railRef.current?.scrollBy({
            left: dir * (railRef.current.clientWidth * 0.8),
            behavior: "smooth",
        });
    };

    return (
        <div className="relative group/rail">
            <div
                ref={railRef}
                className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {children}
            </div>

            {(["left", "right"] as const).map((side) => (
                <button
                    key={side}
                    type="button"
                    aria-label={side === "left" ? "Scroll left" : "Scroll right"}
                    onClick={() => nudge(side === "left" ? -1 : 1)}
                    className={`hidden sm:flex absolute top-1/2 -translate-y-1/2 ${
                        side === "left" ? "left-1" : "right-1"
                    } w-9 h-9 items-center justify-center rounded-full bg-black/70 backdrop-blur border border-white/15 text-white opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                >
                    {side === "left" ? (
                        <ChevronLeft className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </button>
            ))}
        </div>
    );
}

/** Primary link out of the modal. */
export function VisitLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
            {children}
        </a>
    );
}
