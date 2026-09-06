/**
 * /services — the services hub.
 *
 * Answers "what can I buy from you", one card per service, each linking to its
 * own page. The old placeholder here was noindex because it duplicated /about;
 * that is no longer true, so the page is indexable and carries a proper H1.
 *
 * The sibling page /services/our-service covers the working model and the team
 * instead, so the two do not compete for the same query.
 */

import Link from "next/link";
import {
    ArrowRight,
    ArrowUpRight,
    ChevronRight,
    Layers,
    Sparkles,
} from "lucide-react";

import JsonLd from "@/components/home/JsonLd";
import ServiceIcon from "@/components/ServiceIcon";
import { HeaderPill } from "@/components/HeaderPill";
import {
    SERVICES,
    SERVICE_GROUPS,
    getServicesByGroup,
    serviceHref,
} from "@/data/servicesData";
import { breadcrumbSchema, buildMetadata, graph } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/config/site";

import type { Metadata } from "next";

const PATH = "/services";

export const metadata: Metadata = {
    ...buildMetadata({
        title: "Our Services",
        description:
            "Website and Shopify development, custom web apps, SEO, paid advertising, Amazon and product listings, graphic design, catalogues, 2D and 3D animation and UGC video — from one studio.",
        path: PATH,
    }),
    keywords: [
        "digital agency services",
        "web design and seo agency",
        "shopify and amazon agency",
        "3d animation and design studio",
        "ecommerce marketing services",
    ],
};

