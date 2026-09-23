"use client";

import { Search, ArrowUp, Globe } from "lucide-react";
import { ACCENTS, CardShell, Sparkline } from "./portfolioTheme";
import type { SeoWork } from "@/data/portfolioData";

/* SEO: there is no photograph of a ranking. So this card refuses a hero
   image entirely and shows the evidence instead — a traffic curve and
   three keywords with their before/after positions. It's the only card
   in the set with no picture, and that's deliberate. */

export default function SeoCard({
    item,
    onOpen,
}: {
    item: SeoWork;
    onOpen: (item: SeoWork) => void;
}) {
    const accent = ACCENTS[item.accent];
    const first = item.trafficSeries[0];
    const last = item.trafficSeries[item.trafficSeries.length - 1];
    const growth = Math.round(((last - first) / first) * 100);

    return (
        <CardShell
            accent={accent}
            label={`Open case study: ${item.title}`}
            onClick={() => onOpen(item)}
        >
            <span className="block p-5 pt-6">
                <span className="flex items-start justify-between gap-3">
                    <span className="block min-w-0">
                        <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${accent.soft} border ${accent.text} text-[9px] font-black uppercase tracking-wider`}
                        >
                            <Search className="w-2.5 h-2.5" />
                            {item.engagementType}
                        </span>
                        <span className="block text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug mt-2 line-clamp-2">
                            {item.title}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                            <Globe className="w-3 h-3" />
                            {item.domain}
                            <span className="text-slate-300 dark:text-slate-700">
                                ·
                            </span>
                            {item.timeframe}
                        </span>
                    </span>

                    <span className="block text-right shrink-0">
                        <span className="block text-2xl font-black tabular-nums text-slate-900 dark:text-white leading-none">
                            +{growth}%
                        </span>
                        <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mt-1">
                            organic
                        </span>
                    </span>
                </span>
            </span>

            {/* Traffic curve */}
            <span className="relative block h-20 px-1">
                <Sparkline
                    series={item.trafficSeries}
                    stroke="#8b5cf6"
                    className="w-full h-full"
                />
                <span className="absolute bottom-1 left-5 text-[9px] font-mono text-slate-400 dark:text-slate-600">
                    {(first / 1000).toFixed(1)}K
                </span>
                <span className="absolute bottom-1 right-5 text-[9px] font-mono font-bold text-violet-500">
                    {(last / 1000).toFixed(1)}K / mo
                </span>
            </span>

            {/* Rank movements */}
            <span className="block px-5 pb-5 pt-2 space-y-1.5">
                {item.rankings.slice(0, 3).map((r) => (
                    <span
                        key={r.keyword}
                        className="flex items-center gap-2 text-[11px]"
                    >
                        <span className="flex-1 truncate font-semibold text-slate-600 dark:text-slate-300">
                            {r.keyword}
                        </span>
                        <span className="font-mono text-slate-400 dark:text-slate-600 line-through shrink-0">
                            {r.before === 0 ? "—" : `#${r.before}`}
                        </span>
                        <ArrowUp className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="font-mono font-black text-emerald-500 shrink-0 w-7 text-right">
                            #{r.after}
                        </span>
                    </span>
                ))}
            </span>

            <span className="flex items-center justify-between px-5 py-2.5 border-t border-border-color dark:border-dark-border-color bg-slate-50 dark:bg-[#0f1424] text-[10px] font-bold">
                <span className="text-slate-500 dark:text-slate-400">
                    {item.client}
                </span>
                <span className={accent.text}>
                    {item.kpis[1].value} {item.kpis[1].label.toLowerCase()}
                </span>
            </span>
        </CardShell>
    );
}
