/**
 * data/seo/keywords.ts
 * ---------------------------------------------------------------------------
 * Your keyword.txt list, restructured into a topic map.
 *
 * A flat list of 400 keywords cannot be "used" — pages rank, keywords don't.
 * This file turns the list into clusters, each with:
 *   - one primary keyword (the page's H1 intent)
 *   - supporting keywords (H2s, body copy, image alt text)
 *   - the page that owns the cluster
 *
 * The clusters also power:
 *   - schema.org `knowsAbout` and `hasOfferCatalog` (lib/seo.ts)
 *   - the service index in /llms.txt
 * Both are read by AI crawlers, which is why keeping this file honest matters
 * more than a <meta keywords> tag ever did.
 *
 * RULE: never add a cluster here until the page at `path` actually exists and
 * says something substantive. Claiming coverage you don't have is how a site
 * gets described inaccurately by an assistant.
 */

export interface KeywordCluster {
    id: string;
    /** Human-readable service name. Used in schema hasOfferCatalog. */
    service: string;
    /** The one keyword the page is built around. */
    primary: string;
    /** Supporting terms for H2s, body copy and alt text. */
    supporting: string[];
    /** Route that owns this cluster. Build it before claiming it. */
    path: string;
    /** Plain-language definition — AI assistants quote this kind of sentence. */
    definition: string;
    status: "live" | "planned";
}

export const KEYWORD_CLUSTERS: KeywordCluster[] = [
    {
        id: "product-visualization",
        service: "3D Product Visualization",
        primary: "3D product visualization",
        supporting: [
            "3D product rendering",
            "photorealistic product rendering",
            "product visualization services",
            "3D product visualization agency",
            "commercial product visualization",
            "product visualization studio",
            "3D visualization company",
        ],
        path: "/services/3d-product-visualization",
        definition:
            "3D product visualization is the process of building a product as a digital 3D model and rendering photorealistic images of it, replacing or supplementing a physical photo shoot.",
        status: "planned",
    },
    {
        id: "product-cgi",
        service: "Product CGI & Advertising Visuals",
        primary: "product CGI",
        supporting: [
            "product CGI services",
            "product CGI agency",
            "commercial product CGI",
            "product advertising CGI",
            "CGI product photography",
            "photorealistic product CGI",
            "3D product advertisement",
        ],
        path: "/services/product-cgi",
        definition:
            "Product CGI is computer-generated imagery used in advertising, where the product, set and lighting are all created digitally instead of photographed.",
        status: "planned",
    },
    {
        id: "3d-modeling-cad",
        service: "3D Product Modeling & CAD",
        primary: "3D product modeling",
        supporting: [
            "product CAD modeling",
            "hard surface 3D modeling",
            "3D model from photos",
            "manufacturing-ready 3D model",
            "STEP file modeling",
            "CAD to 3D model",
            "industrial 3D modeling",
        ],
        path: "/services/3d-product-modeling",
        definition:
            "3D product modeling builds an accurate digital model of a product from CAD data, drawings or reference photographs, for rendering, prototyping or manufacturing.",
        status: "planned",
    },
    {
        id: "packaging-design",
        service: "Packaging Design & Dielines",
        primary: "packaging design agency",
        supporting: [
            "product packaging design",
            "luxury packaging design",
            "packaging dieline design",
            "print-ready packaging design",
            "packaging 3D visualization",
            "packaging mockup services",
            "packaging rendering",
        ],
        path: "/services/packaging-design",
        definition:
            "Packaging design covers the structural dieline and printed artwork for a product's box, bottle or carton, delivered print-ready and previewed as a 3D packaging render.",
        status: "planned",
    },
    {
        id: "perfume-fragrance",
        service: "Perfume & Fragrance Visualization",
        primary: "perfume packaging design",
        supporting: [
            "perfume bottle 3D rendering",
            "perfume bottle 3D modeling",
            "luxury fragrance packaging",
            "perfume product CGI",
            "fragrance bottle visualization",
            "perfume bottle mockup",
            "perfume advertising CGI",
        ],
        path: "/industries/perfume-fragrance",
        definition:
            "Perfume visualization renders glass, liquid, caps and foil finishes accurately, which is the hardest part of fragrance imagery and the reason CGI is often used instead of photography.",
        status: "planned",
    },
    {
        id: "cosmetics-beauty",
        service: "Cosmetics, Beauty & Skincare Visualization",
        primary: "cosmetic packaging design",
        supporting: [
            "cosmetic product rendering",
            "skincare product visualization",
            "beauty product CGI",
            "skincare packaging design",
            "cosmetic bottle mockup",
            "beauty product rendering",
        ],
        path: "/industries/cosmetics-skincare",
        definition:
            "Cosmetics and skincare visualization produces packaging design and photorealistic renders for jars, droppers, tubes and airless bottles, including frosted glass and metallic finishes.",
        status: "planned",
    },
    {
        id: "amazon",
        service: "Amazon Listing Images & A+ Content",
        primary: "Amazon A+ Content design",
        supporting: [
            "Amazon product listing images",
            "Amazon infographic design",
            "Amazon lifestyle images",
            "Amazon Premium A+ Content",
            "Amazon Brand Story design",
            "Amazon Storefront design",
            "Amazon listing optimization",
        ],
        path: "/services/amazon-listing-design",
        definition:
            "Amazon listing design covers the main image, infographics, lifestyle shots and A+ Content modules that make up a product detail page, produced to Amazon's image and content requirements.",
        status: "planned",
    },
    {
        id: "shopify",
        service: "Shopify Product Imagery & Store Design",
        primary: "Shopify product images",
        supporting: [
            "Shopify product page design",
            "Shopify product rendering",
            "Shopify banner design",
            "Shopify design agency",
            "Shopify product mockups",
        ],
        path: "/services/shopify-product-design",
        definition:
            "Shopify product imagery covers the product photography alternative, page banners and product-page graphics used across a Shopify store.",
        status: "planned",
    },
    {
        id: "product-animation",
        service: "3D Product Animation",
        primary: "3D product animation",
        supporting: [
            "product promotional video",
            "product explainer animation",
            "packaging animation",
            "product commercial animation",
            "product CGI animation",
        ],
        path: "/services/product-animation",
        definition:
            "3D product animation turns the same 3D asset used for stills into short motion content for ads, product pages and social.",
        status: "planned",
    },
    {
        id: "product-mockups",
        service: "Photorealistic Product Mockups",
        primary: "3D product mockup services",
        supporting: [
            "photorealistic product mockup",
            "packaging mockup design",
            "bottle 3D mockup",
            "digital product mockup",
        ],
        path: "/services/product-mockups",
        definition:
            "A 3D product mockup previews artwork on the finished product before printing, using the real dieline rather than a generic template.",
        status: "planned",
    },
];

/** Flat list of every distinct topic — used for schema.org knowsAbout. */
export const KNOWS_ABOUT: string[] = Array.from(
    new Set(
        KEYWORD_CLUSTERS.flatMap((cluster) => [
            cluster.primary,
            ...cluster.supporting,
        ])
    )
);

/**
 * Regional variants. Do NOT create a separate page per region unless you can
 * write genuinely different content for it (local case studies, currency,
 * timezone coverage, VAT). Thin "…agency USA / UK / Europe" duplicates are the
 * fastest way to get a site classified as low quality by both search engines
 * and AI retrieval systems. Handle regions inside your main service pages —
 * a "Working with US, UK and EU brands" section — until you have real proof.
 */
export const SERVICE_REGIONS = [
    "USA",
    "UK",
    "Europe",
] as const;