export default function ServicesHubPage() {
    const schema = graph(
        breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: PATH },
        ]),
        {
            "@type": "CollectionPage",
            name: "Our Services",
            url: absoluteUrl(PATH),
            about: { "@type": "Organization", name: siteConfig.name },
            mainEntity: {
                "@type": "ItemList",
                numberOfItems: SERVICES.length,
                itemListElement: SERVICES.map((service, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name: service.title,
                    url: absoluteUrl(serviceHref(service.slug)),
                })),
            },
        },
    );

    return (
        <div className="relative bg-white dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden">
            <JsonLd data={schema} />

            {/* ---------------------------- Hero ---------------------------- */}
            <section className="relative pt-14 pb-14 sm:pt-20 px-4 sm:px-6 lg:px-8">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-208 h-120 bg-linear-to-tr from-brand-violet/15 via-primary/12 to-brand-blue/15 rounded-full blur-3xl pointer-events-none"
                    aria-hidden="true"
                />

                <div className="relative container mx-auto  px-4 sm:px-6 lg:px-8">
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
                            Services
                        </span>
                    </nav>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                        Our{" "}
                        <span className="bg-linear-to-r from-brand-violet via-primary to-brand-blue bg-clip-text text-transparent">
                            Services
                        </span>
                    </h1>

                    <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                        {SERVICES.length} services across{" "}
                        {SERVICE_GROUPS.length} disciplines — build, rank,
                        advertise and animate. Take one, or run several on a
                        single monthly retainer.
                    </p>

                    <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-start">
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue shadow-lg shadow-primary/25 hover:opacity-90 transition-all"
                        >
                            Book a free call
                            <ArrowRight
                                className="w-4 h-4"
                                aria-hidden="true"
                            />
                        </Link>
                        <Link
                            href="/#pricing"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/70 border border-border-color dark:border-dark-border-color hover:border-primary/40 transition-all"
                        >
                            See pricing
                        </Link>
                    </div>
                </div>
            </section>

            {/* -------------------- Jump links by group --------------------- */}
            <section className="relative px-4 sm:px-6 lg:px-8 pb-4">
                <ul className="container mx-auto flex flex-wrap gap-2 px-4 sm:px-6 lg:px-8">
                    {SERVICE_GROUPS.map((group) => (
                        <li key={group.slug}>
                            <a
                                href={`#${group.slug}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 border border-border-color dark:border-dark-border-color hover:border-primary/40 hover:text-primary transition-all"
                            >
                                <ServiceIcon
                                    name={group.icon}
                                    className="w-3.5 h-3.5"
                                />
                                {group.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </section>

            {/* ------------------------ Service groups ---------------------- */}
            <section className="relative py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto space-y-16 px-4 sm:px-6 lg:px-8">
                    {SERVICE_GROUPS.map((group) => (
                        <div
                            key={group.slug}
                            id={group.slug}
                            className="scroll-mt-28"
                        >
                            <div className="flex items-start gap-4 mb-7">
                                <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary dark:text-dark-primary flex items-center justify-center shrink-0">
                                    <ServiceIcon
                                        name={group.icon}
                                        className="w-5 h-5"
                                    />
                                </span>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                        {group.title}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {group.blurb}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {getServicesByGroup(group.slug).map(
                                    (service) => (
                                        <Link
                                            key={service.slug}
                                            href={serviceHref(service.slug)}
                                            className={`group relative p-7 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color ${service.accent.hoverBorder} shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col`}
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-2xl ${service.accent.iconBg} ${service.accent.iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                                            >
                                                <ServiceIcon
                                                    name={service.icon}
                                                    className="w-6 h-6"
                                                />
                                            </div>

                                            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2 pr-6">
                                                {service.title}
                                            </h3>

                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                                                {service.summary}
                                            </p>

                                            <div className="mt-5 pt-4 border-t border-border-color dark:border-dark-border-color flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                                                <span className="text-slate-400 dark:text-slate-500">
                                                    {service.timeline}
                                                </span>
                                                <span className="text-primary dark:text-dark-primary inline-flex items-center gap-1">
                                                    Details
                                                    <ArrowUpRight
                                                        className="w-3.5 h-3.5"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </div>
                                        </Link>
                                    ),
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --------------------------- Bundles -------------------------- */}
            <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/60 dark:bg-[#0A0F1C] border-y border-border-color dark:border-dark-border-color">
                <div className="max-w-5xl mx-auto">
                    <HeaderPill
                        text="Not sure where to start"
                        className="sm:mb-6"
                    />
                    <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        Most clients start with one of these
                    </h2>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            {
                                icon: Sparkles,
                                title: "Launching something new",
                                body: "Brand identity, packaging, a store that converts and the first batch of product visuals.",
                                picks: [
                                    "graphic-design",
                                    "shopify-store-design",
                                    "3d-animation",
                                ],
                            },
                            {
                                icon: Layers,
                                title: "Selling but not scaling",
                                body: "Listings rewritten, technical SEO fixed and paid campaigns rebuilt around a real conversion signal.",
                                picks: [
                                    "seo",
                                    "paid-advertising",
                                    "amazon-listing",
                                ],
                            },
                            {
                                icon: ArrowRight,
                                title: "Rebuilding the site",
                                body: "A faster, clearer site with the pages and tooling your team can actually maintain.",
                                picks: [
                                    "website-design-development",
                                    "web-applications",
                                    "product-listing",
                                ],
                            },
                        ].map((bundle) => (
                            <div
                                key={bundle.title}
                                className="p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm"
                            >
                                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary dark:text-dark-primary flex items-center justify-center mb-4">
                                    <bundle.icon
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                    />
                                </div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    {bundle.title}
                                </h3>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {bundle.body}
                                </p>
                                <ul className="mt-4 space-y-1.5">
                                    {bundle.picks.map((slug) => {
                                        const service = SERVICES.find(
                                            (item) => item.slug === slug,
                                        );
                                        if (!service) return null;
                                        return (
                                            <li key={slug}>
                                                <Link
                                                    href={serviceHref(slug)}
                                                    className="text-xs font-semibold text-primary dark:text-dark-primary hover:underline inline-flex items-center gap-1"
                                                >
                                                    {service.title}
                                                    <ArrowUpRight
                                                        className="w-3 h-3"
                                                        aria-hidden="true"
                                                    />
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ----------------------------- CTA ---------------------------- */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 ">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:p-12 rounded-3xl bg-linear-to-br from-card-bg to-slate-100 dark:from-[#0B101E] dark:to-[#070A12] border border-border-color dark:border-dark-border-color shadow-2xl text-center">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Tell us what you are trying to fix
                    </h2>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                        Thirty minutes on Zoom, a straight answer on whether we
                        are the right studio for it, and a rough number before
                        you spend anything.
                    </p>
                    <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue shadow-lg shadow-primary/25 hover:opacity-90 transition-all"
                        >
                            Book your free call
                            <ArrowRight
                                className="w-4 h-4"
                                aria-hidden="true"
                            />
                        </Link>
                        <Link
                            href="/services/our-service"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/70 border border-border-color dark:border-dark-border-color hover:border-primary/40 transition-all"
                        >
                            How we work &amp; who we are
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
