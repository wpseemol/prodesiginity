/**
 * Body of an industry landing page. Shared by the prebuilt
 * /industries/[slug] route and the client-side fallback that renders
 * industries created after the last static build.
 *
 * SEO shape: exactly ONE <h1> (the industry headline), <h2> per section,
 * <h3> inside them.
 */

import Link from "next/link";
import {
    AlertTriangle,
    ArrowRight,
    ArrowUpRight,
    Check,
    ChevronRight,
    Users,
} from "lucide-react";

import ServiceIcon from "@/components/ServiceIcon";
import { HeaderPill } from "@/components/HeaderPill";
import SmartImage from "@/components/home/portfolio/SmartImage";
import { mediaUrl } from "@/config/api";
import { siteConfig } from "@/config/site";
import {
    INDUSTRIES_BASE_PATH,
    industryHref,
    inSentence,
    type Industry,
} from "@/data/industriesData";
import { serviceHref, type Service } from "@/data/servicesData";

const PRIMARY_BUTTON =
    "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue shadow-lg shadow-primary/25 hover:opacity-90 transition-all";
const SECONDARY_BUTTON =
    "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/70 border border-border-color dark:border-dark-border-color hover:border-primary/40 transition-all";

function HeroVisual({ industry }: { industry: Industry }) {
    if (industry.heroImage) {
        return (
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-border-color dark:border-dark-border-color shadow-2xl">
                <SmartImage
                    src={mediaUrl(industry.heroImage) ?? ""}
                    alt={
                        industry.heroImageAlt ||
                        `${industry.title} business marketing`
                    }
                    fallbackLabel={industry.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className="object-cover"
                />
            </div>
        );
    }

    return (
        <div
            className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-border-color dark:border-dark-border-color bg-slate-50 dark:bg-[#0A0F1C] shadow-2xl"
            aria-hidden="true"
        >
            <div
                className={`absolute inset-0 bg-linear-to-br ${industry.accent.wash}`}
            />
            <div
                className="absolute inset-0 opacity-[0.45] dark:opacity-[0.18]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(99, 102, 241, 0.24) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(99, 102, 241, 0.24) 1px, transparent 1px)
                    `,
                    backgroundSize: "36px 36px",
                    maskImage:
                        "radial-gradient(ellipse 80% 80% at 50% 50%, #000 55%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 80% 80% at 50% 50%, #000 55%, transparent 100%)",
                }}
            />
            <div className="absolute left-1/2 top-1/2 h-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl dark:bg-white/5" />

            <div className="relative flex h-full flex-col items-center justify-center gap-6 p-8">
                <span className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/50 bg-white/75 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                    <ServiceIcon
                        name={industry.icon}
                        className={`h-14 w-14 ${industry.accent.iconColor}`}
                    />
                </span>
                {industry.solutions.length > 0 && (
                    <ul className="flex flex-wrap justify-center gap-2 max-w-sm">
                        {industry.solutions.slice(0, 4).map((item) => (
                            <li
                                key={item.title}
                                className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                            >
                                <Check
                                    className="h-3 w-3 text-emerald-500"
                                    aria-hidden="true"
                                />
                                {item.title}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default function IndustryDetail({
    industry,
    services,
    related,
}: {
    industry: Industry;
    /** Already resolved from `industry.services` against the catalog. */
    services: Service[];
    related: Industry[];
}) {
    const audienceLabel = inSentence(industry.title);

    return (
        <div className="relative bg-white dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden">
            {/* ---------------------------------------------------------------
                Hero — carries the single H1
                --------------------------------------------------------------- */}
            <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-20 px-4 sm:px-6 lg:px-8">
                <div
                    className={`absolute top-0 left-1/2 -translate-x-1/2 w-208 h-128 bg-linear-to-tr ${industry.accent.wash} rounded-full blur-3xl pointer-events-none opacity-70`}
                    aria-hidden="true"
                />

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
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
                            href={INDUSTRIES_BASE_PATH}
                            className="hover:text-primary transition-colors"
                        >
                            Industries
                        </Link>
                        <ChevronRight className="w-3 h-3" aria-hidden="true" />
                        <span
                            className="text-primary dark:text-dark-primary font-semibold"
                            aria-current="page"
                        >
                            {industry.title}
                        </span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                        <div className="lg:col-span-7">
                            <span
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${industry.accent.iconBg} ${industry.accent.iconColor} text-[11px] font-bold uppercase tracking-widest mb-5`}
                            >
                                <ServiceIcon
                                    name={industry.icon}
                                    className="w-3.5 h-3.5"
                                />
                                {industry.title} marketing
                            </span>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                                {industry.headline}
                            </h1>

                            {industry.tagline && (
                                <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                                    {industry.tagline}
                                </p>
                            )}

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <Link
                                    href={`${siteConfig.contactPath}/#book-a-call`}
                                    className={PRIMARY_BUTTON}
                                >
                                    Get a free {audienceLabel} marketing plan
                                    <ArrowRight
                                        className="w-4 h-4"
                                        aria-hidden="true"
                                    />
                                </Link>
                                {services.length > 0 && (
                                    <a
                                        href="#services"
                                        className={SECONDARY_BUTTON}
                                    >
                                        See what we do
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <HeroVisual industry={industry} />
                        </div>
                    </div>

                    {industry.stats.length > 0 && (
                        <dl className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {industry.stats.map((stat) => (
                                <div
                                    key={`${stat.value}-${stat.label}`}
                                    className="p-5 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm"
                                >
                                    <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        {stat.label}
                                    </dt>
                                    <dd className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                        {stat.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>
            </section>

            {/* ---------------------------------------------------------------
                Overview + who we work with
                --------------------------------------------------------------- */}
            {(industry.intro.length > 0 || industry.audience.length > 0) && (
                <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border-color dark:border-dark-border-color">
                    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 px-4 sm:px-6 lg:px-8">
                        <div className="lg:col-span-7">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Marketing that understands the{" "}
                                {audienceLabel} business
                            </h2>
                            <div className="mt-5 space-y-4">
                                {(industry.intro.length > 0
                                    ? industry.intro
                                    : [industry.summary]
                                ).map((paragraph, index) => (
                                    <p
                                        key={index}
                                        className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {industry.audience.length > 0 && (
                            <div className="lg:col-span-5">
                                <div className="p-7 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-xl">
                                    <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                                        <Users
                                            className="w-5 h-5 text-primary dark:text-dark-primary"
                                            aria-hidden="true"
                                        />
                                        Who we work with
                                    </h2>
                                    <ul className="mt-5 space-y-3.5">
                                        {industry.audience.map((item) => (
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
                        )}
                    </div>
                </section>
            )}

            {/* ---------------------------------------------------------------
                Challenges
                --------------------------------------------------------------- */}
            {industry.challenges.length > 0 && (
                <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/60 dark:bg-[#0A0F1C] border-y border-border-color dark:border-dark-border-color">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <HeaderPill
                            text="Sound familiar?"
                            className="sm:mb-6"
                        />
                        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            What holds {audienceLabel} businesses back online
                        </h2>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
                            {industry.challenges.map((item) => (
                                <div
                                    key={item.title}
                                    className="p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm"
                                >
                                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-brand-orange/10 text-brand-orange dark:text-dark-brand-orange mb-4">
                                        <AlertTriangle
                                            className="w-4 h-4"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {item.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------------------------------------------------------
                How we help
                --------------------------------------------------------------- */}
            {industry.solutions.length > 0 && (
                <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <HeaderPill text="How we help" className="sm:mb-6" />
                        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            How we help {audienceLabel} companies win more
                            jobs
                        </h2>

                        <ol className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {industry.solutions.map((item, index) => (
                                <li
                                    key={`${index}-${item.title}`}
                                    className="p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm hover:border-primary/40 transition-colors"
                                >
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary dark:text-dark-primary text-xs font-black mb-4">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {item.body}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}

            {/* ---------------------------------------------------------------
                Services for this industry
                --------------------------------------------------------------- */}
            {services.length > 0 && (
                <section
                    id="services"
                    className="relative scroll-mt-24 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/60 dark:bg-[#0A0F1C] border-y border-border-color dark:border-dark-border-color"
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Services for {audienceLabel} businesses
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                            Pick one, or combine several into a single monthly
                            plan run by one team.
                        </p>

                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {services.map((service) => (
                                <Link
                                    key={service.slug}
                                    href={serviceHref(service.slug)}
                                    className={`group p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color ${service.accent.hoverBorder} shadow-sm hover:shadow-lg transition-all flex flex-col`}
                                >
                                    <div
                                        className={`w-11 h-11 rounded-xl ${service.accent.iconBg} ${service.accent.iconColor} flex items-center justify-center mb-4`}
                                    >
                                        <ServiceIcon
                                            name={service.icon}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1">
                                        {service.title}
                                        <ArrowUpRight
                                            className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-hidden="true"
                                        />
                                    </h3>
                                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-3 flex-1">
                                        {service.summary}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------------------------------------------------------
                FAQ — matches the FAQPage JSON-LD on the prebuilt page
                --------------------------------------------------------------- */}
            {industry.faqs.length > 0 && (
                <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white text-center">
                            {industry.title} marketing — common questions
                        </h2>

                        <div className="mt-10 space-y-3">
                            {industry.faqs.map((faq, index) => (
                                <details
                                    key={`${index}-${faq.q}`}
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
            )}

            {/* ---------------------------------------------------------------
                Other industries + CTA
                --------------------------------------------------------------- */}
            <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border-color dark:border-dark-border-color">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {related.length > 0 && (
                        <>
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Other industries we serve
                                </h2>
                                <Link
                                    href={INDUSTRIES_BASE_PATH}
                                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary dark:text-dark-primary hover:underline"
                                >
                                    All industries
                                    <ArrowRight
                                        className="w-3.5 h-3.5"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </div>

                            <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {related.map((item) => (
                                    <li key={item.slug}>
                                        <Link
                                            href={industryHref(item.slug)}
                                            className="group flex h-full flex-col items-start gap-3 p-4 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color hover:border-primary/40 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <span
                                                className={`w-9 h-9 rounded-xl ${item.accent.iconBg} ${item.accent.iconColor} flex items-center justify-center`}
                                            >
                                                <ServiceIcon
                                                    name={item.icon}
                                                    className="w-4 h-4"
                                                />
                                            </span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                                                {item.title}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-linear-to-br from-card-bg to-slate-100 dark:from-[#0B101E] dark:to-[#070A12] border border-border-color dark:border-dark-border-color shadow-2xl text-center">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            {industry.ctaTitle ||
                                `Ready to grow your ${audienceLabel} business?`}
                        </h2>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                            {industry.ctaBody ||
                                "Book a free 30-minute call and we'll show you where your next jobs will come from."}
                        </p>
                        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href={`${siteConfig.contactPath}/#book-a-call`}
                                className={PRIMARY_BUTTON}
                            >
                                Book your free call
                                <ArrowRight
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                />
                            </Link>
                            <Link href="/services" className={SECONDARY_BUTTON}>
                                Browse all services
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
