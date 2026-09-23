"use client";

import { Megaphone, Target } from "lucide-react";
import SmartImage from "./SmartImage";
import { ACCENTS, CardShell } from "./portfolioTheme";
import type { MarketingWork } from "@/data/portfolioData";

/* Marketing: an ad set is a set. The card shows three creatives side by
   side in vertical ad ratio, each labelled with the result it produced —
   including the ones that lost, because that's the honest version. */

export default function MarketingCard({
    item,
    onOpen,
}: {
    item: MarketingWork;
    onOpen: (item: MarketingWork) => void;
}) {
    const accent = ACCENTS[item.accent];
    const headline = item.kpis[0];

    return (
        <CardShell
            accent={accent}
            label={`Open case study: ${item.title}`}
            onClick={() => onOpen(item)}
        >
            {/* Header row */}
            <span className="flex items-start justify-between gap-3 p-4 pt-5">
                <span className="block min-w-0">
                    <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${accent.soft} border ${accent.text} text-[9px] font-black uppercase tracking-wider`}
                    >
                        <Megaphone className="w-2.5 h-2.5" />
                        {item.badge}
                    </span>
                    <span className="block text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug mt-2 line-clamp-1">
                        {item.title}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {item.channels.map((c) => (
                            <span
                                key={c}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400"
                            >
                                {c}
                            </span>
                        ))}
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                            {item.spend}
                        </span>
                    </span>
                </span>

                <span className="block text-right shrink-0">
                    <span className="block text-2xl font-black tabular-nums text-slate-900 dark:text-white leading-none">
                        {headline.value}
                    </span>
                    <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mt-1">
                        {headline.label}
                    </span>
                </span>
            </span>

            {/* Creative strip */}
            <span className="flex gap-2 px-4 pb-4">
                {item.creatives.slice(0, 3).map((c, i) => {
                    const won = !c.result.toLowerCase().includes("cut");
                    return (
                        <span
                            key={c.label}
                            className="relative block flex-1 aspect-9/16 rounded-xl overflow-hidden bg-slate-900 border border-border-color dark:border-dark-border-color"
                            style={{
                                transform: `rotate(${(i - 1) * 1.5}deg)`,
                            }}
                        >
                            <SmartImage
                                src={c.src}
                                alt={c.label}
                                fallbackLabel={c.label}
                                fill
                                sizes="140px"
                                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 motion-reduce:transition-none"
                            />

                            <span className="absolute inset-x-0 bottom-0 block p-2 pt-6 bg-linear-to-t from-black/95 to-transparent">
                                <span className="block text-[9px] font-black uppercase tracking-wide text-white/70 truncate">
                                    {c.platform}
                                </span>
                                <span
                                    className={`block text-[10px] font-black truncate ${
                                        won
                                            ? "text-emerald-400"
                                            : "text-slate-400"
                                    }`}
                                >
                                    {c.result}
                                </span>
                            </span>
                        </span>
                    );
                })}
            </span>

            {/* Objective bar */}
            <span className="flex items-center gap-2 px-4 py-2.5 border-t border-border-color dark:border-dark-border-color bg-slate-50 dark:bg-[#0f1424]">
                <Target className={`w-3 h-3 shrink-0 ${accent.text}`} />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    {item.objective}
                </span>
                <span className="ml-auto text-[10px] font-black text-slate-900 dark:text-white shrink-0">
                    {item.kpis[1].value}{" "}
                    <span className="font-bold text-slate-400 dark:text-slate-500">
                        {item.kpis[1].label.toLowerCase()}
                    </span>
                </span>
            </span>
        </CardShell>
    );
}
