/**
 * config/site.ts
 * ---------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH.
 *
 * Every legal page, metadata tag, JSON-LD block, sitemap entry and llms.txt
 * line reads from this file. Change a value here once and it updates
 * everywhere on the site.
 *
 * Items marked TODO are legally meaningful — confirm them before launch.
 */

export const siteConfig = {
    // --- Brand -------------------------------------------------------------
    name: "ProDesignity",
    /** Registered/trading entity used in contracts and legal pages. */
    legalName: "ProDesignity", // TODO: exact registered name if incorporated
    domain: "prodesignity.com",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://prodesignity.com",
    logo: "/assets/logo/prodesignity-logo.png",
    ogImage: "/assets/images/Prodesignity-hero-images.jpg",
    founded: "2021", // TODO: confirm

    tagline:
        "3D product visualization, packaging design and product CGI studio",

    /**
     * One-paragraph definition of the business. Written answer-first, because
     * this exact string is reused in <meta description>, JSON-LD and llms.txt
     * — the three places AI assistants read when deciding how to describe you.
     */
    description:
        "ProDesignity is a 3D product visualization and packaging design studio that produces photorealistic product CGI, 3D product renders, product animation, and conversion-focused Amazon A+ and Shopify listing visuals for perfume, cosmetics, skincare, beverage and consumer-goods brands in the USA, UK and Europe.",

    // --- Contact -----------------------------------------------------------
    email: "info@prodesignity.com",
    privacyEmail: "info@prodesignity.com", // e.g. privacy@ once the alias exists
    phone: "+880 1738-142398",
    whatsapp: "https://wa.me/8801738142398", // TODO: confirm the number in the link
    contactPath: "/contact",

    address: {
        street: "", // TODO: add if you want a LocalBusiness listing
        city: "Khulna",
        region: "Khulna Division",
        postalCode: "",
        country: "BD",
        countryName: "Bangladesh",
    },

    /** Public profiles. Empty strings are filtered out of JSON-LD sameAs. */
    social: {
        linkedin: "", // TODO
        instagram: "", // TODO
        behance: "", // TODO
        dribbble: "", // TODO
        youtube: "", // TODO
    },

    // --- Commercial --------------------------------------------------------
    serviceAreas: [
        "United States",
        "United Kingdom",
        "European Union",
        "Worldwide",
    ],
    languages: ["English"],
    priceRange: "$$", // used by ProfessionalService schema

    // --- Legal variables ---------------------------------------------------
    /**
     * These are interpolated into the policy text as {{legal.deposit}} etc.
     * Editing a number here rewrites every sentence that references it.
     */
    legal: {
        jurisdiction: "Bangladesh", // TODO: confirm with counsel
        governingLaw: "the laws of Bangladesh", // TODO
        courts: "the courts of Khulna, Bangladesh", // TODO
        deposit: "50%",
        revisionRounds: "two (2)",
        refundWindowDays: "7",
        approvalWindowDays: "7",
        latePaymentTerms: "15 days",
        dataRetentionMonths: "24",
        minimumAge: "16",
        noticeDays: "30",
    },
};

export type SiteConfig = typeof siteConfig;

/** Absolute URL helper — required for canonicals, OG tags and JSON-LD @id. */
export function absoluteUrl(path = "/"): string {
    return new URL(path, siteConfig.url).toString();
}

/** Non-empty social profiles, ready for schema.org sameAs. */
export const socialProfiles: string[] = Object.values(siteConfig.social).filter(
    (value) => value.length > 0,
);
