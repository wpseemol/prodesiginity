"use client";

import { Users, Activity, SquareStack } from "lucide-react";
import SmartImage from "./SmartImage";
import { ACCENTS, CardShell } from "./portfolioTheme";
import type { WebAppWork } from "@/data/portfolioData";

/* Web application: software is judged on what it does, not how it looks.
   The card is an app window — a mock sidebar listing the real modules on
   the left, the current screen on the right, and usage numbers below. */

export default function WebAppCard({
    item,
    onOpen,
}: {
    item: WebAppWork;
    onOpen: (item: WebAppWork) => void;
}) {
    const accent = ACCENTS[item.accent];
    const hero = item.screens[0];

    return (
        <CardShell
            accent={accent}
            label={`Open case study: ${item.title}`}
            onClick={() => onOpen(item)}
        >
            {/* App window */}
            <span className="flex h-56 sm:h-64 mt-1 bg-[#0b0f1a] overflow-hidden">
                {/* Sidebar */}
                <span className="hidden sm:flex flex-col gap-1 w-36 shrink-0 p-3 bg-[#070b14] border-r border-white/5">
                    <span className="flex items-center gap-1.5 mb-2">
                        <span
                            className={`w-4 h-4 rounded ${accent.solid} shrink-0`}
                        />
                        <span className="text-[10px] font-black text-white/80 truncate">
                            {item.appType}
                        </span>
                    </span>

                    {item.modules.slice(0, 4).map((m, i) => (
                        <span
                            key={m.name}
                            className={`block px-2 py-1.5 rounded-md text-[9px] font-bold leading-tight ${
                                i === 0
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 group-hover:text-white/70"
                            } transition-colors`}
                        >
                            {m.name}
                        </span>
                    ))}

                    <span className="mt-auto flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                        <Activity className="w-2.5 h-2.5" />
                        {item.scale[3]?.value ?? "live"}
                    </span>
                </span>

                {/* Screen */}
                <span className="relative block flex-1 overflow-hidden">
                    <SmartImage
                        src={hero?.src ?? item.thumbnail}
                        alt={`${item.title} — ${hero?.label ?? "screen"}`}
                        fallbackLabel={hero?.label ?? item.client}
                        fill
                        sizes="(max-width: 768px) 90vw, 45vw"
                        className="object-cover object-left-top group-hover:scale-[1.03] transition-transform duration-500 motion-reduce:transition-none"
                    />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[9px] font-black uppercase tracking-wide text-white/80 border border-white/10">
                        {hero?.label}
                    </span>
                    <span className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#0b0f1a] to-transparent" />
                </span>
            </span>

            {/* Meta + scale */}
            <span className="block px-4 py-4 bg-card-bg dark:bg-dark-card-bg">
                <span
                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${accent.text}`}
                >
                    <SquareStack className="w-3 h-3" />
                    {item.badge}
                    <span className="text-slate-400 dark:text-slate-600">
                        · {item.modules.length} modules
                    </span>
                </span>

                <span className="block text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug mt-1.5 line-clamp-1">
                    {item.title}
                </span>

                <span className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border-color dark:border-dark-border-color">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                        <Users className="w-3 h-3 shrink-0" />
                        {item.roles.slice(0, 3).join(" · ")}
                    </span>
                    <span className="flex items-baseline gap-1 shrink-0">
                        <span className="text-base font-black tabular-nums text-slate-900 dark:text-white">
                            {item.scale[0].value}
                        </span>
                        <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500">
                            {item.scale[0].label}
                        </span>
                    </span>
                </span>
            </span>
        </CardShell>
    );
}
