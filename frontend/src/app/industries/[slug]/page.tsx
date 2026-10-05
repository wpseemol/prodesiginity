/**
 * /industries/[slug]
 * ---------------------------------------------------------------------------
 * One landing page per target industry, generated from the admin-managed list
 * (GET /api/industries, falling back to data/industriesData.ts).
 *
 * `generateStaticParams` emits every slug known at build time, which is what
 * makes these routes work under `output: "export"`. The prebuilt HTML is then
 * refreshed in the browser from the live API (LiveIndustryDetail), so edits
 * and hiding in the dashboard apply without a redeploy. Industries an admin
 * creates after the build are rendered client-side by app/not-found.tsx until
 * the next deploy prebuilds them.
 *
 * SEO: Service (with BusinessAudience) + BreadcrumbList + FAQPage JSON-LD,
 * canonical URL and per-industry title/description/keywords.
 */

import { notFound } from "next/navigation";

import JsonLd from "@/components/home/JsonLd";
import LiveIndustryDetail from "@/components/industries/LiveIndustryDetail";
import { INDUSTRIES_BASE_PATH, industryHref } from "@/data/industriesData";
import { serviceHref } from "@/data/servicesData";
import {
    findIndustry,
    getIndustries,
    industryServices,
} from "@/lib/industries-catalog";
import { getServicesCatalog } from "@/lib/services-catalog";
import {
    breadcrumbSchema,
    buildMetadata,
    faqSchema,
    graph,
    industrySchema,
} from "@/lib/seo";

import type { Metadata } from "next";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
    const industries = await getIndustries();
    return industries.map((industry) => ({ slug: industry.slug }));
}

/** A slug outside the list is a 404, not a runtime render. */
export const dynamicParams = false;

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { slug } = await params;
    const industry = findIndustry(await getIndustries(), slug);

    if (!industry) {
        return { title: "Industry not found", robots: { index: false } };
    }

    return {
        ...buildMetadata({
            title: industry.seo.title,
            description: industry.seo.description,
            path: industryHref(industry.slug),
            image: industry.heroImage,
            imageAlt: industry.heroImageAlt || industry.headline,
        }),
        keywords: industry.seo.keywords,
    };
}

export default async function IndustryPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { slug } = await params;
    const [industries, catalog] = await Promise.all([
        getIndustries(),
        getServicesCatalog(),
    ]);
    const industry = findIndustry(industries, slug);

    if (!industry) notFound();

    const path = industryHref(industry.slug);
    const services = industryServices(catalog, industry);

    const schema = graph(
        industrySchema({
            title: industry.title,
            headline: industry.headline,
            summary: industry.summary,
            path,
            audience: industry.audience,
            image: industry.heroImage,
            services: services.map((service) => ({
                name: service.title,
                path: serviceHref(service.slug),
            })),
        }),
        breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industries", path: INDUSTRIES_BASE_PATH },
            { name: industry.title, path },
        ]),
        ...(industry.faqs.length > 0
            ? [
                  faqSchema(
                      industry.faqs.map((faq) => ({
                          question: faq.q,
                          answer: faq.a,
                      })),
                  ),
              ]
            : []),
    );

    return (
        <>
            <JsonLd data={schema} />
            <LiveIndustryDetail
                slug={industry.slug}
                initialIndustries={industries}
                initialCatalog={catalog}
            />
        </>
    );
}
