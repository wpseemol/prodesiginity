"use client";

import { motion, type Transition } from "framer-motion";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Project } from "./RecentProjects";

interface ProjectSlideProps {
    project: Project;
    index: number;
    offset: number;
    isActive: boolean;
    isVisible: boolean;
    isPlaying: boolean;
    isCompact: boolean;
    transition: Transition;
    onSelect: (index: number) => void;
    onPlay: (id: string) => void;
}

export default function ProjectSlide({
    project,
    index,
    offset,
    isActive,
    isVisible,
    isPlaying,
    isCompact,
    transition,
    onSelect,
    onPlay,
}: ProjectSlideProps) {
    const distance = Math.abs(offset);

    return (
        <div
            className="absolute inset-0 flex items-center justify-center select-none"
            style={{ zIndex: 10 - distance }}
            aria-hidden={!isVisible}
        >
            <motion.div
                className="aspect-video w-[86vw] max-w-140 overflow-hidden rounded-3xl bg-slate-900 border border-border-color dark:border-dark-border-color shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
                initial={false}
                animate={{
                    x: `${offset * (isCompact ? 100 : 62)}%`,
                    scale: isActive ? 1 : 0.88,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={transition}
                style={{
                    pointerEvents: isVisible ? "auto" : "none",
                }}
            >
                <div className="relative h-full w-full">
                    {isPlaying ? (
                        <iframe
                            className="h-full w-full border-0"
                            src={`https://www.youtube-nocookie.com/embed/${project.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                            title={project.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    ) : (
                        <>
                            <Image
                                src={
                                    project.thumbnail ??
                                    `https://i.ytimg.com/vi/${project.youtubeId}/maxresdefault.jpg`
                                }
                                alt={project.title}
                                loading="lazy"
                                draggable={false}
                                className="h-full w-full select-none object-cover"
                                width={1280}
                                height={720}
                                onError={(event) => {
                                    const img = event.currentTarget;
                                    const fallback = `https://i.ytimg.com/vi/${project.youtubeId}/hqdefault.jpg`;
                                    if (img.src !== fallback)
                                        img.src = fallback;
                                }}
                            />

                            {/* Side Dimming Overlay for Inactive Slides */}
                            <motion.div
                                className="pointer-events-none absolute inset-0 bg-slate-950/60 dark:bg-black/65 backdrop-blur-[1px]"
                                initial={false}
                                animate={{ opacity: isActive ? 0 : 1 }}
                                transition={transition}
                            />

                            {/* Play Button Overlay */}
                            <button
                                type="button"
                                onClick={() =>
                                    isActive
                                        ? onPlay(project.id)
                                        : onSelect(index)
                                }
                                className="group absolute inset-0 grid place-items-center outline-none cursor-pointer"
                                aria-label={
                                    isActive
                                        ? `Play ${project.title}`
                                        : `Show ${project.title}`
                                }
                            >
                                <span className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full border border-white/40 bg-white/20 dark:bg-black/40 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30 shadow-2xl">
                                    <Play className="ml-1 h-7 w-7 sm:h-8 sm:w-8 text-white fill-white drop-shadow" />
                                </span>
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
