/**
 * /services/our-service/[slug]
 * ---------------------------------------------------------------------------
 * One page per service, generated from data/servicesData.ts.
 *
 * `generateStaticParams` emits every slug at build time, which is what makes
 * these routes work under `output: "export"` — there is no server to resolve an
 * unknown slug later, so `dynamicParams` is off and anything not in the list
 * 404s at the CDN.
 *
 * SEO shape of the page:
 *   - exactly ONE <h1>, and it is the service title
 *   - <h2> for each major section, <h3> inside them
 *   - Service + BreadcrumbList + FAQPage JSON-LD
 *   - a canonical URL and a per-service title/description
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowRight,
    ArrowUpRight,
    Check,
    ChevronRight,
    Clock,
    MessageSquare,
    Tag,
    Users,
} from "lucide-react";

import JsonLd from "@/components/home/JsonLd";
import ServiceIcon from "@/components/ServiceIcon";
import { HeaderPill } from "@/components/HeaderPill";
import {
    SERVICES,
    SERVICE_SLUGS,
    getGroup,
    getService,
    getServicesByGroup,
    serviceHref,
} from "@/data/servicesData";
import {
    breadcrumbSchema,
    buildMetadata,
    faqSchema,
    graph,
    serviceSchema,
} from "@/lib/seo";

import type { Metadata } from "next";

type Params = { slug: string };

/** Every slug is known at build time — nothing is rendered on demand. */
export function generateStaticParams(): Params[] {
    return SERVICE_SLUGS.map((slug) => ({ slug }));
}

/** A slug outside the list is a 404, not a runtime render. */
export const dynamicParams = false;

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { slug } = await params;
    const service = getService(slug);

    if (!service) {
        return { title: "Service not found", robots: { index: false } };
    }

    return {
        ...buildMetadata({
            title: service.seo.title,
            description: service.seo.description,
            path: serviceHref(service.slug),
        }),
        keywords: service.seo.keywords,
    };
}

