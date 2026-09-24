import type { Metadata } from "next";
<<<<<<< HEAD
import { absoluteUrl, siteConfig, socialProfiles } from "@/config/site";
=======
import {
    absoluteUrl,
    siteConfig,
    socialProfiles,
    type SiteConfig,
} from "@/config/site";
>>>>>>> seemol
import { KEYWORD_CLUSTERS, KNOWS_ABOUT } from "@/data/seo/keywords";
import { SITE_FAQ } from "@/data/seo/faq";
import { resolveTokens } from "@/lib/legal";
import type { LegalDocument } from "@/data/legal/types";
<<<<<<< HEAD
=======
import { absoluteMediaUrl } from "@/lib/site-settings";
>>>>>>> seemol

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
<<<<<<< HEAD
=======
    config?: SiteConfig;
>>>>>>> seemol
};

export function buildMetadata({
    title,
    description,
    path,
<<<<<<< HEAD
    image = siteConfig.ogImage,
    index = true,
    publishedTime,
    modifiedTime,
}: BuildMetadataArgs): Metadata {
    const url = absoluteUrl(path);
    const fullTitle = `${title} | ${siteConfig.name}`;
=======
    image,
    index = true,
    publishedTime,
    modifiedTime,
    config = siteConfig,
}: BuildMetadataArgs): Metadata {
    const url = absoluteUrl(path);
    const fullTitle = `${title} | ${config.name}`;
    const ogImage = absoluteMediaUrl(image ?? config.ogImage, config.url);
>>>>>>> seemol

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            type: "website",
            url,
<<<<<<< HEAD
            siteName: siteConfig.name,
=======
            siteName: config.name,
>>>>>>> seemol
            title: fullTitle,
            description,
            locale: "en_US",
            images: [
                {
<<<<<<< HEAD
                    url: absoluteUrl(image),
=======
                    url: ogImage,
>>>>>>> seemol
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
<<<<<<< HEAD
            images: [absoluteUrl(image)],
=======
            images: [ogImage],
>>>>>>> seemol
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
<<<<<<< HEAD
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
=======
export function organizationSchema(config: SiteConfig = siteConfig) {
    const hasAddress = Boolean(config.address.city);
    const orgRef = new URL("/#organization", config.url).toString();
    const sameAs = Object.values(config.social).filter((v) => v.length > 0);

    return {
        "@type": "ProfessionalService",
        "@id": orgRef,
        name: config.name,
        legalName: config.legalName,
        alternateName: `${config.name} Studio`,
        url: config.url,
        logo: {
            "@type": "ImageObject",
            url: absoluteMediaUrl(config.logo, config.url),
        },
        image: absoluteMediaUrl(config.ogImage, config.url),
        description: config.description,
        slogan: config.tagline,
        foundingDate: config.founded,
        email: config.email,
        telephone: config.phone,
        priceRange: config.priceRange,
>>>>>>> seemol
        ...(hasAddress
            ? {
                  address: {
                      "@type": "PostalAddress",
<<<<<<< HEAD
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
=======
                      ...(config.address.street
                          ? { streetAddress: config.address.street }
                          : {}),
                      addressLocality: config.address.city,
                      addressRegion: config.address.region,
                      ...(config.address.postalCode
                          ? { postalCode: config.address.postalCode }
                          : {}),
                      addressCountry: config.address.country,
                  },
              }
            : {}),
        areaServed: config.serviceAreas.map((area) => ({
            "@type": "Place",
            name: area,
        })),
        availableLanguage: config.languages,
        knowsAbout: KNOWS_ABOUT,
        ...(sameAs.length > 0
            ? { sameAs }
            : socialProfiles.length > 0
              ? { sameAs: socialProfiles }
              : {}),
>>>>>>> seemol
        contactPoint: [
            {
                "@type": "ContactPoint",
                contactType: "sales",
<<<<<<< HEAD
                email: siteConfig.email,
                availableLanguage: siteConfig.languages,
                areaServed: siteConfig.serviceAreas,
=======
                email: config.email,
                availableLanguage: config.languages,
                areaServed: config.serviceAreas,
>>>>>>> seemol
            },
        ],
        hasOfferCatalog: {
            "@type": "OfferCatalog",
<<<<<<< HEAD
            name: `${siteConfig.name} services`,
=======
            name: `${config.name} services`,
>>>>>>> seemol
            itemListElement: KEYWORD_CLUSTERS.map((cluster) => ({
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: cluster.service,
                    description: cluster.definition,
                    serviceType: cluster.primary,
<<<<<<< HEAD
                    provider: { "@id": ORG_ID },
                    areaServed: siteConfig.serviceAreas,
=======
                    provider: { "@id": orgRef },
                    areaServed: config.serviceAreas,
>>>>>>> seemol
                    ...(cluster.status === "live"
                        ? { url: absoluteUrl(cluster.path) }
                        : {}),
                },
            })),
        },
    };
}

<<<<<<< HEAD
export function websiteSchema() {
    return {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": ORG_ID },
=======
export function websiteSchema(config: SiteConfig = siteConfig) {
    return {
        "@type": "WebSite",
        "@id": new URL("/#website", config.url).toString(),
        url: config.url,
        name: config.name,
        description: config.description,
        publisher: {
            "@id": new URL("/#organization", config.url).toString(),
        },
>>>>>>> seemol
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
<<<<<<< HEAD
export function siteSchema() {
    return {
        "@context": "https://schema.org",
        "@graph": [organizationSchema(), websiteSchema()],
=======
export function siteSchema(config: SiteConfig = siteConfig) {
    return {
        "@context": "https://schema.org",
        "@graph": [organizationSchema(config), websiteSchema(config)],
>>>>>>> seemol
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

/**
 * Structured data for one blog post.
 *
 * Emits a `BlogPosting` wired to the Organization as publisher and to a Person
 * as author. `wordCount` and `articleSection` are cheap to provide and are
 * exactly the fields an AI crawler uses to judge whether a page is a
 * substantial article or a thin marketing page.
 *
 * BreadcrumbList and FAQPage are added by the page so this stays composable,
 * matching serviceSchema() above.
 */
export function articleSchema(article: {
    title: string;
    description: string;
    path: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    author: { name: string; role: string };
    keywords: string[];
    section: string;
    wordCount: number;
}) {
    const url = absoluteUrl(article.path);

    return {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: article.title,
        description: article.description,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": `${url}#webpage` },
        image: [absoluteUrl(article.image)],
        datePublished: article.datePublished,
        dateModified: article.dateModified ?? article.datePublished,
        author: {
            "@type": "Person",
            name: article.author.name,
            jobTitle: article.author.role,
            worksFor: { "@id": ORG_ID },
        },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": BLOG_ID },
        articleSection: article.section,
        keywords: article.keywords.join(", "),
        wordCount: article.wordCount,
        inLanguage: "en",
    };
}

const BLOG_ID = absoluteUrl("/blog/#blog");

/** The /blog listing itself, as a Blog entity holding every post. */
export function blogSchema(
    posts: { title: string; path: string; datePublished: string }[],
) {
    return {
        "@type": "Blog",
        "@id": BLOG_ID,
        url: absoluteUrl("/blog"),
        name: `${siteConfig.name} Journal`,
        description: `Practical notes on 3D product visualization, packaging, e-commerce design and product CGI from the ${siteConfig.name} studio.`,
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": SITE_ID },
        inLanguage: "en",
        blogPost: posts.map((post) => ({
            "@type": "BlogPosting",
            "@id": `${absoluteUrl(post.path)}#article`,
            headline: post.title,
            url: absoluteUrl(post.path),
            datePublished: post.datePublished,
        })),
    };
}

/** Wraps any set of entities in the @graph envelope the site already uses. */
export function graph(...entities: object[]) {
    return {
        "@context": "https://schema.org",
        "@graph": entities,
    };
}
