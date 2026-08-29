"use client";

import { ArrowUp, Globe, Search, Wrench, FileText } from "lucide-react";
import { Sparkline } from "./portfolioTheme";
import { SectionHeading, ResultGrid, Overview, TickList } from "./shared";
import type { SeoWork } from "@/data/portfolioData";

/* Profile: REPORT — no gallery, no player. The media panel is a chart,
   because the deliverable was a change in numbers. */

export function SeoMedia({ item }: { item: SeoWork }) {
    const first = item.trafficSeries[0];
    const last = item.trafficSeries[item.trafficSeries.length - 1];
    const peak = Math.max(...item.trafficSeries);

    return (
        <div className="w-full bg-[#0d0b1a] p-5 sm:p-6 border-b border-white/10">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                <div>
                    <p className="flex items-center gap-1.5 font-mono text-[11px] text-violet-300/70">
                        <Globe className="w-3 h-3" />
                        {item.domain}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">
                        Organic sessions · {item.timeframe}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black tabular-nums text-white leading-none">
                        {(last / 1000).toFixed(1)}K
                    </p>
                    <p className="text-[11px] font-bold text-emerald-400 mt-1">
                        from {(first / 1000).toFixed(1)}K / mo
                    </p>
                </div>
            </div>

            <div className="relative h-40 w-full">
                <Sparkline
                    series={item.trafficSeries}
                    stroke="#a78bfa"
                    className="w-full h-full"
                />
                <span className="absolute top-0 right-0 font-mono text-[10px] text-slate-500">
                    peak {(peak / 1000).toFixed(1)}K
                </span>
            </div>

            <div className="flex items-center justify-between mt-1 font-mono text-[10px] text-slate-600">
                <span>month 1</span>
                <span>month {item.trafficSeries.length}</span>
            </div>
        </div>
    );
}

export function SeoBody({ item }: { item: SeoWork }) {
    return (
        <>
            <ResultGrid results={item.kpis} />

            <Overview text={item.description} />

            {/* Rank movement table */}
            <div className="space-y-3">
                <SectionHeading icon={Search}>Rank movement</SectionHeading>
                <div className="rounded-2xl border border-border-color dark:border-dark-border-color overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-[#13192a]">
                            <tr className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                                <th className="px-4 py-2.5">Keyword</th>
                                <th className="px-2 py-2.5 text-right">
                                    Volume
                                </th>
                                <th className="px-2 py-2.5 text-right">Was</th>
                                <th className="px-4 py-2.5 text-right">Now</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {item.rankings.map((r) => (
                                <tr
                                    key={r.keyword}
                                    className="bg-card-bg dark:bg-dark-card-bg"
                                >
                                    <td className="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                        {r.keyword}
                                    </td>
                                    <td className="px-2 py-3 text-right font-mono text-[11px] text-slate-500">
                                        {r.volume}
                                    </td>
                                    <td className="px-2 py-3 text-right font-mono text-[11px] text-slate-400 line-through">
                                        {r.before === 0
                                            ? "unranked"
                                            : `#${r.before}`}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-emerald-500">
                                            <ArrowUp className="w-3 h-3" />#
                                            {r.after}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* What was actually fixed */}
            <div className="space-y-3">
                <SectionHeading icon={Wrench}>What we fixed</SectionHeading>
                <div className="space-y-2.5">
                    {item.fixes.map((f) => (
                        <div
                            key={f.area}
                            className="p-4 rounded-xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color"
                        >
                            <p className="text-[10px] font-black uppercase tracking-wide text-violet-500">
                                {f.area}
                            </p>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                                {f.issue}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                → {f.action}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2.5">
                <SectionHeading icon={FileText}>Delivered</SectionHeading>
                <TickList items={item.deliverables} />
            </div>
        </>
    );
}
