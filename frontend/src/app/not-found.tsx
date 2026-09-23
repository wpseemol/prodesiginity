import Link from "next/link";
import { Home, Compass } from "lucide-react";
import PortfolioBackground from "@/components/home/portfolio/PortfolioBackground";

export default function NotFound() {
    return (
        <main className="relative min-h-[85vh] flex items-center justify-center bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans overflow-hidden px-4 sm:px-6 lg:px-8 select-none">
            {/* Dynamic Background Grid & Shimmer Glows */}
            <PortfolioBackground />

            {/* Central Content Card */}
            <div className="relative z-10 max-w-2xl mx-auto text-center">
                {/* Glowing 404 Watermark Badge */}
                <div className="relative inline-block mb-4">
                    <div className="absolute -inset-2 bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none" />
                    <span className="relative text-7xl sm:text-9xl font-black tracking-tighter bg-linear-to-r from-primary via-brand-violet to-cyan-500 dark:from-primary dark:via-dark-primary dark:to-cyan-400 bg-clip-text text-transparent">
                        404
                    </span>
                </div>

                {/* Heading & Subtitle */}
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
                    Page Lost in Space
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
                    The project, link, or asset you are looking for has been
                    moved, renamed, or no longer exists.
                </p>

                {/* Quick Action Navigation Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-linear-to-r from-brand-violet to-brand-blue hover:from-primary-hover hover:to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue dark:hover:from-dark-primary-hover dark:hover:to-dark-brand-blue shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                        <Home className="w-4 h-4" />
                        Back to Homepage
                    </Link>

                    <Link
                        href="/services"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-dark-card-bg hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-border-color dark:border-dark-border-color hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-sm"
                    >
                        <Compass className="w-4 h-4" />
                        Explore Services
                    </Link>
                </div>
            </div>
        </main>
    );
}
