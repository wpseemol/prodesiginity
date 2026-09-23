"use client";

import { Globe, ArrowUpRight, FileCode2 } from "lucide-react";
import SmartImage from "./SmartImage";
import { ACCENTS, CardShell, ScoreDial } from "./portfolioTheme";
import type { WebDevWork } from "@/data/portfolioData";

/* Web development: the card IS a browser window. Chrome on top, the real
   page scrolling inside it on hover, and the scores underneath — because
   the scores are the argument, not the screenshot. */

export default function WebDevCard({
    item,
    onOpen,
}: {
    item: WebDevWork;
    onOpen: (item: WebDevWork) => void;
}) {
    const accent = ACCENTS[item.accent];
    const host = item.siteUrl.replace(/^https?:\/\//, "");

    return (
        <CardShell
            accent={accent}
            label={`Open case study: ${item.title}`}
            onClick={() => onOpen(item)}
        >
            {/* Browser chrome */}
            <span className="flex items-center gap-2 px-4 py-2.5 mt-1 bg-slate-100 dark:bg-[#141a2b] border-b border-border-color dark:border-dark-border-color">
                <span className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </span>
                <span className="flex-1 flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-[#0b0f1a] border border-border-color dark:border-dark-border-color text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    <Globe className="w-3 h-3 shrink-0 text-emerald-500" />
                    {host}
                </span>
                <ArrowUpRight
                    className={`w-3.5 h-3.5 shrink-0 ${accent.text} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
            </span>

            {/* Viewport — the page pans as if someone scrolled it */}
            <span className="relative block aspect-16/10 w-full overflow-hidden bg-slate-200 dark:bg-slate-900">
                <SmartImage
                    src={item.longThumbnail}
                    alt={`${item.title} — full page`}
                    fallbackLabel={host}
                    fill
                    sizes="(max-width: 768px) 90vw, 45vw"
                    className="object-cover object-top transition-[object-position] duration-[6000ms] ease-linear group-hover:object-bottom motion-reduce:transition-none"
                />
                <span className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                    {item.loadTime}
                </span>
            </span>

            {/* Scores — the actual pitch */}
            <span className="flex items-center justify-between gap-2 px-4 py-4 bg-card-bg dark:bg-dark-card-bg">
                <span className="block min-w-0 pr-2">
                    <span
                        className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${accent.text}`}
                    >
                        <FileCode2 className="w-3 h-3" />
                        {item.badge}
                        <span className="text-slate-400 dark:text-slate-600">
                            · {item.pageCount} pages
                        </span>
                    </span>
                    <span className="block text-sm font-black text-slate-900 dark:text-white leading-snug mt-1 line-clamp-2">
                        {item.title}
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.client} · {item.year}
                    </span>
                </span>

                <span className="hidden sm:flex items-center gap-1 shrink-0">
                    <ScoreDial
                        score={item.lighthouse.performance}
                        label="Perf"
                        size={48}
                    />
                    <ScoreDial
                        score={item.lighthouse.accessibility}
                        label="A11y"
                        size={48}
                    />
                    <ScoreDial
                        score={item.lighthouse.seo}
                        label="SEO"
                        size={48}
                    />
                </span>

                <span className="sm:hidden shrink-0">
                    <ScoreDial
                        score={item.lighthouse.performance}
                        label="Perf"
                        size={44}
                    />
                </span>
            </span>
        </CardShell>
    );
}
