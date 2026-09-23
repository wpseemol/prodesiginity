"use client";

import { Star, Layers, Tag } from "lucide-react";
import SmartImage from "./SmartImage";
import { ACCENTS, CardShell } from "./portfolioTheme";
import type { AmazonWork } from "@/data/portfolioData";

/* Amazon A+: modelled on the listing itself. Square product image on the
   left, title and rating on the right, and the A+ modules stacked
   underneath as thin strips — which is literally how they appear on the
   page a shopper scrolls. */

export default function AmazonCard({
    item,
    onOpen,
}: {
    item: AmazonWork;
    onOpen: (item: AmazonWork) => void;
}) {
    const accent = ACCENTS[item.accent];
    const conversion = item.listingStats[0];

    return (
        <CardShell
            accent={accent}
            label={`Open case study: ${item.title}`}
            onClick={() => onOpen(item)}
        >
            <span className="flex gap-4 p-4 pt-5">
                {/* Product square */}
                <span className="relative block w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-white border border-border-color dark:border-dark-border-color">
                    <SmartImage
                        src={item.thumbnail}
                        alt={item.title}
                        fallbackLabel={item.asin}
                        fill
                        sizes="120px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none"
                    />
                </span>

                {/* Listing meta */}
                <span className="block min-w-0 flex-1">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${accent.soft} border ${accent.text} text-[9px] font-black uppercase tracking-wider`}
                    >
                        {item.contentTier}
                    </span>

                    <span className="block text-sm font-black text-slate-900 dark:text-white leading-snug mt-1.5 line-clamp-2">
                        {item.title}
                    </span>

                    <span className="flex items-center gap-1 mt-1.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <Star
                                key={i}
                                className={`w-3 h-3 ${
                                    i < 4
                                        ? "fill-orange-400 text-orange-400"
                                        : "fill-orange-400/30 text-orange-400/30"
                                }`}
                            />
                        ))}
                        <span className="ml-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {item.marketplace}
                        </span>
                    </span>

                    <span className="block font-mono text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        ASIN {item.asin}
                    </span>
                </span>
            </span>

            {/* Module stack — one strip per A+ module */}
            <span className="block px-4 pb-3 space-y-1">
                {item.modules.slice(0, 4).map((m, i) => (
                    <span
                        key={m.type}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/50 border border-border-color dark:border-dark-border-color group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none"
                        style={{ transitionDelay: `${i * 40}ms` }}
                    >
                        <span
                            className={`w-1 h-4 rounded-full ${accent.solid} shrink-0`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 shrink-0 w-24 truncate">
                            {m.type}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {m.headline}
                        </span>
                    </span>
                ))}
            </span>

            {/* Footer stats */}
            <span className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border-color dark:border-dark-border-color bg-slate-50 dark:bg-[#0f1424]">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <Layers className="w-3 h-3" />
                    {item.modules.length} modules
                    <span className="text-slate-300 dark:text-slate-700">
                        |
                    </span>
                    <Tag className="w-3 h-3" />
                    {item.keywords.length} keywords
                </span>
                <span className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                        {conversion.label}
                    </span>
                    <span className="text-base font-black tabular-nums text-slate-900 dark:text-white">
                        {conversion.value}
                    </span>
                    <span className="text-[10px] font-black text-emerald-500">
                        {conversion.delta}
                    </span>
                </span>
            </span>
        </CardShell>
    );
}
