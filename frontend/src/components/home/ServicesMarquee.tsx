"use client";

/**
 * "What We Do" — the homepage services section.
 *
 * Two layers, on purpose:
 *   - the two-row marquee is decoration. react-fast-marquee clones its
 *     children to fill the row, so it is hidden from assistive tech and its
 *     cards carry no headings — otherwise every service would be announced
 *     and indexed several times over;
 *   - the category grid below is the real content: one <h3> per category and
 *     one plain link per service page, rendered into the static HTML from the
 *     admin-managed catalog. That is what crawlers read and follow.
 */

import Marquee from "react-fast-marquee";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { HeaderPill } from "@/components/HeaderPill";
import ServiceIcon from "@/components/ServiceIcon";
import { serviceHref, type Service } from "@/data/servicesData";
import {
    servicesInGroup,
    visibleGroups,
    type ServicesCatalog,
} from "@/lib/services-catalog";
import { useServicesCatalog } from "@/lib/useServicesCatalog";

const TOP_ROW_SIZE = 7;

function CardItem({ service }: { service: Service }) {
    return (
        <Link
            href={serviceHref(service.slug)}
            tabIndex={-1}
            className={`group relative w-60 md:w-64 h-55 sm:h-60 p-6 sm:p-7 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color ${service.accent.hoverBorder} shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between mx-3 select-none`}
        >
            <div>
                <div
                    className={`w-12 h-12 rounded-2xl ${service.accent.iconBg} ${service.accent.iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                >
                    <ServiceIcon name={service.icon} className="w-6 h-6" />
                </div>

                <p
                    title={service.title}
                    className="text-base font-black text-slate-900 dark:text-white leading-tight mb-2 truncate"
                >
                    {service.title}
                </p>

                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {service.summary}
                </p>
            </div>

            <ArrowUpRight
                className="absolute top-6 right-6 w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-300"
                aria-hidden="true"
            />

            <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                <div className="w-0 group-hover:w-full h-full bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue transition-all duration-500 rounded-full" />
            </div>
        </Link>
    );
}

function joinList(items: string[]) {
    if (items.length <= 1) return items.join("");
    return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export default function ServicesMarquee({
    initialCatalog,
}: {
    initialCatalog?: ServicesCatalog;
}) {
    const catalog = useServicesCatalog(initialCatalog);
    const { services } = catalog;
    const groups = visibleGroups(catalog);
    const topRow = services.slice(0, TOP_ROW_SIZE);
    const bottomRow = services.slice(TOP_ROW_SIZE);

    return (
        <section
            id="what-we-do"
            aria-labelledby="what-we-do-heading"
            className="relative py-20 lg:py-28 bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color overflow-hidden transition-colors duration-300 font-sans px-4 sm:px-6 lg:px-8"
        >
            <div className="absolute top-1/3 left-10 w-96 h-96 bg-brand-violet/10 dark:bg-dark-brand-violet/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-blue/10 dark:bg-dark-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto relative">
                <div className="max-w-3xl mx-auto px-4 text-center mb-14 sm:mb-16 relative z-10">
                    <HeaderPill text="Our Services" className="sm:mb-8" />

                    <h2
                        id="what-we-do-heading"
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight"
                    >
                        What{" "}
                        <span className="bg-linear-to-r from-primary/70 via-primary/65 to-cyan-500 dark:from-primary/65 dark:via-primary/60 dark:to-cyan-400 bg-clip-text text-transparent">
                            We Do
                        </span>
                    </h2>

                    <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                        {services.length} services across{" "}
                        {joinList(groups.map((g) => g.title.toLowerCase()))} —
                        designed, built and grown by one in-house studio so
                        your brand, store and marketing work together.
                    </p>
                </div>

                <div
                    aria-hidden="true"
                    className="relative w-full select-none"
                    style={{
                        maskImage:
                            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                    }}
                >
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
                            {topRow.map((service) => (
                                <CardItem
                                    key={`top-${service.slug}`}
                                    service={service}
                                />
                            ))}
                        </Marquee>
                    </div>

                    {bottomRow.length > 0 ? (
                        <Marquee
                            direction="left"
                            speed={28}
                            gradient={false}
                            autoFill={true}
                            pauseOnHover={true}
                            pauseOnClick={true}
                            className="overflow-hidden py-2"
                        >
                            {bottomRow.map((service) => (
                                <CardItem
                                    key={`bottom-${service.slug}`}
                                    service={service}
                                />
                            ))}
                        </Marquee>
                    ) : null}
                </div>

                <div className="relative z-10 mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <div
                            key={group.slug}
                            className="p-6 rounded-3xl bg-card-bg/80 dark:bg-dark-card-bg/80 backdrop-blur border border-border-color dark:border-dark-border-color shadow-sm"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary dark:text-dark-primary flex items-center justify-center shrink-0">
                                    <ServiceIcon
                                        name={group.icon}
                                        className="w-5 h-5"
                                    />
                                </span>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                        {group.title}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {group.blurb}
                                    </p>
                                </div>
                            </div>
                            <ul className="space-y-1">
                                {servicesInGroup(catalog, group.slug).map(
                                    (service) => (
                                        <li key={service.slug}>
                                            <Link
                                                href={serviceHref(service.slug)}
                                                title={service.summary}
                                                className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 -mx-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary dark:hover:text-dark-primary transition-colors"
                                            >
                                                {service.title}
                                                <ArrowUpRight
                                                    className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-hidden="true"
                                                />
                                            </Link>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex justify-center relative z-10">
                    <Link
                        href="/services"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                    >
                        Explore all services
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
