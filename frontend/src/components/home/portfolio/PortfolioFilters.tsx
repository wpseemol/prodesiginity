"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import {
    PORTFOLIO_CATEGORIES,
    PORTFOLIO_ITEMS,
    CATEGORY_SHORT_LABEL,
    categoryHasFormats,
    countByCategory,
    type PortfolioCategory,
    type VideoFormat,
} from "@/data/portfolioData";
import { ACCENTS } from "./portfolioTheme";

export type LayoutMode = "grid" | "rail";

/* Nine disciplines won't fit on a phone as a wrapped grid without eating
   half the screen, so the pill row scrolls sideways — same gesture the
   cards below use. Each pill carries its discipline's accent dot, which
   is how the colour coding gets learned before anyone opens a card. */

const accentFor = (category: PortfolioCategory) =>
    ACCENTS[
        PORTFOLIO_ITEMS.find((i) => i.category === category)?.accent ?? "blue"
    ];

interface PortfolioFiltersProps {
    selectedCategory: PortfolioCategory;
    selectedFormat: VideoFormat;
    layout: LayoutMode;
    onSelectCategory: (cat: PortfolioCategory) => void;
    onSelectFormat: (format: VideoFormat) => void;
    onSelectLayout: (mode: LayoutMode) => void;
}

export default function PortfolioFilters({
    selectedCategory,
    selectedFormat,
    layout,
    onSelectCategory,
    onSelectFormat,
    onSelectLayout,
}: PortfolioFiltersProps) {
    const showFormats = categoryHasFormats(selectedCategory);

    return (
        <div className="flex flex-col items-center gap-5 mb-12 sm:mb-16">
            {/* Discipline rail */}
            <div className="relative w-full max-w-4xl">
                <div
                    role="tablist"
                    aria-label="Portfolio disciplines"
                    className="flex lg:flex-wrap lg:justify-center items-center gap-2 sm:gap-2.5 overflow-x-auto px-4 py-1 snap-x scrollbar-none [&::-webkit-scrollbar]:hidden"
                >
                    {PORTFOLIO_CATEGORIES.map((category) => {
                        const isActive = selectedCategory === category;
                        const accent = accentFor(category);

                        return (
                            <button
                                key={category}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => onSelectCategory(category)}
                                className={`shrink-0 snap-start flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#070B14] ${
                                    isActive
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-105"
                                        : "bg-card-bg dark:bg-dark-card-bg text-slate-700 dark:text-slate-300 border border-border-color dark:border-dark-border-color hover:border-slate-400 dark:hover:border-slate-600"
                                }`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${accent.solid}`}
                                />
                                <span className="sm:hidden">
                                    {CATEGORY_SHORT_LABEL[category]}
                                </span>
                                <span className="hidden sm:inline whitespace-nowrap">
                                    {category}
                                </span>
                                <span
                                    className={`text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-full ${
                                        isActive
                                            ? "bg-white/20 dark:bg-slate-900/15"
                                            : "bg-slate-200/70 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400"
                                    }`}
                                >
                                    {countByCategory(category)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Edge fades so it reads as scrollable on narrow screens */}
                <span className="lg:hidden pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-white dark:from-[#070B14] to-transparent" />
                <span className="lg:hidden pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-white dark:from-[#070B14] to-transparent" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Format toggle — video is the only discipline with formats */}
                {showFormats && (
                    <div className="inline-flex p-1.5 rounded-full bg-slate-100 dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-inner">
                        {(["Full-Form", "Short-Form"] as const).map(
                            (format) => {
                                const isActive = selectedFormat === format;
                                return (
                                    <button
                                        key={format}
                                        type="button"
                                        onClick={() => onSelectFormat(format)}
                                        className={`px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                            isActive
                                                ? "bg-primary text-white shadow-md shadow-primary/25"
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                    >
                                        {format}
                                    </button>
                                );
                            },
                        )}
                    </div>
                )}

                {/* Layout switch */}
                <div className="inline-flex p-1.5 rounded-full bg-slate-100 dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-inner">
                    {(
                        [
                            { mode: "rail", icon: Rows3, label: "Scroll" },
                            { mode: "grid", icon: LayoutGrid, label: "Grid" },
                        ] as const
                    ).map(({ mode, icon: Icon, label }) => {
                        const isActive = layout === mode;
                        return (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => onSelectLayout(mode)}
                                aria-label={`${label} layout`}
                                aria-pressed={isActive}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/25"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