export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { slug } = await params;
    const service = getService(slug);

    if (!service) notFound();

    const group = getGroup(service.group);
    const siblings = getServicesByGroup(service.group).filter(
        (item) => item.slug !== service.slug,
    );
    // Fill the "related" rail from other groups when a group is small.
    const related = (
        siblings.length >= 3
            ? siblings
            : [
                  ...siblings,
                  ...SERVICES.filter(
                      (item) =>
                          item.group !== service.group &&
                          item.slug !== service.slug,
                  ),
              ]
    ).slice(0, 3);

    const path = serviceHref(service.slug);

    const schema = graph(
        serviceSchema({
            title: service.title,
            tagline: service.tagline,
            summary: service.summary,
            path,
            deliverables: service.deliverables,
        }),
        breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: "Our Service", path: "/services/our-service" },
            { name: service.title, path },
        ]),
        faqSchema(
            service.faqs.map((faq) => ({ question: faq.q, answer: faq.a })),
        ),
    );

    return (
        <div className="relative bg-white dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden">
            <JsonLd data={schema} />

            {/* ---------------------------------------------------------------
                Hero — carries the single H1
                --------------------------------------------------------------- */}
            <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-20 px-4 sm:px-6 lg:px-8">
                <div
                    className={`absolute top-0 left-1/2 -translate-x-1/2 w-208 h-128 bg-linear-to-tr ${service.accent.wash} rounded-full blur-3xl pointer-events-none opacity-70`}
                    aria-hidden="true"
                />

                <div className="relative max-w-5xl mx-auto">
                    {/* Breadcrumb */}
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-8"
                    >
                        <Link
                            href="/"
                            className="hover:text-primary transition-colors"
                        >
                            Home
                        </Link>
                        <ChevronRight className="w-3 h-3" aria-hidden="true" />
                        <Link
                            href="/services"
                            className="hover:text-primary transition-colors"
                        >
                            Services
                        </Link>
                        <ChevronRight className="w-3 h-3" aria-hidden="true" />
                        <Link
                            href="/services/our-service"
                            className="hover:text-primary transition-colors"
                        >
                            {group?.title ?? "Our Service"}
                        </Link>
                        <ChevronRight className="w-3 h-3" aria-hidden="true" />
                        <span
                            className="text-primary dark:text-dark-primary font-semibold"
                            aria-current="page"
                        >
                            {service.title}
                        </span>
                    </nav>

                    <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                        <div
                            className={`w-16 h-16 rounded-2xl ${service.accent.iconBg} ${service.accent.iconColor} flex items-center justify-center shrink-0 shadow-sm`}
                        >
                            <ServiceIcon
                                name={service.icon}
                                className="w-8 h-8"
                            />
                        </div>

                        <div className="flex-1">
                            {group && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-bold uppercase tracking-widest text-primary dark:text-dark-primary mb-4">
                                    {group.title}
                                </span>
                            )}

                            {/* THE H1 — one per page, and it is the service name */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                                {service.title}
                            </h1>

                            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                                {service.tagline}
                            </p>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
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
                                    href="/services"
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/70 border border-border-color dark:border-dark-border-color hover:border-primary/40 transition-all"
                                >
                                    All services
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Quick facts */}
                    <dl className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            {
                                icon: Clock,
                                label: "Typical timeline",
                                value: service.timeline,
                            },
                            {
                                icon: Tag,
                                label: "Engagement",
                                value: service.startingAt,
                            },
                            {
                                icon: MessageSquare,
                                label: "First step",
                                value: "30-minute discovery call",
                            },
                        ].map((fact) => (
                            <div
                                key={fact.label}
                                className="flex items-start gap-3 p-5 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm"
                            >
                                <fact.icon
                                    className="w-4 h-4 mt-0.5 text-primary dark:text-dark-primary shrink-0"
                                    aria-hidden="true"
                                />
                                <div>
                                    <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        {fact.label}
                                    </dt>
                                    <dd className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">
                                        {fact.value}
                                    </dd>
                                </div>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* ---------------------------------------------------------------
                Overview + deliverables
                --------------------------------------------------------------- */}
            <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border-color dark:border-dark-border-color">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            What this actually involves
                        </h2>
                        <div className="mt-5 space-y-4">
                            {service.intro.map((paragraph) => (
                                <p
                                    key={paragraph.slice(0, 40)}
                                    className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed"
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        <h3 className="mt-10 text-lg font-black text-slate-900 dark:text-white">
                            Who it suits
                        </h3>
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {service.idealFor.map((item) => (
                                <li
                                    key={item}
                                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 border border-border-color dark:border-dark-border-color"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="p-7 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-xl">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">
                                What you get
                            </h2>
                            <ul className="mt-5 space-y-3.5">
                                {service.deliverables.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="w-5 h-5 mt-0.5 rounded-md bg-primary/10 text-primary dark:text-dark-primary flex items-center justify-center shrink-0">
                                            <Check
                                                className="w-3 h-3"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------------
                Process
                --------------------------------------------------------------- */}
            <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/60 dark:bg-[#0A0F1C] border-y border-border-color dark:border-dark-border-color">
                <div className="max-w-5xl mx-auto">
                    <HeaderPill text="How we work" className="sm:mb-6" />
                    <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        The {service.title.toLowerCase()} process
                    </h2>
                    <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                        No surprises. You know what happens at each stage and
                        what we need from you before it starts.
                    </p>

                    <ol className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {service.process.map((step, index) => (
                            <li
                                key={step.title}
                                className="relative p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm hover:border-primary/40 transition-colors"
                            >
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary dark:text-dark-primary text-xs font-black mb-4">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {step.body}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ---------------------------------------------------------------
                FAQ — matches the FAQPage JSON-LD above
                --------------------------------------------------------------- */}
            <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white text-center">
                        {service.title} — common questions
                    </h2>

                    <div className="mt-10 space-y-3">
                        {service.faqs.map((faq) => (
                            <details
                                key={faq.q}
                                className="group p-5 sm:p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm open:shadow-md transition-shadow"
                            >
                                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        {faq.q}
                                    </h3>
                                    <span
                                        className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 transition-transform group-open:rotate-90"
                                        aria-hidden="true"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </span>
                                </summary>
                                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------------
                Related services + CTA
                --------------------------------------------------------------- */}
            <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border-color dark:border-dark-border-color">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Often paired with
                    </h2>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {related.map((item) => (
                            <Link
                                key={item.slug}
                                href={serviceHref(item.slug)}
                                className={`group p-5 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color ${item.accent.hoverBorder} shadow-sm hover:shadow-lg transition-all`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-xl ${item.accent.iconBg} ${item.accent.iconColor} flex items-center justify-center mb-3`}
                                >
                                    <ServiceIcon
                                        name={item.icon}
                                        className="w-5 h-5"
                                    />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1">
                                    {item.title}
                                    <ArrowUpRight
                                        className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-hidden="true"
                                    />
                                </h3>
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {item.summary}
                                </p>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-linear-to-br from-card-bg to-slate-100 dark:from-[#0B101E] dark:to-[#070A12] border border-border-color dark:border-dark-border-color shadow-2xl text-center">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Need {service.title.toLowerCase()}?
                        </h2>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                            Pick a slot on the calendar and we will walk through
                            scope, timeline and cost on a 30-minute call. No
                            pitch deck.
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
                                <Users className="w-4 h-4" aria-hidden="true" />
                                Meet the team
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
