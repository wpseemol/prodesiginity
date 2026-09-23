"use client";

import { ShoppingBag, TrendingUp, Zap } from "lucide-react";
import SmartImage from "./SmartImage";
import { ACCENTS, CardShell, CardBadge, GlassChip } from "./portfolioTheme";
import type { ShopifyWork } from "@/data/portfolioData";

/* Shopify: nobody buys a store because it looks nice. The cover is small,
   the numbers are large, and they're laid out like a receipt — label on
   the left, figure on the right, one per line. */

export default function ShopifyCard({
    item,
    onOpen,
}: {
    item: ShopifyWork;
    onOpen: (item: ShopifyWork) => void;
}) {
    const accent = ACCENTS[item.accent];

    return (
        <CardShell
            accent={accent}
            label={`Open case study: ${item.title}`}
            onClick={() => onOpen(item)}
        >
            <span className="relative block aspect-16/9 w-full overflow-hidden bg-slate-900">
                <SmartImage
                    src={item.longThumbnail}
                    alt={item.title}
                    fallbackLabel={item.client}
                    fill
                    sizes="(max-width: 768px) 90vw, 45vw"
                    className="object-cover object-top transition-[object-position] duration-[6000ms] ease-linear group-hover:object-bottom motion-reduce:transition-none"
                />

                <span className="absolute top-4 left-4 z-10">
                    <CardBadge accent={accent}>
                        <ShoppingBag className="w-3 h-3" />
                        {item.plan}
                    </CardBadge>
                </span>

                <span className="absolute top-4 right-4 z-10">
                    <GlassChip>
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-black">
                            {item.speedScore}
                        </span>
                        speed
                    </GlassChip>
                </span>

                <span className="absolute inset-x-0 bottom-0 block px-4 pb-3 pt-8 bg-linear-to-t from-black/90 to-transparent z-10">
                    <span className="block text-sm sm:text-base font-black text-white leading-snug line-clamp-1">
                        {item.title}
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-300/80 mt-0.5">
                        {item.theme} · {item.skuCount}
                    </span>
                </span>
            </span>

            {/* Receipt strip */}
            <span className="block px-4 py-3.5 bg-card-bg dark:bg-dark-card-bg">
                <span
                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${accent.text} mb-2`}
                >
                    <TrendingUp className="w-3 h-3" />
                    What changed
                </span>

                <span className="block space-y-1.5">
                    {item.results.slice(0, 3).map((r) => (
                        <span
                            key={r.label}
                            className="flex items-baseline gap-2 text-[11px]"
                        >
                            <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                                {r.label}
                            </span>
                            <span className="flex-1 border-b border-dashed border-slate-300/70 dark:border-slate-700 translate-y-[-2px]" />
                            <span className="font-black tabular-nums text-slate-900 dark:text-white shrink-0">
                                {r.value}
                            </span>
                            <span className="font-bold tabular-nums text-emerald-500 shrink-0 w-14 text-right">
                                {r.delta}
                            </span>
                        </span>
                    ))}
                </span>
            </span>
        </CardShell>
    );
}
