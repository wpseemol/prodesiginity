"use client";

import { Clock, Layers, TrendingUp, Scissors, ListVideo } from "lucide-react";
import { SectionHeading, StatGrid, ChipRow, Overview } from "./shared";
import type { VideoWork } from "@/data/portfolioData";

/* Profile: PLAYER — one embedded video, chapters underneath. */

export function VideoMedia({ item }: { item: VideoWork }) {
    const vertical = item.format === "Short-Form";

    return (
        <>
            <div
                className={`w-full bg-black ${
                    vertical ? "flex justify-center py-4" : ""
                }`}
            >
                <div
                    className={
                        vertical
                            ? "w-full max-w-[300px] aspect-9/16"
                            : "w-full aspect-video"
                    }
                >
                    <iframe
                        src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?rel=0&modestbranding=1`}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                    />
                </div>
            </div>

            {/* Chapter strip */}
            <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-slate-950 border-b border-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="shrink-0 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500 pr-1">
                    <ListVideo className="w-3.5 h-3.5" />
                </span>
                {item.chapters.map((c) => (
                    <span
                        key={c.time}
                        className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300"
                    >
                        <span className="font-mono font-bold text-primary">
                            {c.time}
                        </span>
                        {c.label}
                    </span>
                ))}
            </div>
        </>
    );
}

export function VideoBody({ item }: { item: VideoWork }) {
    return (
        <>
            <StatGrid
                stats={[
                    { label: "Channel", value: item.channel },
                    { label: "Runtime", value: item.runtime, icon: Clock },
                    { label: "Views", value: item.viewCount, icon: TrendingUp },
                    { label: "Retention", value: item.retention, icon: Layers },
                ]}
            />

            <Overview text={item.description} />

            <div className="space-y-2.5">
                <SectionHeading icon={Scissors}>Edit approach</SectionHeading>
                <ChipRow items={item.editingStyle} />
            </div>
        </>
    );
}
