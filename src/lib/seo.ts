import type { Metadata } from "next";
import { absoluteUrl, siteConfig, socialProfiles } from "@/config/site";
import { KEYWORD_CLUSTERS, KNOWS_ABOUT } from "@/data/seo/keywords";
import { SITE_FAQ } from "@/data/seo/faq";
import { resolveTokens } from "@/lib/legal";
import type { LegalDocument } from "@/data/legal/types";

/**
 * lib/seo.ts
 * ---------------------------------------------------------------------------
 * Metadata and structured data.
 *
 * Structured data matters more for AI retrieval than for classic SEO. When an
 * assistant crawls a page it has to decide "what entity is this, what does it
 * do, and can I trust the claim". A well-formed Organization + Service +
 * FAQPage graph answers that in a way prose cannot.
 */

type BuildMetadataArgs = {
    title: string;
    description: string;
    path: string;
    /** Defaults to the site OG image. */
    image?: string;
    /** Set false on thin or duplicate pages. */
    index?: boolean;
    publishedTime?: string;
    modifiedTime?: string;
};

export function buildMetadata({
    title,
    description,
    path,
    image = siteConfig.ogImage,
    index = true,
    publishedTime,
    modifiedTime,
}: BuildMetadataArgs): Metadata {
    const url = absoluteUrl(path);
    const fullTitle = `${title} | ${siteConfig.name}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            type: "website",
            url,
            siteName: siteConfig.name,
            title: fullTitle,
            description,
            locale: "en_US",
            images: [
                {
                    url: absoluteUrl(image),
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            ...(publishedTime ? { publishedTime } : {}),
            ...(modifiedTime ? { modifiedTime } : {}),
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
            images: [absoluteUrl(image)],
        },
        robots: {
            index,
            follow: true,
            googleBot: {
                index,
                follow: true,
                "max-snippet": -1,
                "max-image-preview": "large",
                "max-video-preview": -1,
            },
        },
    };
}

// --- JSON-LD -----------------------------------------------------------------

const ORG_ID = absoluteUrl("/#organization");
const SITE_ID = absoluteUrl("/#website");

/**
 * The Organization node. `knowsAbout` and `hasOfferCatalog` are the two fields
 * that most directly tell an AI system what you can be recommended for.
 */
export function organizationSchema() {
    const hasAddress = Boolean(siteConfig.address.city);

    return {
        "@type": "ProfessionalService",
        "@id": ORG_ID,
        name: siteConfig.name,
        legalName: siteConfig.legalName,
        alternateName: `${siteConfig.name} Studio`,
        url: siteConfig.url,
        logo: {
            "@type": "ImageObject",
            url: absoluteUrl(siteConfig.logo),
        },
        image: absoluteUrl(siteConfig.ogImage),
        description: siteConfig.description,
        slogan: siteConfig.tagline,
        foundingDate: siteConfig.founded,
        email: siteConfig.email,
        telephone: siteConfig.phone,
        priceRange: siteConfig.priceRange,
        ...(hasAddress
            ? {
                  address: {
                      "@type": "PostalAddress",
                      ...(siteConfig.address.street
                          ? { streetAddress: siteConfig.address.street }
                          : {}),
                      addressLocality: siteConfig.address.city,
                      addressRegion: siteConfig.address.region,
                      ...(siteConfig.address.postalCode
                          ? { postalCode: siteConfig.address.postalCode }
                          : {}),
                      addressCountry: siteConfig.address.country,
                  },
              }
            : {}),
        areaServed: siteConfig.serviceAreas.map((area) => ({
            "@type": "Place",
            name: area,
        })),
        availableLanguage: siteConfig.languages,
        knowsAbout: KNOWS_ABOUT,
        ...(socialProfiles.length > 0 ? { sameAs: socialProfiles } : {}),
        contactPoint: [
            {
                "@type": "ContactPoint",
                contactType: "sales",
                email: siteConfig.email,
                availableLanguage: siteConfig.languages,
                areaServed: siteConfig.serviceAreas,
            },
        ],
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `${siteConfig.name} services`,
            itemListElement: KEYWORD_CLUSTERS.map((cluster) => ({
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: cluster.service,
                    description: cluster.definition,
                    serviceType: cluster.primary,
                    provider: { "@id": ORG_ID },
                    areaServed: siteConfig.serviceAreas,
                    ...(cluster.status === "live"
                        ? { url: absoluteUrl(cluster.path) }
                        : {}),
                },
            })),
        },
    };
}

export function websiteSchema() {
    return {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": ORG_ID },
        inLanguage: "en",
    };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
    return {
        "@type": "BreadcrumbList",
        itemListElement: trail.map((crumb, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: crumb.name,
            item: absoluteUrl(crumb.path),
        })),
    };
}

export function faqSchema(items: { question: string; answer: string }[]) {
    return {
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: resolveTokens(item.question),
            acceptedAnswer: {
                "@type": "Answer",
                text: resolveTokens(item.answer),
            },
        })),
    };
}

/**
 * The site-wide entity graph. Render once in the root layout.
 *
 * Deliberately does NOT include FAQPage. A FAQPage in the root layout appears
 * on every URL, so a page with its own FAQ ends up emitting two FAQPage
 * entities — which validators flag and which makes it ambiguous to a crawler
 * which questions belong to which page. The studio FAQ goes on the homepage
 * only, via homeSchema().
 */
export function siteSchema() {
    return {
        "@context": "https://schema.org",
        "@graph": [organizationSchema(), websiteSchema()],
    };
}

/** Homepage-only graph: the studio FAQ that AI assistants quote from. */
export function homeSchema() {
    return {
        "@context": "https://schema.org",
        "@graph": [
            faqSchema(SITE_FAQ),
            {
                "@type": "WebPage",
                "@id": `${absoluteUrl("/")}#webpage`,
                url: absoluteUrl("/"),
                name: siteConfig.name,
                description: siteConfig.description,
                inLanguage: "en",
                isPartOf: { "@id": SITE_ID },
                about: { "@id": ORG_ID },
            },
        ],
    };
}

