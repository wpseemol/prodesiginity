/**
 * /services/our-service/[slug]
 * ---------------------------------------------------------------------------
 * One page per service, generated from the admin-managed services catalog
 * (GET /api/services, falling back to data/servicesData.ts).
 *
 * `generateStaticParams` emits every slug known at build time, which is what
 * makes these routes work under `output: "export"`. Services an admin creates
 * after the build are rendered client-side by app/not-found.tsx until the next
 * deploy prebuilds them.
 *
 * SEO: Service + BreadcrumbList + FAQPage JSON-LD, canonical URL and a
 * per-service title/description.
 */

import { notFound } from "next/navigation";

import JsonLd from "@/components/home/JsonLd";
import ServiceDetail from "@/components/services/ServiceDetail";
import { serviceHref } from "@/data/servicesData";
import {
    findGroup,
    findService,
    getServicesCatalog,
    relatedServices,
} from "@/lib/services-catalog";
import {
    breadcrumbSchema,
    buildMetadata,
    faqSchema,
    graph,
    serviceSchema,
} from "@/lib/seo";

import type { Metadata } from "next";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
    const catalog = await getServicesCatalog();
    return catalog.services.map((service) => ({ slug: service.slug }));
}

/** A slug outside the list is a 404, not a runtime render. */
export const dynamicParams = false;

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { slug } = await params;
    const service = findService(await getServicesCatalog(), slug);

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
    const catalog = await getServicesCatalog();
    const service = findService(catalog, slug);

    if (!service) notFound();

    const path = serviceHref(service.slug);
    const group = findGroup(catalog, service.group);

    const schema = graph(
        serviceSchema({
            title: service.title,
            tagline: service.tagline,
            summary: service.summary,
            path,
            deliverables: service.deliverables,
            category: group?.title,
        }),
        breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: "Our Service", path: "/services/our-service" },
            { name: service.title, path },
        ]),
        ...(service.faqs.length > 0
            ? [
                  faqSchema(
                      service.faqs.map((faq) => ({
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
            <ServiceDetail
                service={service}
                group={group}
                related={relatedServices(catalog, service)}
            />
        </>
    );
}
