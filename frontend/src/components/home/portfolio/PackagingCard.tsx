"use client";

import { Layers, Printer, Ruler } from "lucide-react";
import SmartImage from "./SmartImage";
import { ACCENTS, CardShell, CardBadge } from "./portfolioTheme";
import type { PackagingWork } from "@/data/portfolioData";

/* Packaging: the two things a print buyer checks are the colours and the
   substrate. So the card carries the palette as physical-looking swatches
   and the print method in the footer, laid out like a spec label. */

export default function PackagingCard({
    item,
    onOpen,
}: {
    item: PackagingWork;
    onOpen: (item: PackagingWork) => void;
}) {
    const accent = ACCENTS[item.accent];

    return (
        <CardShell
            accent={accent}
            label={`Open case study: ${item.title}`}
            onClick={() => onOpen(item)}
        >
            <span className="relative block aspect-16/10 w-full overflow-hidden bg-slate-200 dark:bg-slate-900">
                <SmartImage
                    src={item.thumbnail}
                    alt={item.title}
                    fallbackLabel={item.client}
                    fill
                    sizes="(max-width: 768px) 90vw, 45vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 motion-reduce:transition-none"
                />

                <span className="absolute top-4 left-4 z-10">
                    <CardBadge accent={accent}>
                        <Layers className="w-3 h-3" />
                        {item.badge}
                    </CardBadge>
                </span>

                {/* Palette swatches, stacked like a Pantone strip */}
                <span className="absolute top-4 right-4 z-10 flex flex-col gap-1 p-1 rounded-lg bg-white/90 dark:bg-black/70 backdrop-blur-md border border-white/20 shadow-lg">
                    {item.palette.map((c) => (
                        <span
                            key={c.hex}
                            title={`${c.name} · ${c.hex}`}
                            className="block w-5 h-5 rounded border border-black/10 dark:border-white/15"
                            style={{ backgroundColor: c.hex }}
                        />
                    ))}
                </span>

                <span className="absolute bottom-3 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                    {item.artboards.length} artboards
                    {item.dieline && (
                        <>
                            <span className="text-white/30">·</span>
                            dieline
                        </>
                    )}
                </span>
            </span>

            {/* Spec label */}
            <span className="block px-4 py-4 bg-card-bg dark:bg-dark-card-bg">
                <span className="block text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {item.title}
                </span>
                <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    {item.client} · {item.year}
                </span>

                <span className="grid grid-cols-1 gap-1.5 mt-3 pt-3 border-t border-dashed border-border-color dark:border-dark-border-color">
                    <span className="flex items-center gap-2 text-[10px]">
                        <Printer
                            className={`w-3 h-3 shrink-0 ${accent.text}`}
                        />
                        <span className="font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 w-14 shrink-0">
                            Print
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {item.printSpec.printMethod}
                        </span>
                    </span>
                    <span className="flex items-center gap-2 text-[10px]">
                        <Ruler className={`w-3 h-3 shrink-0 ${accent.text}`} />
                        <span className="font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 w-14 shrink-0">
                            Size
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {item.printSpec.dimensions}
                        </span>
                    </span>
                </span>
            </span>
        </CardShell>
    );
}
