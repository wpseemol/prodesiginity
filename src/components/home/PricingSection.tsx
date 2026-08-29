"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Star, Zap } from "lucide-react";
import { PRICING_PLANS } from "@/data/pricingData";
import { HeaderPill } from "@/components/HeaderPill";
import PortfolioBackground from "./portfolio/PortfolioBackground";

export default function PricingSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const target = sectionRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // When section is not in view and the URL contains #pricing
                if (
                    !entry.isIntersecting &&
                    window.location.hash === "#pricing"
                ) {
                    // Read the query string from the browser rather than
                    // useSearchParams(). This effect only ever runs on the
                    // client, and useSearchParams() would force the whole
                    // pricing section into a CSR bailout — pushing it out of
                    // the statically prerendered HTML that crawlers read.
                    const query = window.location.search.replace(/^\?/, "");
                    const cleanPath = query ? `${pathname}?${query}` : pathname;

                    // Next.js client-side router replace (no full page reload)
                    router.replace(cleanPath, { scroll: false });
                }
            },
            {
                root: null,
                threshold: 0.1,
            },
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [pathname, router]);

    return (
        <section
            ref={sectionRef}
            id="pricing"
            className="relative py-20 lg:py-28 bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans overflow-hidden"
        >
            <PortfolioBackground />
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-80 sm:w-125 h-80 sm:h-125 bg-emerald-500/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-10 w-72 sm:w-112.5 h-72 sm:h-112.5 bg-brand-violet/5 dark:bg-dark-brand-violet/10 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
                    <HeaderPill text="Monthly Retainers" className="sm:mb-8" />

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2]">
                        Predictable Growth with <br />
                        <span className="inline-flex items-center gap-2 bg-linear-to-r from-primary via-secondary to-primary/40 dark:from-primary/80 dark:via-primary/70 dark:to-cyan-400 bg-clip-text text-transparent">
                            Flat Monthly Pricing
                            <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-brand-orange fill-brand-orange inline-block" />
                        </span>
                    </h2>

                    <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                        No hidden fees, no hourly rates. Just consistent,
                        high-quality content and e-commerce management delivered
                        to your brand every single month.
                    </p>
                </div>

                {/* 3-Column Pricing Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {PRICING_PLANS.map((plan) => {
                        const isPopular = plan.isPopular;

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col justify-between rounded-3xl p-7 sm:p-9 transition-all duration-300 ${
                                    isPopular
                                        ? "bg-card-bg dark:bg-dark-card-bg border-2 border-primary shadow-2xl shadow-primary/10 lg:-translate-y-2.5 z-20"
                                        : "bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-lg hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl z-10"
                                }`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
                                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-[11px] font-black tracking-widest uppercase shadow-lg shadow-primary/30">
                                            <Star className="w-3.5 h-3.5 fill-white" />
                                            {plan.popularBadgeText}
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <div className="mb-6">
                                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
                                            {plan.name}
                                        </h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-slate-600 dark:text-slate-400">
                                                $
                                            </span>
                                            <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                                {plan.price}
                                            </span>
                                            <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                {plan.period}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed min-h-10">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <hr className="border-border-color dark:border-dark-border-color/80 my-6" />

                                    <ul className="space-y-3.5 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-3"
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                                        isPopular
                                                            ? "bg-primary/15 text-primary dark:text-primary/80"
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                    }`}
                                                >
                                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </div>
                                                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-2">
                                    <Link
                                        href={plan.ctaHref}
                                        className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                            isPopular
                                                ? "bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/25"
                                                : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-border-color dark:border-dark-border-color"
                                        }`}
                                    >
                                        {plan.ctaText}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-14 text-center">
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                        Need a custom solution for a large enterprise?{" "}
                        <Link
                            href="/contact?type=enterprise"
                            className="font-bold text-primary dark:text-primary/80 hover:underline inline-flex items-center gap-1"
                        >
                            Let&apos;s talk.
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
