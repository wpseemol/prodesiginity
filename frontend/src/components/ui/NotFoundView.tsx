import Link from "next/link";
import { Compass, Home } from "lucide-react";

import PortfolioBackground from "@/components/home/portfolio/PortfolioBackground";

type Action = { href: string; label: string };

/**
 * The 404 screen. The site-wide not-found page uses the defaults; the live
 * fallbacks pass section-specific copy ("Service not found", "Browse all
 * services") so a missing article or service points somewhere useful.
 */
export default function NotFoundView({
    title = "Page Lost in Space",
    message = "The project, link, or asset you are looking for has been moved, renamed, or no longer exists.",
    action = { href: "/services", label: "Explore Services" },
}: {
    title?: string;
    message?: string;
    action?: Action;
}) {
    return (
        <main className="relative min-h-[85vh] flex items-center justify-center bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans overflow-hidden px-4 sm:px-6 lg:px-8 select-none">
            <PortfolioBackground />

            <div className="relative z-10 max-w-2xl mx-auto text-center">
                <div className="relative inline-block mb-4">
                    <div className="absolute -inset-2 bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none" />
                    <span className="relative text-7xl sm:text-9xl font-black tracking-tighter bg-linear-to-r from-primary via-brand-violet to-cyan-500 dark:from-primary dark:via-dark-primary dark:to-cyan-400 bg-clip-text text-transparent">
                        404
                    </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
                    {title}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-linear-to-r from-brand-violet to-brand-blue hover:from-primary-hover hover:to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue dark:hover:from-dark-primary-hover dark:hover:to-dark-brand-blue shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                        <Home className="w-4 h-4" />
                        Back to Homepage
                    </Link>

                    <Link
                        href={action.href}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-dark-card-bg hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-border-color dark:border-dark-border-color hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-sm"
                    >
                        <Compass className="w-4 h-4" />
                        {action.label}
                    </Link>
                </div>
            </div>
        </main>
    );
}
