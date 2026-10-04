/**
 * /services — the services hub.
 *
 * Answers "what can I buy from you", one card per service, each linking to its
 * own page. Services come from the admin-managed catalog (GET /api/services):
 * baked in at build time, then refreshed in the browser so services added in
 * the dashboard appear without a redeploy.
 *
 * The sibling page /services/our-service covers the working model and the team
 * instead, so the two do not compete for the same query.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import JsonLd from "@/components/home/JsonLd";
import ServicesHubContent from "@/components/services/ServicesHubContent";
import { serviceHref } from "@/data/servicesData";
import { getServicesCatalog } from "@/lib/services-catalog";
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

export default async function ServicesHubPage() {
    const catalog = await getServicesCatalog();

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
                numberOfItems: catalog.services.length,
                itemListElement: catalog.services.map((service, index) => ({
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

            <ServicesHubContent initialCatalog={catalog} />

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
