"use client";

import Link from "next/link";
import {
    ArrowRight,
    ArrowUpRight,
    ChevronRight,
    MapPin,
    PhoneCall,
    Target,
} from "lucide-react";

import ServiceIcon from "@/components/ServiceIcon";
import { HeaderPill } from "@/components/HeaderPill";
import { siteConfig } from "@/config/site";
import { industryHref, type Industry } from "@/data/industriesData";
import { useIndustries } from "@/lib/useIndustries";

const REASONS = [
    {
        icon: Target,
        title: "We speak your trade",
        body: "Your pages talk about the jobs you actually sell and the problems your customers actually have — not generic agency copy.",
    },
    {
        icon: MapPin,
        title: "Built for local search",
        body: "Service-area pages, Google Business Profile and reviews, so you show up in the map pack for the towns you cover.",
    },
    {
        icon: PhoneCall,
        title: "Measured in booked jobs",
        body: "Call tracking and form tracking tie every lead back to the page or ad that produced it, so you know what to spend more on.",
    },
];

export default function IndustriesHubContent({
    initialIndustries,
}: {
    initialIndustries: Industry[];
}) {
    const industries = useIndustries(initialIndustries);

    return (
        <>
            {/* ---------------------------- Hero ---------------------------- */}
            <section className="relative pt-14 pb-14 sm:pt-20 px-4 sm:px-6 lg:px-8">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-208 h-120 bg-linear-to-tr from-emerald-500/12 via-primary/12 to-brand-blue/15 rounded-full blur-3xl pointer-events-none"
                    aria-hidden="true"
                />

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center justify-start gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-8"
                    >
                        <Link
                            href="/"
                            className="hover:text-primary transition-colors"
                        >
                            Home
                        </Link>
                        <ChevronRight className="w-3 h-3" aria-hidden="true" />
                        <span
                            className="text-primary dark:text-dark-primary font-semibold"
                            aria-current="page"
                        >
                            Industries
                        </span>
                    </nav>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08] max-w-4xl">
                        Industries{" "}
                        <span className="bg-linear-to-r from-brand-violet via-primary to-brand-blue bg-clip-text text-transparent">
                            We Serve
                        </span>
                    </h1>

                    <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                        Websites, local SEO, ads and branding for{" "}
                        {industries.length} home-service and contracting
                        industries. Pick yours to see how we help businesses
                        like yours book more jobs.
                    </p>

                    <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-start">
                        <Link
                            href={`${siteConfig.contactPath}/#book-a-call`}
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue shadow-lg shadow-primary/25 hover:opacity-90 transition-all"
                        >
                            Book a free call
                            <ArrowRight
                                className="w-4 h-4"
                                aria-hidden="true"
                            />
                        </Link>
                        <Link
                            href="/services"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/70 border border-border-color dark:border-dark-border-color hover:border-primary/40 transition-all"
                        >
                            See our services
                        </Link>
                    </div>
                </div>
            </section>

            {/* ------------------------ Industry grid ----------------------- */}
            <section className="relative py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="sr-only">All industries</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {industries.map((industry) => (
                            <li key={industry.slug}>
                                <Link
                                    href={industryHref(industry.slug)}
                                    className={`group relative h-full p-7 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color ${industry.accent.hoverBorder} shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col`}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-2xl ${industry.accent.iconBg} ${industry.accent.iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <ServiceIcon
                                            name={industry.icon}
                                            className="w-6 h-6"
                                        />
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2 pr-6">
                                        {industry.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                                        {industry.summary}
                                    </p>

                                    <span className="mt-5 pt-4 border-t border-border-color dark:border-dark-border-color inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary dark:text-dark-primary">
                                        {industry.title} marketing
                                        <ArrowUpRight
                                            className="w-3.5 h-3.5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ------------------------ Why specialise ---------------------- */}
            <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/60 dark:bg-[#0A0F1C] border-y border-border-color dark:border-dark-border-color">
                <div className="max-w-5xl mx-auto">
                    <HeaderPill
                        text="Why industry-specific"
                        className="sm:mb-6"
                    />
                    <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        Marketing built around how your customers buy
                    </h2>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {REASONS.map((reason) => (
                            <div
                                key={reason.title}
                                className="p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm"
                            >
                                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary dark:text-dark-primary flex items-center justify-center mb-4">
                                    <reason.icon
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                    />
                                </div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    {reason.title}
                                </h3>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {reason.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
