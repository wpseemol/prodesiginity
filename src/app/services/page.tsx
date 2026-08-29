import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import type { Metadata } from "next";

/**
 * Placeholder page. /about and /services currently share identical copy, and
 * two URLs with byte-identical content is a real quality signal problem for
 * both search engines and AI retrieval. Keep this noindex until the page has
 * its own content, then delete this export.
 */
export const metadata: Metadata = {
    title: "Services",
    description: "ProDesignity services: 3D product visualization, packaging design, product CGI and animation. Full page coming soon.",
    robots: { index: false, follow: true },
};

export default function Services() {
    return (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-white dark:bg-[#090D16] py-16 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
            {/* Dynamic Background Glows */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 sm:w-137.5 h-75 sm:h-137.5 bg-linear-to-tr from-violet-600/15 via-indigo-600/15 to-blue-500/15 dark:from-violet-600/25 dark:via-indigo-600/20 dark:to-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-2xl mx-auto text-center space-y-8 z-10">
                {/* Status Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    <span>Something Big Is Brewing</span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                    We Are Crafting <br />
                    <span className="bg-linear-to-r from-violet-600 via-indigo-500 to-blue-500 dark:from-violet-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                        Something Extraordinary
                    </span>
                </h1>

                {/* Description */}
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                    Our team at ProDesignity is polishing every pixel to bring
                    you next-level digital design and high-converting visual
                    media.
                </p>

                {/* Action Form & Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full sm:w-auto flex-1 px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                        type="button"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 hover:opacity-90 shadow-lg shadow-indigo-500/25 transition-all duration-200"
                    >
                        <span>Notify Me</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Return Link */}
                <div className="pt-4">
                    <Link
                        href="/"
                        className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        ← Back to Homepage
                    </Link>
                </div>
            </div>
        </section>
    );
}