/** Per-document graph for /privacy-policy and /terms. */
export function legalPageSchema(doc: LegalDocument) {
    const url = absoluteUrl(`/${doc.slug}`);

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": `${url}#webpage`,
                url,
                name: `${doc.title} — ${siteConfig.name}`,
                description: resolveTokens(doc.description),
                inLanguage: "en",
                isPartOf: { "@id": SITE_ID },
                about: { "@id": ORG_ID },
                publisher: { "@id": ORG_ID },
                datePublished: doc.effectiveDate,
                dateModified: doc.lastUpdated,
                version: doc.version,
                // Section summaries give a crawler the document's shape without
                // it having to parse the whole page.
                significantLink: doc.sections.map(
                    (section) => `${url}#${section.id}`,
                ),
            },
            breadcrumbSchema([
                { name: "Home", path: "/" },
                { name: doc.title, path: `/${doc.slug}` },
            ]),
            ...(doc.faq && doc.faq.length > 0 ? [faqSchema(doc.faq)] : []),
        ],
    };
}

/**
 * Structured data for one service detail page.
 *
 * Emits a `Service` entity wired back to the Organization via `provider`, plus
 * an `ItemList` of what is included. The BreadcrumbList and FAQPage are added
 * by the page itself so this helper stays composable.
 */
export function serviceSchema(service: {
    title: string;
    tagline: string;
    summary: string;
    path: string;
    deliverables: string[];
}) {
    return {
        "@type": "Service",
        "@id": absoluteUrl(`${service.path}#service`),
        name: service.title,
        serviceType: service.title,
        description: service.summary,
        url: absoluteUrl(service.path),
        provider: { "@id": ORG_ID },
        areaServed: siteConfig.serviceAreas.map((name) => ({
            "@type": "AdministrativeArea",
            name,
        })),
        availableLanguage: siteConfig.languages,
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `${service.title} deliverables`,
            itemListElement: service.deliverables.map((item, i) => ({
                "@type": "Offer",
                position: i + 1,
                itemOffered: { "@type": "Service", name: item },
            })),
        },
    };
}

/** Wraps any set of entities in the @graph envelope the site already uses. */
export function graph(...entities: object[]) {
    return {
        "@context": "https://schema.org",
        "@graph": entities,
    };
}
