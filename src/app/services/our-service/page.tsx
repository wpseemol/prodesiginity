/**
 * /services/our-service
 * ---------------------------------------------------------------------------
 * The page the header dropdown points at with "Our service & team".
 *
 * Deliberately a different page from /services. The hub answers "what do you
 * sell"; this one answers "how do you work and who does the work" — approach,
 * working model, and the full team with roles. Two URLs need two different
 * jobs, otherwise they compete for the same query and both lose.
 */

import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    ArrowUpRight,
    ChevronRight,
    Crown,
    MessageSquare,
    ShieldCheck,
    Timer,
    Users,
} from "lucide-react";

import JsonLd from "@/components/home/JsonLd";
import ServiceIcon from "@/components/ServiceIcon";
import { HeaderPill } from "@/components/HeaderPill";
import { TEAM_MEMBERS } from "@/data/teamData";
import {
    SERVICE_GROUPS,
    getServicesByGroup,
    serviceHref,
} from "@/data/servicesData";
import { breadcrumbSchema, buildMetadata, graph } from "@/lib/seo";
import { siteConfig } from "@/config/site";

import type { Metadata } from "next";

const PATH = "/services/our-service";

export const metadata: Metadata = buildMetadata({
    title: "Our Service & Our Team",
    description:
        "How ProDesignity works and who does the work: our service model across design, development, SEO, advertising and animation, plus the full team behind every project.",
    path: PATH,
});

/** The three things clients ask about before they ask about price. */
const WORKING_MODEL = [
    {
        icon: Users,
        title: "One team, not a chain of freelancers",
        body: "The designer, the developer and the marketer sit in the same studio and talk to each other. Nothing gets thrown over a wall, and nobody says the brief was someone else's job.",
    },
    {
        icon: Timer,
        title: "Fixed scope, visible progress",
        body: "Every engagement starts with a written scope you can veto. Work lands on a staging URL you can click through weekly, so progress is something you see rather than something you are told about.",
    },
    {
        icon: ShieldCheck,
        title: "You own everything",
        body: "Source files, repositories, ad accounts and domains stay in your name. When an engagement ends you keep the work, the assets and the access.",
    },
];

