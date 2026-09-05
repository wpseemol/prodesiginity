"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ProjectSlide from "./ProjectSlide";
import CarouselControls from "./CarouselControls";
import { HeaderPill } from "@/components/HeaderPill";

export type Project = {
    id: string;
    title: string;
    videoUrl?: string;
    youtubeId?: string;
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
        id: "amazon-content-2",
        title: "Create A+ Content on Amazon",
        videoUrl:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/f_auto,q_auto/v1788617086/Create_A_content_on_Amazon_2.mp4",
        thumbnail:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/so_0,f_auto,q_auto/v1788617086/Create_A_content_on_Amazon_2.jpg",
    },
    {
        id: "shopify-importance-2",
        title: "The Importance of Shopify for E-Commerce Growth",
        videoUrl:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/f_auto,q_auto/v1788617089/Importance_of_Shopify_2.mp4",
        thumbnail:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/so_0,f_auto,q_auto/v1788617089/Importance_of_Shopify_2.jpg",
    },
    {
        id: "why-need-website-2",
        title: "Why Your Brand Needs a Professional Website",
        videoUrl:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/f_auto,q_auto/v1788617088/Why_you_need_a_Website.mp4",
        thumbnail:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/so_0,f_auto,q_auto/v1788617088/Why_you_need_a_Website.jpg",
    },
];

export default function RecentProjects({
    eyebrow = "WATCH & LEARN",
    headline = "Insights That",
    headlineAccent = "Move Business Forward",
    description = "Explore our videos on Amazon, Shopify, graphic design, e-commerce, branding, and the digital strategies shaping modern businesses.",
    projects = DEFAULT_PROJECTS,
}: RecentProjectsProps) {
    const count = projects.length;
    const [active, setActive] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState<Project | null>(null);
    const [isCompact, setIsCompact] = useState(false);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const sync = () => setIsCompact(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    // Close on Escape key
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedVideo(null);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const go = useCallback(
        (direction: 1 | -1) => {
            setActive((prev) => (prev + direction + count) % count);
        },
        [count],
    );

    const goTo = useCallback((index: number) => {
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

            {/* 3D Carousel Container */}
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
                    drag="x"
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
                    {/* Placeholder aspect ratio */}
                    <div
                        className="invisible aspect-video w-[86vw] max-w-140"
                        aria-hidden
                    />

                    {projects.map((project, index) => {
                        const offset = offsetOf(index);
                        const distance = Math.abs(offset);
                        const isActive = offset === 0;
                        const isVisible = isCompact ? isActive : distance <= 1;

                        return (
                            <ProjectSlide
                                key={project.id}
                                project={project}
                                index={index}
                                offset={offset}
                                isActive={isActive}
                                isVisible={isVisible}
                                isCompact={isCompact}
                                transition={transition}
                                onSelect={goTo}
                                onOpenModal={(p) => setSelectedVideo(p)}
                            />
                        );
                    })}
                </motion.div>

                {/* Navigation Arrows */}
                <CarouselControls
                    projects={projects}
                    active={active}
                    onPrev={() => go(-1)}
                    onNext={() => go(1)}
                    onSelect={goTo}
                />
            </div>

            {/* Video Player Modal Popup */}
            <AnimatePresence>
                {selectedVideo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                        {/* Backdrop with dynamic blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedVideo(null)}
                            className="absolute inset-0 bg-slate-950/80 dark:bg-black/85 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                            }}
                            className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white dark:bg-[#0D121F] border border-border-color dark:border-dark-border-color shadow-2xl z-10"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border-color dark:border-dark-border-color">
                                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate pr-4">
                                    {selectedVideo.title}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setSelectedVideo(null)}
                                    aria-label="Close modal"
                                    className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Video Display */}
                            <div className="aspect-video w-full bg-black">
                                {selectedVideo.videoUrl ? (
                                    <video
                                        src={selectedVideo.videoUrl}
                                        poster={selectedVideo.thumbnail}
                                        controls
                                        autoPlay
                                        playsInline
                                        preload="metadata"
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <iframe
                                        className="h-full w-full border-0"
                                        src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                                        title={selectedVideo.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
