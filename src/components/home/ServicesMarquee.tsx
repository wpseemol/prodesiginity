"use client";

/**
 * "Types of Work We Do" — the two-row marquee on the homepage.
 *
 * The card content is no longer declared here. Titles, summaries, icons and
 * accent colours all come from `data/servicesData.ts`, the same file the header
 * dropdown and the /services pages read, so the three can never disagree.
 *
 * Each card is now a link to its own service page.
 */

import Marquee from "react-fast-marquee";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { HeaderPill } from "@/components/HeaderPill";
import ServiceIcon from "@/components/ServiceIcon";
import {
    MARQUEE_BOTTOM_ROW,
    MARQUEE_TOP_ROW,
    serviceHref,
    type Service,
} from "@/data/servicesData";

function CardItem({ service }: { service: Service }) {
    return (
        <Link
            href={serviceHref(service.slug)}
            aria-label={`${service.title} — view service details`}
            className={`group relative w-55 md:w-60 h-55 sm:h-60 p-6 sm:p-7 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color ${service.accent.hoverBorder} shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between mx-3 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
        >
            <div>
                {/* Icon Frame */}
                <div
                    className={`w-12 h-12 rounded-2xl ${service.accent.iconBg} ${service.accent.iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                >
                    <ServiceIcon name={service.icon} className="w-6 h-6" />
                </div>

                {/* Title — h3 because the section heading above is the h2 */}
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2 pr-5">
                    {service.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {service.summary}
                </p>
            </div>

            <ArrowUpRight
                className="absolute top-6 right-6 w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-300"
                aria-hidden="true"
            />

            {/* Interactive Bottom Progress Indicator */}
            <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                <div className="w-0 group-hover:w-full h-full bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue transition-all duration-500 rounded-full" />
            </div>
        </Link>
    );
}

export default function ServicesMarquee() {
    return (
        <section className="relative py-20 lg:py-28 bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color overflow-hidden select-none transition-colors duration-300 font-sans px-4 sm:px-6 lg:px-8">
            {/* Background Ambient Glows */}
            <div className="absolute top-1/3 left-10 w-96 h-96 bg-brand-violet/10 dark:bg-dark-brand-violet/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-blue/10 dark:bg-dark-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto relative">
                {/* Section Header */}
                <div className="max-w-7xl mx-auto px-4 text-center mb-14 sm:mb-16 relative z-10">
                    <HeaderPill text="Global Services" className="sm:mb-8" />

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Types of Work{" "}
                        <span className="bg-linear-to-r from-primary/70 via-primary/65 to-cyan-500 dark:from-primary/65 dark:via-primary/60 dark:to-cyan-400 bg-clip-text text-transparent">
                            We Do
                        </span>
                    </h2>

                    <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                        We provide a wide range of digital services to help your
                        business grow online. Tap any card to see how that
                        service works.
                    </p>
                </div>

                {/* Marquee Wrapper with Universal CSS Alpha Mask (No color hardcoding) */}
                <div
                    className="relative w-full"
                    style={{
                        maskImage:
                            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                    }}
                >
                    {/* Marquee Row 1 (Moving Right) */}
                    <div className="mb-6">
                        <Marquee
                            direction="right"
                            speed={35}
                            gradient={false}
                            autoFill={true}
                            pauseOnHover={true}
                            pauseOnClick={true}
                            className="overflow-hidden py-2"
                        >
                            {MARQUEE_TOP_ROW.map((service) => (
                                <CardItem
                                    key={`top-${service.slug}`}
                                    service={service}
                                />
                            ))}
                        </Marquee>
                    </div>

                    {/* Marquee Row 2 (Moving Left) */}
                    <div>
                        <Marquee
                            direction="left"
                            speed={28}
                            gradient={false}
                            autoFill={true}
                            pauseOnHover={true}
                            pauseOnClick={true}
                            className="overflow-hidden py-2"
                        >
                            {MARQUEE_BOTTOM_ROW.map((service) => (
                                <CardItem
                                    key={`bottom-${service.slug}`}
                                    service={service}
                                />
                            ))}
                        </Marquee>
                    </div>
                </div>

                {/* Route into the hub for anyone who would rather read a list */}
                <div className="mt-12 flex justify-center relative z-10">
                    <Link
                        href="/services"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                    >
                        Explore all services
                        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
