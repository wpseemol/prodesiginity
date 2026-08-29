"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "./RecentProjects";

interface CarouselControlsProps {
    projects: Project[];
    active: number;
    onPrev: () => void;
    onNext: () => void;
    onSelect: (index: number) => void;
}

export default function CarouselControls({
    projects,
    active,
    onPrev,
    onNext,
    onSelect,
}: CarouselControlsProps) {
    return (
        <>
            {/* Left Navigation Arrow */}
            <button
                type="button"
                onClick={onPrev}
                aria-label="Previous project"
                className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full bg-white/90 dark:bg-[#0E1322]/90 border border-border-color dark:border-dark-border-color text-slate-700 dark:text-slate-200 shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-white dark:hover:bg-[#151C30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80"
            >
                <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
            </button>

            {/* Right Navigation Arrow */}
            <button
                type="button"
                onClick={onNext}
                aria-label="Next project"
                className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full bg-white/90 dark:bg-[#0E1322]/90 border border-border-color dark:border-dark-border-color text-slate-700 dark:text-slate-200 shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-white dark:hover:bg-[#151C30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
                <ChevronRight className="h-5 w-5 stroke-[2.5]" />
            </button>

            {/* Mobile Pagination Dots */}
            <div className="mt-8 flex justify-center gap-2 md:hidden">
                {projects.map((project, index) => (
                    <button
                        key={project.id}
                        type="button"
                        onClick={() => onSelect(index)}
                        aria-label={`Go to ${project.title}`}
                        aria-current={index === active}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === active
                                ? "w-7 bg-primary dark:bg-primary/80"
                                : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                        }`}
                    />
                ))}
            </div>
        </>
    );
}
