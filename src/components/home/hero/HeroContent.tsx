import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroContent() {
    return (
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left lg:pl-4 ">
            {/* Social Proof Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                <span className="flex -space-x-1.5 overflow-hidden">
                    <span className="inline-block h-4 w-4 rounded-full ring-1 ring-white dark:ring-slate-900 bg-violet-600" />
                    <span className="inline-block h-4 w-4 rounded-full ring-1 ring-white dark:ring-slate-900 bg-indigo-500" />
                    <span className="inline-block h-4 w-4 rounded-full ring-1 ring-white dark:ring-slate-900 bg-orange-500" />
                </span>
                <span>Trusted by 100+ Brands &amp; Creators</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] sm:leading-[1.1]">
                Scaling Your <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-violet-600 via-indigo-500 to-blue-500 dark:from-violet-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Online Growth
                </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed ">
                ProDesignity is a full-service creative agency specializing in
                viral video editing, motion graphics, thumbnails, brand
                strategy, and high-impact visual design built to convert.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                    href="/contact"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 hover:opacity-90 shadow-lg shadow-indigo-500/25 transition-all duration-200"
                >
                    <span>Start a Project</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                    href="https://wa.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors duration-200"
                >
                    Book a Call
                </Link>
            </div>
        </div>
    );
}
