"use client";

import Link from "next/link";
import { CloudOff, RotateCw } from "lucide-react";

import PortfolioBackground from "@/components/home/portfolio/PortfolioBackground";

/** Shown when the API could not be reached, so it is not mistaken for a 404. */
export default function LoadErrorView({
    onRetry,
    backHref = "/",
    backLabel = "Back to Homepage",
}: {
    onRetry: () => void;
    backHref?: string;
    backLabel?: string;
}) {
    return (
        <main className="relative min-h-[85vh] flex items-center justify-center bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans overflow-hidden px-4 sm:px-6 lg:px-8">
            <PortfolioBackground />

            <div className="relative z-10 max-w-xl mx-auto text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-dark-primary">
                    <CloudOff className="h-8 w-8" aria-hidden="true" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                    We couldn&apos;t load this page
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
                    Our server did not answer in time. Check your connection and
                    try again in a moment.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                        <RotateCw className="w-4 h-4" aria-hidden="true" />
                        Try again
                    </button>
                    <Link
                        href={backHref}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-dark-card-bg hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-border-color dark:border-dark-border-color hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
                    >
                        {backLabel}
                    </Link>
                </div>
            </div>
        </main>
    );
}
