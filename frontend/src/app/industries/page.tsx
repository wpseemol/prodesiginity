/**
 * /industries — the "Industries We Serve" hub.
 *
 * One card per target industry, each linking to its own landing page.
 * Industries come from the admin-managed list (GET /api/industries): baked in
 * at build time, then refreshed in the browser so industries added in the
 * dashboard appear without a redeploy.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import JsonLd from "@/components/home/JsonLd";
import IndustriesHubContent from "@/components/industries/IndustriesHubContent";
import { INDUSTRIES_BASE_PATH, industryHref } from "@/data/industriesData";
import { getIndustries } from "@/lib/industries-catalog";
import { breadcrumbSchema, buildMetadata, graph } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/config/site";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const industries = await getIndustries();
    const titles = industries.map((industry) => industry.title);
    const lead = titles.slice(0, 8).join(", ");

    return {
        ...buildMetadata({
            title: "Industries We Serve — Home Service Marketing",
            description: `Websites, local SEO, Google Ads and branding for ${lead}${
                titles.length > 8 ? " and more" : ""
            }.`.slice(0, 300),
            path: INDUSTRIES_BASE_PATH,
        }),
        keywords: [
            "home service marketing agency",
            "contractor marketing agency",
            "marketing for home service businesses",
            "contractor website design",
            "local seo for contractors",
            ...titles.map((title) => `${title.toLowerCase()} marketing`),
        ],
    };
}

export default async function IndustriesHubPage() {
    const industries = await getIndustries();

    const schema = graph(
        breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industries", path: INDUSTRIES_BASE_PATH },
        ]),
        {
            "@type": "CollectionPage",
            name: "Industries We Serve",
            url: absoluteUrl(INDUSTRIES_BASE_PATH),
            about: { "@type": "Organization", name: siteConfig.name },
            mainEntity: {
                "@type": "ItemList",
                numberOfItems: industries.length,
                itemListElement: industries.map((industry, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name: industry.headline,
                    url: absoluteUrl(industryHref(industry.slug)),
                })),
            },
        },
    );

    return (
        <div className="relative bg-white dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden">
            <JsonLd data={schema} />

            <IndustriesHubContent initialIndustries={industries} />

            {/* ----------------------------- CTA ---------------------------- */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:p-12 rounded-3xl bg-linear-to-br from-card-bg to-slate-100 dark:from-[#0B101E] dark:to-[#070A12] border border-border-color dark:border-dark-border-color shadow-2xl text-center">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Don&apos;t see your industry?
                    </h2>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                        If you sell a service to local customers, the playbook
                        is the same. Tell us about your business and we will
                        show you where the next jobs can come from.
                    </p>
                    <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={`${siteConfig.contactPath}/#book-a-call`}
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue shadow-lg shadow-primary/25 hover:opacity-90 transition-all"
                        >
                            Book your free call
                            <ArrowRight
                                className="w-4 h-4"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