export default function OurServiceAndTeamPage() {
    const lead = TEAM_MEMBERS.find((member) => member.lead);
    const rest = TEAM_MEMBERS.filter((member) => !member.lead);

    const schema = graph(
        breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: "Our Service & Our Team", path: PATH },
        ]),
        {
            "@type": "AboutPage",
            name: "Our Service & Our Team",
            url: `${siteConfig.url}${PATH}`,
            about: TEAM_MEMBERS.map((member) => ({
                "@type": "Person",
                name: member.name,
                jobTitle: member.role,
                worksFor: { "@type": "Organization", name: siteConfig.name },
            })),
        },
    );

    return (
        <div className="relative bg-white dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden">
            <JsonLd data={schema} />

            {/* ---------------------------- Hero ---------------------------- */}
            <section className="relative pt-14 pb-16 sm:pt-20 px-4 sm:px-6 lg:px-8">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[52rem] h-[30rem] bg-linear-to-tr from-brand-violet/15 via-primary/12 to-brand-blue/15 rounded-full blur-3xl pointer-events-none"
                    aria-hidden="true"
                />

                <div className="relative max-w-4xl mx-auto text-center">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-8"
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
                        <span
                            className="text-primary dark:text-dark-primary font-semibold"
                            aria-current="page"
                        >
                            Our Service &amp; Team
                        </span>
                    </nav>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                        Our Service &amp;{" "}
                        <span className="bg-linear-to-r from-brand-violet via-primary to-brand-blue bg-clip-text text-transparent">
                            The Team Behind It
                        </span>
                    </h1>

                    <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        {SERVICE_GROUPS.length} service groups, one studio, and
                        a team of {TEAM_MEMBERS.length} who each own a
                        discipline end to end. Here is how the work runs and who
                        you will actually be talking to.
                    </p>

                    <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
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
                            See the full service list
                        </Link>
                    </div>
                </div>
            </section>

            {/* ------------------------ Working model ----------------------- */}
            <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border-color dark:border-dark-border-color">
                <div className="max-w-5xl mx-auto">
                    <HeaderPill text="How we work" className="sm:mb-6" />
                    <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        The way we run a project
                    </h2>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {WORKING_MODEL.map((item) => (
                            <div
                                key={item.title}
                                className="p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm hover:border-primary/40 transition-colors"
                            >
                                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary dark:text-dark-primary flex items-center justify-center mb-4">
                                    <item.icon
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                    />
                                </div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                                    {item.title}
                                </h3>
                                <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {item.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --------------------- Services by group ---------------------- */}
            <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/60 dark:bg-[#0A0F1C] border-y border-border-color dark:border-dark-border-color">
                <div className="max-w-6xl mx-auto">
                    <HeaderPill text="What we cover" className="sm:mb-6" />
                    <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        Every service, grouped by discipline
                    </h2>
                    <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                        Each one has its own page with scope, process, timeline
                        and the questions clients usually ask.
                    </p>

                    <div className="mt-12 space-y-12">
                        {SERVICE_GROUPS.map((group) => {
                            const services = getServicesByGroup(group.slug);
                            return (
                                <div key={group.slug}>
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary dark:text-dark-primary flex items-center justify-center shrink-0">
                                            <ServiceIcon
                                                name={group.icon}
                                                className="w-5 h-5"
                                            />
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                                {group.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {group.blurb}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {services.map((service) => (
                                            <Link
                                                key={service.slug}
                                                href={serviceHref(
                                                    service.slug,
                                                )}
                                                className={`group p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color ${service.accent.hoverBorder} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col`}
                                            >
                                                <div
                                                    className={`w-11 h-11 rounded-xl ${service.accent.iconBg} ${service.accent.iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                                                >
                                                    <ServiceIcon
                                                        name={service.icon}
                                                        className="w-5 h-5"
                                                    />
                                                </div>
                                                <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug flex items-start gap-1">
                                                    {service.title}
                                                    <ArrowUpRight
                                                        className="w-3.5 h-3.5 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        aria-hidden="true"
                                                    />
                                                </h4>
                                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                                                    {service.summary}
                                                </p>
                                                <span className="mt-4 text-[11px] font-bold uppercase tracking-widest text-primary dark:text-dark-primary">
                                                    {service.timeline}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --------------------------- The team ------------------------- */}
            <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <HeaderPill text="Our team" className="sm:mb-6" />
                    <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        The people doing the work
                    </h2>
                    <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                        Small studio, specialist roles. You get the person who
                        does the work, not an account manager relaying messages.
                    </p>

                    {/* Founder card */}
                    {lead && (
                        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 rounded-3xl bg-linear-to-br from-card-bg to-slate-100 dark:from-[#0B101E] dark:to-[#070A12] border border-border-color dark:border-dark-border-color shadow-xl">
                            <div className="lg:col-span-4">
                                <div className="relative aspect-4/5 w-full max-w-xs mx-auto rounded-2xl overflow-hidden ring-2 ring-primary/40 shadow-lg">
                                    <Image
                                        src={lead.photo}
                                        alt={`${lead.name}, ${lead.role} at ${siteConfig.name}`}
                                        fill
                                        sizes="(max-width: 1024px) 60vw, 20rem"
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-8">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange dark:text-dark-brand-orange text-[11px] font-bold uppercase tracking-widest">
                                    <Crown
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                    />
                                    Founder
                                </span>
                                <h3 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                                    {lead.name}
                                </h3>
                                <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                                    {lead.role}
                                </p>
                                {lead.tagline && (
                                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {lead.tagline}. Every project brief is
                                        reviewed here before it reaches the
                                        team, and every delivery is checked
                                        before it reaches you.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Everyone else */}
                    <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                        {rest.map((member) => (
                            <li
                                key={member.id}
                                className="group p-4 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm hover:border-primary/40 hover:shadow-lg transition-all"
                            >
                                <div className="relative aspect-4/5 w-full rounded-xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-800">
                                    <Image
                                        src={member.photo}
                                        alt={`${member.name}, ${member.role} at ${siteConfig.name}`}
                                        fill
                                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15rem"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                                    {member.name}
                                </h3>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-snug">
                                    {member.role}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ----------------------------- CTA ---------------------------- */}
            <section className="relative pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-linear-to-br from-card-bg to-slate-100 dark:from-[#0B101E] dark:to-[#070A12] border border-border-color dark:border-dark-border-color shadow-2xl text-center">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Want to talk to the people, not a sales team?
                    </h2>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                        Pick a date on the calendar and we will send a Zoom
                        link. Thirty minutes, an honest read on your project,
                        and a rough number.
                    </p>
                    <Link
                        href="/contact"
                        className="mt-7 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue shadow-lg shadow-primary/25 hover:opacity-90 transition-all"
                    >
                        <MessageSquare className="w-4 h-4" aria-hidden="true" />
                        Book your free call
                    </Link>
                </div>
            </section>
        </div>
    );
}
