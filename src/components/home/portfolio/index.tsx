"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PortfolioBackground from "./PortfolioBackground";
import PortfolioFilters, { type LayoutMode } from "./PortfolioFilters";
import PortfolioCard from "./Cards";
import PortfolioModal from "./PortfolioModal";
import {
    filterPortfolio,
    CATEGORY_SUBHEAD,
    type PortfolioCategory,
    type PortfolioItem,
    type VideoFormat,
} from "@/data/portfolioData";
import { HeaderPill } from "@/components/HeaderPill";

export default function FeaturedWorksSection() {
    const [selectedCategory, setSelectedCategory] =
        useState<PortfolioCategory>("Shopify");
    const [selectedFormat, setSelectedFormat] =
        useState<VideoFormat>("Full-Form");
    const [layout, setLayout] = useState<LayoutMode>("rail");
    const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
    const [progress, setProgress] = useState(0);

    const railRef = useRef<HTMLDivElement>(null);

    const items = useMemo(
        () => filterPortfolio(selectedCategory, selectedFormat),
        [selectedCategory, selectedFormat],
    );

    /* Switching discipline should return you to the start of the rail. */
    useEffect(() => {
        railRef.current?.scrollTo({ left: 0, behavior: "auto" });
    }, [selectedCategory, selectedFormat, layout]);

    const nudgeRail = (dir: 1 | -1) => {
        railRef.current?.scrollBy({
            left: dir * (railRef.current.clientWidth * 0.85),
            behavior: "smooth",
        });
    };

    const handleScroll = () => {
        const el = railRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setProgress(max > 0 ? el.scrollLeft / max : 0);
    };

    return (
        <section className="relative py-20 lg:py-28 bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans overflow-hidden">
            <PortfolioBackground />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <HeaderPill
                        text="Our Portfolio"
                        inlineDivClassName="py-1.5"
                        className="mb-6 sm:mb-8"
                    />

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Featured{" "}
                        <span className="bg-linear-to-r from-primary via-primary/65 to-cyan-500 dark:from-primary dark:via-dark-primary dark:to-cyan-400 bg-clip-text text-transparent">
                            Works
                        </span>
                    </h2>

                    <p className="mt-4 text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400">
                        {CATEGORY_SUBHEAD[selectedCategory]}
                    </p>
                </div>

                <PortfolioFilters
                    selectedCategory={selectedCategory}
                    selectedFormat={selectedFormat}
                    layout={layout}
                    onSelectCategory={setSelectedCategory}
                    onSelectFormat={setSelectedFormat}
                    onSelectLayout={setLayout}
                />

                {items.length === 0 ? (
                    <div className="text-center py-16 px-6 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color max-w-lg mx-auto">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            Nothing here yet
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Try the other format, or pick a different discipline
                            above.
                        </p>
                    </div>
                ) : layout === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
                        {items.map((item) => (
                            <PortfolioCard
                                key={item.id}
                                item={item}
                                onOpen={setActiveItem}
                            />
                        ))}
                    </div>
                ) : (
                    /* Horizontal rail — snap scrolling, arrows on desktop */
                    <div className="relative max-w-6xl mx-auto group/rail">
                        <div
                            ref={railRef}
                            onScroll={handleScroll}
                            className="flex items-stretch gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-none [&::-webkit-scrollbar]:hidden"
                        >
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="shrink-0 snap-start w-[85vw] sm:w-104 lg:w-120"
                                >
                                    <PortfolioCard
                                        item={item}
                                        onOpen={setActiveItem}
                                    />
                                </div>
                            ))}
                        </div>

                        {(["left", "right"] as const).map((side) => (
                            <button
                                key={side}
                                type="button"
                                onClick={() =>
                                    nudgeRail(side === "left" ? -1 : 1)
                                }
                                aria-label={
                                    side === "left"
                                        ? "Previous projects"
                                        : "Next projects"
                                }
                                className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 ${
                                    side === "left" ? "-left-5" : "-right-5"
                                } w-11 h-11 items-center justify-center rounded-full bg-white dark:bg-[#13192a] border border-border-color dark:border-dark-border-color shadow-lg text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:text-primary opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                            >
                                {side === "left" ? (
                                    <ChevronLeft className="w-5 h-5" />
                                ) : (
                                    <ChevronRight className="w-5 h-5" />
                                )}
                            </button>
                        ))}

                        {/* Scroll progress — tells you how much is left */}
                        {items.length > 1 && (
                            <div className="mt-4 mx-auto h-1 w-40 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary transition-[width] duration-150"
                                    style={{
                                        width: `${Math.max(12, progress * 100)}%`,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <PortfolioModal
                item={activeItem}
                onClose={() => setActiveItem(null)}
            />
        </section>
    );
}
