"use client";

import { Play, Clock, Eye } from "lucide-react";
import SmartImage from "./SmartImage";
import { ACCENTS, CardShell, CardBadge, GlassChip } from "./portfolioTheme";
import type { VideoWork } from "@/data/portfolioData";

/* Video: the cover is the product. Full-bleed frame, play target in the
   middle, and a fake scrubber that fills on hover — the one visual cue
   that says "this plays" before anyone clicks. */

export default function VideoCard({
    item,
    onOpen,
}: {
    item: VideoWork;
    onOpen: (item: VideoWork) => void;
}) {
    const accent = ACCENTS[item.accent];
    const vertical = item.format === "Short-Form";

    return (
        <CardShell
            accent={accent}
            label={`Watch case study: ${item.title}`}
            onClick={() => onOpen(item)}
        >
            <span
                className={`relative block w-full overflow-hidden bg-slate-900 ${
                    vertical ? "aspect-4/3" : "aspect-16/9"
                }`}
            >
                <SmartImage
                    src={item.thumbnail}
                    alt={item.title}
                    fallbackLabel={item.channel}
                    fill
                    sizes="(max-width: 768px) 90vw, 45vw"
                    className="object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500 motion-reduce:transition-none"
                />

                <span className="absolute top-4 left-4 z-10">
                    <CardBadge accent={accent}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse motion-reduce:animate-none" />
                        {item.badge}
                    </CardBadge>
                </span>

                <span className="absolute top-4 right-4 z-10">
                    <GlassChip>
                        <Clock className="w-3 h-3" />
                        {item.runtime}
                    </GlassChip>
                </span>

                {/* Play target */}
                <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
                    <span
                        className={`w-16 h-16 rounded-full ${accent.solid} text-white flex items-center justify-center shadow-xl ${accent.glow} scale-90 group-hover:scale-100 transition-transform duration-300 motion-reduce:transition-none`}
                    >
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                    </span>
                </span>

                {/* Scrubber — decorative, fills on hover */}
                <span className="absolute inset-x-0 bottom-0 h-1 bg-white/20 z-20">
                    <span
                        className={`block h-full w-0 group-hover:w-full ${accent.solid} transition-all duration-[2500ms] ease-linear motion-reduce:transition-none`}
                    />
                </span>

                {/* Caption block */}
                <span className="absolute inset-x-0 bottom-0 block p-4 sm:p-5 pb-6 bg-linear-to-t from-black/95 via-black/55 to-transparent z-10">
                    <span
                        className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${accent.text}`}
                    >
                        {item.format}
                        <span className="text-white/30">·</span>
                        <span className="text-white/60">{item.resolution}</span>
                    </span>

                    <span className="block text-sm sm:text-base font-black text-white leading-snug drop-shadow-sm mt-1 line-clamp-2">
                        {item.title}
                    </span>

                    <span className="flex items-center gap-3 text-[11px] font-semibold text-slate-300/80 mt-1.5">
                        <span>{item.channel}</span>
                        <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.viewCount}
                        </span>
                        <span className={accent.text}>{item.retention}</span>
                    </span>
                </span>
            </span>
        </CardShell>
    );
}
