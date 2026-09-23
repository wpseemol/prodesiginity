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
    isCompact: boolean;
    transition: Transition;
    onSelect: (index: number) => void;
    onOpenModal: (project: Project) => void;
}

export default function ProjectSlide({
    project,
    index,
    offset,
    isActive,
    isVisible,
    isCompact,
    transition,
    onSelect,
    onOpenModal,
}: ProjectSlideProps) {
    const distance = Math.abs(offset);

    // Auto-detect thumbnail for Cloudinary or YouTube
    const thumbnailSrc =
        project.thumbnail ??
        (project.videoUrl
            ? project.videoUrl.replace(/\.[^/.]+$/, ".jpg") // Converts .mp4 to .jpg for Cloudinary
            : `https://i.ytimg.com/vi/${project.youtubeId}/maxresdefault.jpg`);

    return (
        <div
            className="absolute inset-0 flex items-center justify-center select-none"
            style={{ zIndex: 10 - distance }}
            aria-hidden={!isVisible}
        >
            <motion.div
                className="aspect-video w-[86vw] max-w-140 overflow-hidden rounded-3xl bg-slate-900 border border-border-color dark:border-dark-border-color shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] cursor-pointer"
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
                onClick={() =>
                    isActive ? onOpenModal(project) : onSelect(index)
                }
            >
                <div className="relative h-full w-full group">
                    <Image
                        src={thumbnailSrc}
                        alt={project.title}
                        loading="lazy"
                        draggable={false}
                        className="h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-105"
                        width={1280}
                        height={720}
                        unoptimized={thumbnailSrc.includes("cloudinary.com")}
                        onError={(event) => {
                            if (project.youtubeId) {
                                const img = event.currentTarget;
                                const fallback = `https://i.ytimg.com/vi/${project.youtubeId}/hqdefault.jpg`;
                                if (img.src !== fallback) img.src = fallback;
                            }
                        }}
                    />

                    {/* Dimming Overlay for non-focused slides */}
                    <motion.div
                        className="pointer-events-none absolute inset-0 bg-slate-950/50 dark:bg-black/60 backdrop-blur-[1px]"
                        initial={false}
                        animate={{ opacity: isActive ? 0 : 1 }}
                        transition={transition}
                    />

                    {/* Glowing Play Button Badge */}
                    <div className="absolute inset-0 grid place-items-center">
                        <span className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full border border-white/40 bg-white/25 dark:bg-black/40 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/90 shadow-2xl">
                            <Play className="ml-1 h-7 w-7 sm:h-8 sm:w-8 text-white fill-white drop-shadow" />
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
