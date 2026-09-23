"use client";

import type { AccentKey } from "@/data/portfolioData";

/* ------------------------------------------------------------------
 *  Accent system
 *
 *  Every class here is a full literal string. Tailwind scans source as
 *  plain text, so `bg-${colour}-500` would silently produce nothing —
 *  which is the other classic reason a card renders "invisible".
 * ------------------------------------------------------------------ */

export interface Accent {
    /** Solid fill for badges and buttons. */
    solid: string;
    /** Icon / small-text colour. */
    text: string;
    /** Faint tinted surface. */
    soft: string;
    /** Border on hover. */
    ring: string;
    /** Gradient used for the card's top edge. */
    edge: string;
    /** Coloured glow behind the hover action. */
    glow: string;
}

export const ACCENTS: Record<AccentKey, Accent> = {
    red: {
        solid: "bg-red-500",
        text: "text-red-500",
        soft: "bg-red-500/10 border-red-500/20",
        ring: "group-hover:border-red-500/50",
        edge: "from-red-500 to-orange-400",
        glow: "shadow-red-500/30",
    },
    blue: {
        solid: "bg-blue-600",
        text: "text-blue-500",
        soft: "bg-blue-500/10 border-blue-500/20",
        ring: "group-hover:border-blue-500/50",
        edge: "from-blue-600 to-sky-400",
        glow: "shadow-blue-500/30",
    },
    indigo: {
        solid: "bg-indigo-600",
        text: "text-indigo-400",
        soft: "bg-indigo-500/10 border-indigo-500/20",
        ring: "group-hover:border-indigo-500/50",
        edge: "from-indigo-600 to-violet-400",
        glow: "shadow-indigo-500/30",
    },
    emerald: {
        solid: "bg-emerald-600",
        text: "text-emerald-500",
        soft: "bg-emerald-500/10 border-emerald-500/20",
        ring: "group-hover:border-emerald-500/50",
        edge: "from-emerald-500 to-lime-400",
        glow: "shadow-emerald-500/30",
    },
    orange: {
        solid: "bg-orange-500",
        text: "text-orange-400",
        soft: "bg-orange-500/10 border-orange-500/20",
        ring: "group-hover:border-orange-500/50",
        edge: "from-orange-500 to-amber-300",
        glow: "shadow-orange-500/30",
    },
    violet: {
        solid: "bg-violet-600",
        text: "text-violet-400",
        soft: "bg-violet-500/10 border-violet-500/20",
        ring: "group-hover:border-violet-500/50",
        edge: "from-violet-600 to-fuchsia-400",
        glow: "shadow-violet-500/30",
    },
    rose: {
        solid: "bg-rose-500",
        text: "text-rose-400",
        soft: "bg-rose-500/10 border-rose-500/20",
        ring: "group-hover:border-rose-500/50",
        edge: "from-rose-500 to-pink-400",
        glow: "shadow-rose-500/30",
    },
    amber: {
        solid: "bg-amber-500",
        text: "text-amber-500",
        soft: "bg-amber-500/10 border-amber-500/20",
        ring: "group-hover:border-amber-500/50",
        edge: "from-amber-500 to-yellow-300",
        glow: "shadow-amber-500/30",
    },
    cyan: {
        solid: "bg-cyan-500",
        text: "text-cyan-400",
        soft: "bg-cyan-500/10 border-cyan-500/20",
        ring: "group-hover:border-cyan-500/50",
        edge: "from-cyan-500 to-teal-300",
        glow: "shadow-cyan-500/30",
    },
};

/* ------------------------- Card primitives ------------------------- */

/** The clickable shell every card sits in. Tilt, focus ring, accent edge. */
export function CardShell({
    accent,
    label,
    onClick,
    children,
    className = "",
}: {
    accent: Accent;
    label: string;
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`group relative w-full h-full text-left rounded-3xl overflow-hidden bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-lg hover:shadow-2xl ${accent.ring} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#070B14] transition-all duration-300 cursor-pointer select-none ${className}`}
        >
            {/* Accent edge — the only thing that identifies discipline at a glance */}
            <span
                className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${accent.edge} z-20`}
            />
            {children}
        </button>
    );
}

/** Small uppercase pill used in the corner of most covers. */
export function CardBadge({
    accent,
    children,
}: {
    accent: Accent;
    children: React.ReactNode;
}) {
    return (
        <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${accent.solid} text-white text-[10px] font-black tracking-wider uppercase shadow-md`}
        >
            {children}
        </span>
    );
}

/** Dark glass chip for stats sitting on top of imagery. */
export function GlassChip({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-wider ${className}`}
        >
            {children}
        </span>
    );
}

/** Title + one-line supporting text, used at the foot of most cards. */
export function CardTitle({
    title,
    meta,
    tone = "light",
}: {
    title: string;
    meta: string;
    tone?: "light" | "dark";
}) {
    return (
        <>
            <span
                className={`block text-sm sm:text-base font-black leading-snug line-clamp-2 ${
                    tone === "light"
                        ? "text-white drop-shadow-sm"
                        : "text-slate-900 dark:text-white"
                }`}
            >
                {title}
            </span>
            <span
                className={`block text-[11px] font-semibold mt-1 ${
                    tone === "light"
                        ? "text-slate-300/80"
                        : "text-slate-500 dark:text-slate-400"
                }`}
            >
                {meta}
            </span>
        </>
    );
}

/** Circular score dial — Lighthouse, speed, anything out of 100. */
export function ScoreDial({
    score,
    label,
    size = 56,
}: {
    score: number;
    label?: string;
    size?: number;
}) {
    const r = 20;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (score / 100) * circumference;
    const stroke =
        score >= 90 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

    return (
        <span className="inline-flex flex-col items-center gap-1">
            <span className="relative" style={{ width: size, height: size }}>
                <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                    <circle
                        cx="24"
                        cy="24"
                        r={r}
                        fill="none"
                        strokeWidth="4"
                        className="stroke-slate-300/40 dark:stroke-slate-700"
                    />
                    <circle
                        cx="24"
                        cy="24"
                        r={r}
                        fill="none"
                        strokeWidth="4"
                        stroke={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-black tabular-nums"
                    style={{ color: stroke }}
                >
                    {score}
                </span>
            </span>
            {label && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {label}
                </span>
            )}
        </span>
    );
}

/** Tiny inline sparkline. Used by SEO cards where an image says nothing. */
export function Sparkline({
    series,
    stroke = "#8b5cf6",
    className = "",
}: {
    series: number[];
    stroke?: string;
    className?: string;
}) {
    if (series.length < 2) return null;

    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = max - min || 1;

    const points = series.map((v, i) => {
        const x = (i / (series.length - 1)) * 100;
        const y = 30 - ((v - min) / span) * 26 - 2;
        return `${x},${y}`;
    });

    return (
        <svg
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            className={className}
            aria-hidden="true"
        >
            <polyline
                points={`0,30 ${points.join(" ")} 100,30`}
                fill={stroke}
                fillOpacity="0.12"
                stroke="none"
            />
            <polyline
                points={points.join(" ")}
                fill="none"
                stroke={stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}
