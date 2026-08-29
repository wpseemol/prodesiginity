"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ProjectSlide from "./ProjectSlide";
import CarouselControls from "./CarouselControls";
import { HeaderPill } from "@/components/HeaderPill";

export type Project = {
    id: string;
    title: string;
    youtubeId: string;
    thumbnail?: string;
};

interface RecentProjectsProps {
    eyebrow?: string;
    headline?: string;
    headlineAccent?: string;
    description?: string;
    projects?: Project[];
}

const DEFAULT_PROJECTS: Project[] = [
    {
        id: "cholesterol",
        title: "Lower Cholesterol Naturally — 2-Minute Health Hacks",
        youtubeId: "dQw4w9WgXcQ",
    },
    {
        id: "probiotics",
        title: "Probiotics and prebiotics explained — Doctor Mike Hansen",
        youtubeId: "aqz-KE-bpKQ",
    },
    {
        id: "ai-automation",
        title: "AI automation with no-code tools",
        youtubeId: "ScMzIvxBSi4",
    },
];

export default function RecentProjects({
    eyebrow = "RECENT PROJECTS",
    headline = "Visuals That",
    headlineAccent = "Convert",
    description = "We align with business goals to deliver premier services in video editing, 2D/3D animation, and graphic design.",
    projects = DEFAULT_PROJECTS,
}: RecentProjectsProps) {
    const count = projects.length;
    const [active, setActive] = useState(0);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [isCompact, setIsCompact] = useState(false);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const sync = () => setIsCompact(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    const go = useCallback(
        (direction: 1 | -1) => {
            setPlayingId(null);
            setActive((prev) => (prev + direction + count) % count);
        },
        [count],
    );

    const goTo = useCallback((index: number) => {
        setPlayingId(null);
        setActive(index);
    }, []);

    const offsetOf = useCallback(
        (index: number) => {
            let offset = index - active;
            if (offset > count / 2) offset -= count;
            if (offset < -count / 2) offset += count;
            return offset;
        },
        [active, count],
    );

    const transition = useMemo(
        () =>
            reduceMotion
                ? { duration: 0 }
                : {
                      type: "spring" as const,
                      stiffness: 220,
                      damping: 30,
                      mass: 0.9,
                  },
        [reduceMotion],
    );

    return (
        <section
            className="relative w-full overflow-hidden bg-white dark:bg-[#070B14] py-16 sm:py-20 lg:py-28 transition-colors duration-300 font-sans border-b border-border-color dark:border-dark-border-color"
            aria-labelledby="recent-projects-heading"
        >
            {/* Background Ambient Glows */}
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-80 h-80 bg-brand-violet/10 dark:bg-dark-brand-violet/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-blue/10 dark:bg-dark-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

            {/* Section Header */}
            <div className="relative mx-auto max-w-3xl px-6 text-center z-10">
                <HeaderPill text={eyebrow} className="sm:mb-8" />

                <h2
                    id="recent-projects-heading"
                    className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white"
                >
                    {headline}{" "}
                    <span className="bg-linear-to-r from-primary/85 via-primary/90 to-cyan-500 dark:from-primary/65 dark:via-primary/70 dark:to-cyan-400 bg-clip-text text-transparent">
                        {headlineAccent}
                    </span>
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            </div>

            {/* 3D Video Carousel Container */}
            <div
                className="relative mx-auto mt-12 w-full max-w-6xl px-4 sm:mt-16 sm:px-6 z-10"
                role="region"
                aria-roledescription="carousel"
                aria-label="Recent project videos"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === "ArrowLeft") {
                        event.preventDefault();
                        go(-1);
                    }
                    if (event.key === "ArrowRight") {
                        event.preventDefault();
                        go(1);
                    }
                }}
            >
                <motion.div
                    className="relative flex items-center justify-center"
                    drag={playingId ? false : "x"}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.12}
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                        if (info.offset.x < -60 || info.velocity.x < -400)
                            go(1);
                        else if (info.offset.x > 60 || info.velocity.x > 400)
                            go(-1);
                    }}
                >
                    {/* Spacer to hold layout height */}
                    <div
                        className="invisible aspect-video w-[86vw] max-w-140"
                        aria-hidden
                    />

                    {projects.map((project, index) => {
                        const offset = offsetOf(index);
                        const distance = Math.abs(offset);
                        const isActive = offset === 0;
                        const isVisible = isCompact ? isActive : distance <= 1;
                        const isPlaying = playingId === project.id;

                        return (
                            <ProjectSlide
                                key={project.id}
                                project={project}
                                index={index}
                                offset={offset}
                                isActive={isActive}
                                isVisible={isVisible}
                                isPlaying={isPlaying}
                                isCompact={isCompact}
                                transition={transition}
                                onSelect={goTo}
                                onPlay={setPlayingId}
                            />
                        );
                    })}
                </motion.div>

                {/* Navigation Arrows & Mobile Dots */}
                <CarouselControls
                    projects={projects}
                    active={active}
                    onPrev={() => go(-1)}
                    onNext={() => go(1)}
                    onSelect={goTo}
                />
            </div>
        </section>
    );
}
