/**
 * data/servicesData.ts
 * ---------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH FOR EVERY SERVICE.
 *
 * Read by:
 *   - the header dropdown  (Services -> group -> service)
 *   - the mobile menu accordion
 *   - the "Types of Work We Do" marquee on the homepage
 *   - /services                        (hub)
 *   - /services/our-service            (approach + team)
 *   - /services/our-service/[slug]     (one static page per service)
 *   - sitemap / JSON-LD helpers
 *
 * Add a service here and it appears in all of the above with no other edit.
 * `slug` becomes the URL segment, so changing one is a redirect-worthy event.
 *
 * Icons are stored as STRING KEYS, not components. A `.ts` data module is
 * imported by both server and client components, and a React component cannot
 * be handed across that boundary as a prop. `components/ServiceIcon.tsx` maps
 * the key back to the lucide icon.
 */

export type ServiceIconName =
    | "Palette"
    | "ListChecks"
    | "AppWindow"
    | "Layout"
    | "ShoppingBag"
    | "PackageSearch"
    | "Sparkles"
    | "Megaphone"
    | "SearchCheck"
    | "Video"
    | "Box"
    | "Film"
    | "BookOpen";

export type ServiceGroupSlug =
    | "web-design"
    | "seo-marketing"
    | "creative-branding"
    | "animation-video";

export interface ServiceGroup {
    slug: ServiceGroupSlug;
    /** Label shown in the first level of the dropdown. */
    title: string;
    /** One line, used in the mega-menu and on the hub page. */
    blurb: string;
    icon: ServiceIconName;
}

export interface ServiceStep {
    title: string;
    body: string;
}

export interface ServiceFaq {
    q: string;
    a: string;
}

export interface ServiceAccent {
    /** Tailwind classes for the icon tile background. */
    iconBg: string;
    /** Tailwind classes for the icon glyph colour. */
    iconColor: string;
    /** Border colour applied on card hover. */
    hoverBorder: string;
    /** Gradient used for the hero wash on the detail page. */
    wash: string;
}

export interface Service {
    slug: string;
    /** Used as the nav label, the card title AND the <h1> on the detail page. */
    title: string;
    group: ServiceGroupSlug;
    icon: ServiceIconName;
    /** Short line that sits directly under the H1. */
    tagline: string;
    /** Card copy — the text in the "Types of Work We Do" cards. */
    summary: string;
    /** Body copy for the detail page, one string per paragraph. */
    intro: string[];
    /** "What you get" checklist. */
    deliverables: string[];
    /** Who the service suits. */
    idealFor: string[];
    process: ServiceStep[];
    faqs: ServiceFaq[];
    /** Human-readable turnaround, e.g. "5–10 working days". */
    timeline: string;
    /** Indicative entry price. Keep vague enough to stay honest. */
    startingAt: string;
    accent: ServiceAccent;
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
}

/* -------------------------------------------------------------------------
   Accent presets — keeps the colour logic out of the 13 service entries.
   ------------------------------------------------------------------------- */

const ACCENTS: Record<string, ServiceAccent> = {
    violet: {
        iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
        iconColor: "text-brand-violet dark:text-dark-brand-violet",
        hoverBorder:
            "group-hover:border-brand-violet/40 dark:group-hover:border-dark-brand-violet/40",
        wash: "from-brand-violet/18 via-primary/12 to-brand-blue/15",
    },
    blue: {
        iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
        iconColor: "text-brand-blue dark:text-dark-brand-blue",
        hoverBorder:
            "group-hover:border-brand-blue/40 dark:group-hover:border-dark-brand-blue/40",
        wash: "from-brand-blue/18 via-primary/12 to-cyan-400/15",
    },
    indigo: {
        iconBg: "bg-primary/10 dark:bg-dark-primary/15",
        iconColor: "text-primary dark:text-dark-primary",
        hoverBorder:
            "group-hover:border-primary/40 dark:group-hover:border-dark-primary/40",
        wash: "from-primary/18 via-brand-violet/12 to-brand-blue/15",
    },
    emerald: {
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        hoverBorder: "group-hover:border-emerald-500/40",
        wash: "from-emerald-500/18 via-primary/10 to-brand-blue/15",
    },
    orange: {
        iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
        iconColor: "text-brand-orange dark:text-dark-brand-orange",
        hoverBorder:
            "group-hover:border-brand-orange/40 dark:group-hover:border-dark-brand-orange/40",
        wash: "from-brand-orange/18 via-primary/10 to-brand-violet/15",
    },
};

/* -------------------------------------------------------------------------
   Groups — the FIRST level of the Services dropdown.
   ------------------------------------------------------------------------- */

export const SERVICE_GROUPS: ServiceGroup[] = [
    {
        slug: "web-design",
        title: "Web Design",
        blurb: "Storefronts, marketing sites and custom web apps.",
        icon: "Layout",
    },
    {
        slug: "seo-marketing",
        title: "SEO & Marketing",
        blurb: "Get found, get clicked, get bought.",
        icon: "SearchCheck",
    },
    {
        slug: "creative-branding",
        title: "Creative & Branding",
        blurb: "Visual identity, packaging and print-ready collateral.",
        icon: "Palette",
    },
    {
        slug: "animation-video",
        title: "Animation & Video",
        blurb: "2D, 3D and UGC content that sells the product.",
        icon: "Film",
    },
];

/* -------------------------------------------------------------------------
   Services — the SECOND level of the dropdown, and one page each.
   ------------------------------------------------------------------------- */

export const SERVICES: Service[] = [
    /* ---------------------------- Web Design ---------------------------- */
    {
        slug: "website-design-development",
        title: "Website Design & Development",
        group: "web-design",
        icon: "Layout",
        tagline:
            "Fast, accessible, search-friendly websites built to represent your brand properly.",
        summary:
            "Create modern, fast, mobile-friendly websites made to represent your brand professionally.",
        intro: [
            "Most business websites fail for boring reasons: they load slowly on a phone, the copy buries the offer, and nothing on the page tells a visitor what to do next. We design and build sites that fix those three things first, then make them look good.",
            "Every build starts from your actual sales conversation — what people ask, what they object to, what convinces them — and turns that into a page order. The result is a site your team can update without a developer, and one that scores well on Core Web Vitals because performance is designed in rather than bolted on afterwards.",
        ],
        deliverables: [
            "Sitemap, wireframes and a clickable design in Figma",
            "Responsive build tested on real phones, tablets and desktops",
            "Core Web Vitals tuning: image formats, lazy loading, font strategy",
            "On-page SEO groundwork — headings, metadata, schema, sitemap.xml",
            "CMS or static build so your team can edit copy safely",
            "Analytics, event tracking and a 30-day post-launch support window",
        ],
        idealFor: [
            "Brands replacing an ageing template site",
            "Agencies and studios that need a credible portfolio site",
            "Product companies launching a new line",
        ],
        process: [
            {
                title: "Discovery",
                body: "A 30-minute call to map your audience, competitors and the one action the site must drive.",
            },
            {
                title: "Structure",
                body: "Sitemap and wireframes first, so we argue about page order before anyone argues about colour.",
            },
            {
                title: "Design",
                body: "High-fidelity screens in Figma for desktop and mobile, with two rounds of revision built in.",
            },
            {
                title: "Build",
                body: "Semantic, accessible markup with performance budgets enforced as we go.",
            },
            {
                title: "Launch & handover",
                body: "Staging review, redirects, analytics, then a recorded walkthrough of how to edit everything.",
            },
        ],
        faqs: [
            {
                q: "How long does a website take?",
                a: "A focused five to seven page site usually runs three to five weeks end to end. Larger sites with custom templates or a CMS migration run six to ten weeks.",
            },
            {
                q: "Do you work with WordPress, Webflow or custom code?",
                a: "All three. We pick the platform after discovery based on who edits the site and how often, not on what we felt like building that week.",
            },
            {
                q: "Will the site be SEO-ready at launch?",
                a: "Yes. Heading hierarchy, metadata, structured data, internal linking, image alt text, XML sitemap and a clean URL structure ship with every build.",
            },
        ],
        timeline: "3–6 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.orange,
        seo: {
            title: "Website Design & Development Services",
            description:
                "Custom website design and development for brands that need a fast, mobile-friendly, search-ready site. Figma design, accessible build, Core Web Vitals tuning and post-launch support.",
            keywords: [
                "website design services",
                "web development agency",
                "custom website design",
                "responsive web design",
                "business website development",
            ],
        },
    },
    {
        slug: "shopify-store-design",
        title: "Shopify Store Design",
        group: "web-design",
        icon: "ShoppingBag",
        tagline:
            "High-converting Shopify storefronts, built around your best-selling products.",
        summary:
            "Build high-converting Shopify stores that make shopping simple and drive more sales.",
        intro: [
            "A Shopify theme out of the box is a starting point, not a store. The default product page shows the same six blocks whether you sell running shoes or perfume, and the checkout journey is tuned for nobody in particular.",
            "We rebuild the parts that decide revenue — collection filtering, product page hierarchy, cart and upsell logic, mobile speed — and leave the parts that already work alone. That keeps cost sane and change measurable.",
        ],
        deliverables: [
            "Theme setup or custom section development on Online Store 2.0",
            "Product and collection page templates designed for conversion",
            "Mobile-first speed pass: image sizing, app audit, script cleanup",
            "Cart, upsell and cross-sell configuration",
            "App integration — reviews, subscriptions, email, loyalty",
            "Migration from WooCommerce, Wix, BigCommerce or an older theme",
        ],
        idealFor: [
            "DTC brands stuck on a stock theme",
            "Stores with traffic but a weak add-to-cart rate",
            "Merchants migrating from another platform",
        ],
        process: [
            {
                title: "Store audit",
                body: "We walk the current funnel on a real phone and list what leaks, ranked by revenue impact.",
            },
            {
                title: "Design",
                body: "New templates for home, collection, product and cart — the four pages that carry the money.",
            },
            {
                title: "Build",
                body: "Custom sections in Liquid so your team can rearrange pages without touching code.",
            },
            {
                title: "Speed pass",
                body: "App audit, image compression and script deferral until mobile Lighthouse is respectable.",
            },
            {
                title: "Launch & measure",
                body: "Go live on a quiet traffic day, then compare add-to-cart and checkout rates against baseline.",
            },
        ],
        faqs: [
            {
                q: "Will I lose my current products or orders?",
                a: "No. Theme work never touches product, customer or order data. Platform migrations are done on a staging store and verified before any DNS change.",
            },
            {
                q: "Do you build custom sections or use a premium theme?",
                a: "Usually a well-chosen theme plus custom sections. It is faster, cheaper to maintain, and survives Shopify's platform updates better than a fully bespoke theme.",
            },
            {
                q: "Can you fix a slow store without a redesign?",
                a: "Often, yes. A speed-only engagement typically means auditing installed apps, resizing images and deferring third-party scripts.",
            },
        ],
        timeline: "2–5 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.indigo,
        seo: {
            title: "Shopify Store Design & Development",
            description:
                "Conversion-focused Shopify store design: custom Online Store 2.0 sections, product page redesign, speed optimisation and platform migration for DTC brands.",
            keywords: [
                "shopify store design",
                "shopify development agency",
                "shopify theme customization",
                "shopify conversion optimization",
                "shopify migration services",
            ],
        },
    },
    {
        slug: "web-applications",
        title: "Web Applications",
        group: "web-design",
        icon: "AppWindow",
        tagline:
            "Custom internal tools and customer-facing apps that replace the spreadsheet.",
        summary:
            "Develop custom web applications that simplify operations and solve real business needs.",
        intro: [
            "Every growing company reaches the point where the spreadsheet that ran the business becomes the thing holding it back. Three people edit the same file, one of them breaks a formula, and nobody notices for a week.",
            "We build the smallest application that removes that risk — a dashboard, a booking system, a quoting tool, a client portal — with real accounts, permissions and an audit trail. Small scope first, then extend once people are using it daily.",
        ],
        deliverables: [
            "Requirements workshop and a written scope you can veto",
            "Database schema, API design and authentication",
            "Responsive front end with role-based access",
            "Third-party integrations — payments, email, CRM, storage",
            "Deployment, backups and monitoring",
            "Documentation and a training session for your team",
        ],
        idealFor: [
            "Operations teams running on fragile spreadsheets",
            "Service businesses that need booking or quoting tools",
            "Founders validating a SaaS idea with a real first version",
        ],
        process: [
            {
                title: "Scope",
                body: "We write down what version one does and, more importantly, what it does not do.",
            },
            {
                title: "Data model",
                body: "Schema and permissions first — retrofitting either one later is where budgets die.",
            },
            {
                title: "Build in slices",
                body: "One working feature at a time, deployed to a staging URL you can click through weekly.",
            },
            {
                title: "Hardening",
                body: "Validation, error handling, rate limiting, backups and access logs before real data goes in.",
            },
            {
                title: "Handover",
                body: "Documentation, a training call and an agreed support window.",
            },
        ],
        faqs: [
            {
                q: "Do I own the code?",
                a: "Yes. The repository is transferred to you on final payment, along with infrastructure access and documentation.",
            },
            {
                q: "What stack do you use?",
                a: "Typically React or Next.js on the front end with a Node or PHP API and a relational database. We will use your existing stack if you have an in-house team to maintain it.",
            },
            {
                q: "Can you take over an unfinished project?",
                a: "Sometimes. We start with a paid code audit so we can tell you honestly whether continuing or restarting costs less.",
            },
        ],
        timeline: "4–12 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.blue,
        seo: {
            title: "Custom Web Application Development",
            description:
                "Custom web application development: internal dashboards, booking systems, client portals and MVPs. Scoped tightly, built in slices, documented and handed over.",
            keywords: [
                "custom web application development",
                "internal tools development",
                "business web app",
                "saas mvp development",
                "web app developers",
            ],
        },
    },

    /* -------------------------- SEO & Marketing ------------------------- */
    {
        slug: "seo",
        title: "SEO",
        group: "seo-marketing",
        icon: "SearchCheck",
        tagline:
            "Technical, on-page and content SEO that compounds instead of spiking.",
        summary:
            "Improve your search visibility so more potential customers can find your business online.",
        intro: [
            "SEO work splits into three buckets: fixing what stops search engines reading the site, making each page unambiguously about one thing, and earning enough authority for that to matter. Skipping the first two and buying links is how most budgets get wasted.",
            "We start with a crawl and a keyword map, fix the technical debt, then publish against the queries that actually sit near a purchase decision. Reporting is tied to rankings, impressions and assisted revenue — not to a vanity traffic number.",
        ],
        deliverables: [
            "Full technical crawl: indexation, redirects, canonicals, speed, schema",
            "Keyword research mapped one primary query per page",
            "On-page rewrites — titles, headings, internal links, metadata",
            "Content plan with briefs your writers or ours can execute",
            "Structured data and rich result eligibility",
            "Monthly reporting on rankings, impressions and conversions",
        ],
        idealFor: [
            "Sites that rank for their brand name and nothing else",
            "Businesses relying entirely on paid traffic",
            "Post-migration sites that lost visibility",
        ],
        process: [
            {
                title: "Audit",
                body: "Crawl, Search Console review and a competitor gap analysis, delivered as a prioritised fix list.",
            },
            {
                title: "Fix",
                body: "Technical issues first — nothing else works while pages are blocked, duplicated or slow.",
            },
            {
                title: "Map",
                body: "One page, one primary intent. Cannibalised pages get merged or redirected.",
            },
            {
                title: "Publish",
                body: "Briefs, drafts and internal links shipped on a monthly cadence.",
            },
            {
                title: "Measure",
                body: "Rankings, impressions, clicks and conversions reviewed monthly against the plan.",
            },
        ],
        faqs: [
            {
                q: "How long before I see results?",
                a: "Technical fixes can move impressions within weeks. Competitive commercial keywords realistically take four to eight months of consistent work.",
            },
            {
                q: "Do you guarantee a number one ranking?",
                a: "No, and neither should anyone else. We commit to the work, the reporting and the fix list — nobody can commit to Google's ranking output.",
            },
            {
                q: "Is content writing included?",
                a: "Briefs always. Full drafting is an add-on, or we brief your in-house writer if you have one.",
            },
        ],
        timeline: "Ongoing, 3-month minimum",
        startingAt: "Monthly retainer",
        accent: ACCENTS.emerald,
        seo: {
            title: "SEO Services — Technical, On-Page & Content",
            description:
                "SEO services covering technical audits, keyword mapping, on-page optimisation, structured data and content planning, reported against rankings and conversions.",
            keywords: [
                "seo services",
                "technical seo audit",
                "on page seo",
                "seo agency",
                "search engine optimization services",
            ],
        },
    },
    {
        slug: "paid-advertising",
        title: "Paid Advertising",
        group: "seo-marketing",
        icon: "Megaphone",
        tagline:
            "Google, Meta and TikTok campaigns managed against profit, not impressions.",
        summary:
            "Run targeted ad campaigns designed to reach the right people and generate results.",
        intro: [
            "Ad platforms optimise for whatever you tell them to optimise for. Point them at clicks and you will get cheap clicks from people who were never going to buy. Point them at a clean purchase signal and the same budget behaves completely differently.",
            "We fix tracking first, structure the account so spend is readable, then test creative in a way that produces a decision instead of an opinion. Every campaign has a stated target — ROAS, cost per lead, or payback window — agreed before launch.",
        ],
        deliverables: [
            "Conversion tracking and server-side event setup",
            "Account structure and audience build",
            "Creative production — statics, carousels and short video",
            "Landing page recommendations, or a built page if needed",
            "Structured creative and audience testing",
            "Weekly performance reporting against the agreed target",
        ],
        idealFor: [
            "Stores scaling past word-of-mouth",
            "Lead-gen businesses with a known customer value",
            "Brands whose ad account has drifted for months",
        ],
        process: [
            {
                title: "Tracking",
                body: "Nothing launches until conversions fire correctly and can be trusted.",
            },
            {
                title: "Structure",
                body: "Campaigns rebuilt so budget, audience and creative can each be read separately.",
            },
            {
                title: "Creative",
                body: "A first batch of angles produced in-house, ready to be judged by the data.",
            },
            {
                title: "Test",
                body: "One variable at a time, with a spend threshold and a stop rule set in advance.",
            },
            {
                title: "Scale",
                body: "Budget moves toward what is profitable; losers are cut without sentiment.",
            },
        ],
        faqs: [
            {
                q: "What budget do I need to start?",
                a: "Enough to reach statistical signal — typically a few thousand dollars a month in ad spend, separate from management fees. Below that, organic and email are usually a better use of money.",
            },
            {
                q: "Do you produce the ad creative?",
                a: "Yes. Statics, carousels and short-form video are produced in-house, which is why testing does not stall waiting on assets.",
            },
            {
                q: "Who owns the ad accounts?",
                a: "You do. We work inside your Business Manager and Google Ads account, never our own.",
            },
        ],
        timeline: "Ongoing, 3-month minimum",
        startingAt: "Monthly retainer",
        accent: ACCENTS.blue,
        seo: {
            title: "Paid Advertising — Google, Meta & TikTok Ads Management",
            description:
                "Paid ads management across Google, Meta and TikTok: conversion tracking, account structure, in-house creative production and structured testing against ROAS targets.",
            keywords: [
                "paid advertising agency",
                "google ads management",
                "meta ads agency",
                "tiktok ads management",
                "ppc management services",
            ],
        },
    },
    {
        slug: "amazon-listing",
        title: "Amazon Listing",
        group: "seo-marketing",
        icon: "PackageSearch",
        tagline:
            "Titles, images, A+ content and backend keywords tuned for the Amazon algorithm.",
        summary:
            "Optimize Amazon titles, images, descriptions, and content to improve product conversions.",
        intro: [
            "Amazon rewards listings that convert. Rank follows sales velocity, so the image stack and the first three bullets do more for visibility than any keyword stuffing trick.",
            "We rebuild the listing as a unit: main image that survives being 200 pixels wide on a phone, bullets that answer the objection before it forms, A+ modules that carry the brand, and backend terms that pick up the long tail your competitors ignore.",
        ],
        deliverables: [
            "Keyword research from Amazon search data, not web volume",
            "Title, bullets and description rewritten for the category",
            "Image stack plan: hero, infographic, lifestyle, comparison, packaging",
            "A+ / EBC module design and copy",
            "Backend search terms and attribute completeness",
            "Storefront layout recommendations",
        ],
        idealFor: [
            "Sellers with traffic but a weak conversion rate",
            "New ASINs launching into a competitive category",
            "Brands whose listings were written years ago",
        ],
        process: [
            {
                title: "Category research",
                body: "We read the top ten competitors' listings and reviews to find the real objections.",
            },
            {
                title: "Keyword set",
                body: "Primary, secondary and backend terms pulled from Amazon-native data.",
            },
            {
                title: "Copy",
                body: "Title, bullets and description drafted against Amazon's style limits, not a blog voice.",
            },
            {
                title: "Visuals",
                body: "Image stack and A+ modules designed and produced, mobile legibility checked first.",
            },
            {
                title: "Upload & review",
                body: "Flat file or Seller Central upload, then a conversion check two weeks later.",
            },
        ],
        faqs: [
            {
                q: "Can you upload the listing for me?",
                a: "Yes, with Seller Central access. Otherwise we deliver a flat file and copy blocks your team can paste in.",
            },
            {
                q: "Do you handle Amazon PPC too?",
                a: "That sits under paid advertising. Listing work should come first — advertising an unconverting listing just spends money faster.",
            },
            {
                q: "Which marketplaces do you cover?",
                a: "Amazon US, UK, Canada, Australia and the major EU marketplaces. Copy is written for the target locale rather than translated word for word.",
            },
        ],
        timeline: "1–3 weeks per listing",
        startingAt: "Per-listing pricing",
        accent: ACCENTS.blue,
        seo: {
            title: "Amazon Listing Optimization & A+ Content",
            description:
                "Amazon listing optimisation: keyword research, title and bullet rewrites, image stack design, A+ content and backend search terms for higher conversion and rank.",
            keywords: [
                "amazon listing optimization",
                "amazon a plus content design",
                "amazon seo services",
                "amazon product listing services",
                "amazon image stack design",
            ],
        },
    },
    {
        slug: "product-listing",
        title: "Product Listing",
        group: "seo-marketing",
        icon: "ListChecks",
        tagline:
            "Clean, complete, consistent product data across every channel you sell on.",
        summary:
            "Create clear, optimized product listings that help customers understand and buy with confidence.",
        intro: [
            "Multi-channel selling breaks on data quality long before it breaks on strategy. The same product ends up with three titles, two sets of dimensions and a missing GTIN, and then the feed gets rejected.",
            "We build one clean product record per SKU and adapt it per channel, so Shopify, Amazon, eBay, Etsy and Google Shopping all describe the same product the same way — and each one gets the fields it actually cares about.",
        ],
        deliverables: [
            "Product data template and attribute taxonomy",
            "Titles, descriptions and specs written per channel",
            "Variant, size and colour structure that does not confuse buyers",
            "Image renaming, cropping and background standardisation",
            "Category, GTIN and compliance field completion",
            "Bulk CSV or feed file ready for upload",
        ],
        idealFor: [
            "Catalogues moving from one channel to several",
            "Stores with inconsistent legacy product data",
            "Wholesale brands supplying retailer feeds",
        ],
        process: [
            {
                title: "Audit the catalogue",
                body: "We sample your SKUs and list every field that is missing, duplicated or contradictory.",
            },
            {
                title: "Define the template",
                body: "One master schema, then per-channel mappings from it.",
            },
            {
                title: "Write",
                body: "Titles and copy produced to each channel's character limits and style rules.",
            },
            {
                title: "Standardise images",
                body: "Consistent crop, background and naming so the feed does not reject them.",
            },
            {
                title: "Deliver",
                body: "Upload-ready files, plus a short guide so new SKUs stay consistent.",
            },
        ],
        faqs: [
            {
                q: "How many SKUs can you handle?",
                a: "From a dozen to several thousand. Large catalogues are handled in batches with a sample approved before the rest is produced.",
            },
            {
                q: "Do you write every description by hand?",
                a: "Hero products are written individually. Long-tail variants use a structured template so the catalogue stays consistent and affordable.",
            },
            {
                q: "Can you fix rejected Google Shopping feeds?",
                a: "Yes. Most rejections trace back to missing GTINs, category mismatches or image rules, all of which are fixable in the source data.",
            },
        ],
        timeline: "1–4 weeks",
        startingAt: "Per-SKU pricing",
        accent: ACCENTS.violet,
        seo: {
            title: "Product Listing Services & Catalogue Management",
            description:
                "Product listing and catalogue services: per-channel titles and descriptions, variant structure, image standardisation and upload-ready feed files.",
            keywords: [
                "product listing services",
                "ecommerce catalogue management",
                "product data entry services",
                "google shopping feed optimization",
                "multi channel product listings",
            ],
        },
    },

    /* ----------------------- Creative & Branding ------------------------ */
    {
        slug: "graphic-design",
        title: "Graphic Design",
        group: "creative-branding",
        icon: "Palette",
        tagline:
            "Brand systems, social creative and packaging that stay consistent everywhere.",
        summary:
            "Design strong visuals for your brand, social media, packaging, and marketing materials.",
        intro: [
            "Good design work is mostly a consistency problem. One-off graphics look fine alone and incoherent together, and six months later nobody can remember which blue was the real blue.",
            "We deliver a small, usable system — type scale, colour tokens, grid, logo rules — then produce the assets on top of it. Templates come with the handover, so your team can keep producing without the look drifting.",
        ],
        deliverables: [
            "Logo suite with clear-space and minimum-size rules",
            "Colour palette with hex, RGB, CMYK and accessibility notes",
            "Typography scale and pairing",
            "Social templates for feed, story and ad placements",
            "Packaging, label and print-ready artwork with bleed",
            "Brand guideline PDF and editable source files",
        ],
        idealFor: [
            "New brands needing a first identity",
            "Businesses whose visuals drifted across years of freelancers",
            "Teams producing social content weekly without templates",
        ],
        process: [
            {
                title: "Brief",
                body: "Positioning, audience and the three adjectives the brand must own.",
            },
            {
                title: "Direction",
                body: "Two or three distinct visual routes as mood boards — cheap to reject, cheap to explore.",
            },
            {
                title: "Design",
                body: "The chosen route developed into a full system, with two revision rounds included.",
            },
            {
                title: "Apply",
                body: "The system rolled out across the actual assets you need first.",
            },
            {
                title: "Handover",
                body: "Guidelines, editable files and templates, organised so they can be found later.",
            },
        ],
        faqs: [
            {
                q: "Do I get the source files?",
                a: "Yes. Layered AI, PSD or Figma files plus exported formats are handed over on completion.",
            },
            {
                q: "How many revisions are included?",
                a: "Two full rounds per deliverable. Further rounds are quoted hourly so the scope stays honest for both sides.",
            },
            {
                q: "Can you work with our existing brand?",
                a: "Often that is the better option. We can extend and tidy what exists rather than starting over.",
            },
        ],
        timeline: "1–4 weeks",
        startingAt: "Project or retainer",
        accent: ACCENTS.emerald,
        seo: {
            title: "Graphic Design Services — Brand, Social & Packaging",
            description:
                "Graphic design services: logo and brand systems, social media templates, packaging artwork and print-ready collateral, delivered with editable source files.",
            keywords: [
                "graphic design services",
                "brand identity design",
                "packaging design services",
                "social media design",
                "logo design agency",
            ],
        },
    },
    {
        slug: "product-catalog-design",
        title: "Product Catalog Design",
        group: "creative-branding",
        icon: "BookOpen",
        tagline:
            "Print and digital catalogues that make a big range easy to navigate.",
        summary:
            "Create clean, professional product catalogs that make your full range easy to explore.",
        intro: [
            "A catalogue is a navigation problem wearing a design problem's clothes. Buyers scan for a category, then a size, then a price — and a beautiful layout that hides any of those three costs you the order.",
            "We build a grid and a repeatable page system first, so a 12-page look-book and a 200-page wholesale catalogue both stay readable, and adding twenty SKUs next season does not mean redesigning anything.",
        ],
        deliverables: [
            "Catalogue structure, page flow and section dividers",
            "Master grid and repeatable product-page templates",
            "Cover design and brand-consistent internal pages",
            "Product photography retouching and consistent cropping",
            "Spec tables, SKU codes, pricing tiers and index",
            "Print-ready PDF with bleed plus a lightweight digital version",
        ],
        idealFor: [
            "Wholesale and B2B suppliers with large ranges",
            "Brands attending trade shows",
            "Manufacturers issuing seasonal line sheets",
        ],
        process: [
            {
                title: "Inventory",
                body: "We collect the SKU list, images and specs, and flag what is missing before layout starts.",
            },
            {
                title: "Structure",
                body: "Section order and page count agreed against the printing budget.",
            },
            {
                title: "Template",
                body: "One product-page master that handles your longest and shortest entries.",
            },
            {
                title: "Layout",
                body: "The full catalogue flowed, with images retouched to a consistent standard.",
            },
            {
                title: "Press check",
                body: "Preflight, bleed, colour profile and a proof PDF signed off before print.",
            },
        ],
        faqs: [
            {
                q: "Can you work with our printer's specifications?",
                a: "Yes. Send us the spec sheet and we will supply files in their required colour profile, bleed and format.",
            },
            {
                q: "What if our product photos are inconsistent?",
                a: "We retouch to a common background and crop standard. If some products have no usable photo, we can render or reshoot them.",
            },
            {
                q: "Do you also produce a digital version?",
                a: "Yes — a compressed, hyperlinked PDF suitable for email, and page images for the website if needed.",
            },
        ],
        timeline: "2–6 weeks",
        startingAt: "Per-page pricing",
        accent: ACCENTS.blue,
        seo: {
            title: "Product Catalog Design Services",
            description:
                "Product catalogue design for print and digital: page systems, spec tables, image retouching and press-ready PDFs for wholesale, B2B and seasonal line sheets.",
            keywords: [
                "product catalog design",
                "catalogue design services",
                "b2b catalog design",
                "line sheet design",
                "print catalog designer",
            ],
        },
    },

    /* ----------------------- Animation & Video -------------------------- */
    {
        slug: "3d-animation",
        title: "3D Animation",
        group: "animation-video",
        icon: "Box",
        tagline:
            "Photoreal product CGI and animation, without booking a photo studio.",
        summary:
            "Showcase products with realistic 3D visuals and animations that grab attention.",
        intro: [
            "Once a product exists as a 3D model, every future shot is a render setting rather than a shoot. New colourway, new angle, new background, exploded view for the manual — all of it comes out of the same asset.",
            "We model, texture, light and render products to a standard that holds up next to photography, then animate the moments worth animating: the cap turning, the layers separating, the mechanism working.",
        ],
        deliverables: [
            "Accurate 3D model built from your CAD, dielines or reference photos",
            "PBR materials, labels and finish detail",
            "Studio and lifestyle lighting setups",
            "Still renders at print and web resolution",
            "Animated sequences — turntable, exploded view, feature reveal",
            "Source scene files on request",
        ],
        idealFor: [
            "Products not yet manufactured",
            "Brands with many variants of one shape",
            "Technical products needing cutaways",
        ],
        process: [
            {
                title: "Reference",
                body: "CAD, dielines, samples or photos — the more accurate the input, the fewer revision rounds.",
            },
            {
                title: "Model",
                body: "Geometry built to real dimensions and approved as a grey clay render.",
            },
            {
                title: "Look development",
                body: "Materials, labels and finishes matched to the physical product.",
            },
            {
                title: "Light & animate",
                body: "Shot list locked, camera moves blocked, then previews for approval.",
            },
            {
                title: "Render & deliver",
                body: "Final frames rendered, graded and delivered in the formats each channel needs.",
            },
        ],
        faqs: [
            {
                q: "What do you need from me to start?",
                a: "Ideally a CAD file or dieline plus label artwork. Failing that, a physical sample with measurements and photos from several angles.",
            },
            {
                q: "Is 3D cheaper than photography?",
                a: "Not for a single shot. It becomes cheaper from the second variant onward, and it is the only option for a product that does not exist yet.",
            },
            {
                q: "Can you match an existing photoshoot?",
                a: "Yes. Lighting and camera setups can be matched closely enough that renders sit alongside photography in the same grid.",
            },
        ],
        timeline: "2–6 weeks",
        startingAt: "Per-asset pricing",
        accent: ACCENTS.orange,
        seo: {
            title: "3D Animation & Product CGI Services",
            description:
                "3D product animation and CGI: photoreal modelling, PBR materials, studio lighting, turntables, exploded views and render packs for ecommerce and advertising.",
            keywords: [
                "3d animation services",
                "3d product visualization",
                "product cgi studio",
                "3d product rendering",
                "3d product animation agency",
            ],
        },
    },
    {
        slug: "2d-animation",
        title: "2D Animation",
        group: "animation-video",
        icon: "Film",
        tagline:
            "Explainers and motion graphics that make a complicated offer make sense.",
        summary:
            "Turn your message into engaging animated videos that are easy to understand and remember.",
        intro: [
            "The hard part of an explainer is never the animation. It is the script — deciding what to leave out so the one idea that matters survives ninety seconds.",
            "We write first, storyboard second, and only animate once the narrative is signed off. That order is why our revisions land on frames rather than on the entire concept.",
        ],
        deliverables: [
            "Script written to a target runtime",
            "Storyboard and style frames for approval",
            "Character, icon and illustration design",
            "Full animation with sound design",
            "Professional voiceover in your chosen accent",
            "Exports and subtitles sized for web, YouTube and social",
        ],
        idealFor: [
            "SaaS and service businesses with an abstract offer",
            "Onboarding and training content",
            "Brands needing consistent social motion assets",
        ],
        process: [
            {
                title: "Script",
                body: "One idea, one runtime, written and approved before anything is drawn.",
            },
            {
                title: "Storyboard",
                body: "Frame-by-frame plan with the style locked in style frames.",
            },
            {
                title: "Voiceover",
                body: "Recorded early so animation timing is built to the real read.",
            },
            {
                title: "Animate",
                body: "Full animation with sound design, delivered as a preview cut for notes.",
            },
            {
                title: "Deliver",
                body: "Final masters, aspect-ratio variants and subtitle files.",
            },
        ],
        faqs: [
            {
                q: "How long should an explainer be?",
                a: "Sixty to ninety seconds for a website hero. Anything longer needs a reason, because completion rates fall sharply after that.",
            },
            {
                q: "Do you provide the voiceover?",
                a: "Yes, from a professional roster. You pick the voice from samples before recording.",
            },
            {
                q: "Can you animate in our brand style?",
                a: "Yes. If you have guidelines we work inside them; if not, style frames establish the look before production.",
            },
        ],
        timeline: "3–6 weeks",
        startingAt: "Per-video pricing",
        accent: ACCENTS.indigo,
        seo: {
            title: "2D Animation & Explainer Video Services",
            description:
                "2D animation and explainer videos: scriptwriting, storyboards, character illustration, professional voiceover, sound design and platform-ready exports.",
            keywords: [
                "2d animation services",
                "explainer video production",
                "motion graphics agency",
                "animated explainer video",
                "corporate animation studio",
            ],
        },
    },
    {
        slug: "product-animation",
        title: "Product Animation",
        group: "animation-video",
        icon: "Sparkles",
        tagline:
            "Short, loopable product moments built for the feed and the product page.",
        summary:
            "Bring your product to life with animated visuals that highlight key features and benefits.",
        intro: [
            "A product page video has about two seconds to justify itself. That rules out the slow logo intro and rules in the single clearest demonstration of what the thing does.",
            "We produce tight, loopable animations — the spray, the pour, the click, the fold — cut for silent autoplay with captions, and delivered in every aspect ratio the channels demand.",
        ],
        deliverables: [
            "Shot list built around the product's real selling moment",
            "3D or motion-graphic animation of the key feature",
            "Silent-first edit with on-screen captions",
            "Vertical, square and landscape masters",
            "Looping variants for product pages and ads",
            "Optimised web formats for fast page loads",
        ],
        idealFor: [
            "Product pages with a high bounce rate",
            "Paid social creative testing",
            "Launches needing assets fast, in volume",
        ],
        process: [
            {
                title: "Pick the moment",
                body: "One feature, demonstrated clearly, beats five features listed quickly.",
            },
            {
                title: "Block",
                body: "Rough animatic to agree timing and camera before detail work starts.",
            },
            {
                title: "Produce",
                body: "Animation, materials and lighting brought to final quality.",
            },
            {
                title: "Cut",
                body: "Edited for silent playback with captions, then trimmed to each placement.",
            },
            {
                title: "Deliver",
                body: "All ratios, loops and compressed web versions in one package.",
            },
        ],
        faqs: [
            {
                q: "How short should these be?",
                a: "Six to fifteen seconds for social and product pages. Loops can be shorter still.",
            },
            {
                q: "Do you need a 3D model of my product?",
                a: "Not necessarily. We can build one, or work in motion graphics over existing photography if the budget is tighter.",
            },
            {
                q: "Can you produce several variants at once?",
                a: "Yes, and it is much cheaper per asset. Once the scene is built, new angles and edits are comparatively quick.",
            },
        ],
        timeline: "1–3 weeks",
        startingAt: "Per-asset pricing",
        accent: ACCENTS.emerald,
        seo: {
            title: "Product Animation Services for Ecommerce & Ads",
            description:
                "Short-form product animation for product pages and paid social: feature demonstrations, loops, silent-first edits and every aspect ratio you need.",
            keywords: [
                "product animation services",
                "ecommerce product video",
                "product demo animation",
                "social media product video",
                "looping product animation",
            ],
        },
    },
    {
        slug: "ugc-video",
        title: "UGC Video",
        group: "animation-video",
        icon: "Video",
        tagline:
            "Creator-style video that looks native to the feed and tests like an ad.",
        summary:
            "Create authentic user-generated-style videos that build trust and make products feel real.",
        intro: [
            "UGC works because it does not look bought. The moment it is colour graded like a commercial, the trust advantage disappears and the cost per acquisition goes back up.",
            "We match creators to your audience, script hooks that survive the first two seconds, and deliver enough variations to actually test — because one hero video tells you nothing about what your market responds to.",
        ],
        deliverables: [
            "Creator matching and full briefing",
            "Hook and script variations per concept",
            "Raw footage plus edited masters",
            "Captions, sound and platform-native pacing",
            "Multiple hook cuts from the same body footage",
            "Usage rights agreed and documented upfront",
        ],
        idealFor: [
            "DTC brands scaling paid social",
            "Products that need demonstration to make sense",
            "Teams that keep running out of fresh creative",
        ],
        process: [
            {
                title: "Brief",
                body: "Audience, objections and the claims we can legally make.",
            },
            {
                title: "Cast",
                body: "Creators matched on demographic and delivery style, samples shared for approval.",
            },
            {
                title: "Script hooks",
                body: "Several openings per concept — the hook is the variable worth testing.",
            },
            {
                title: "Shoot",
                body: "Creators film to brief; we review footage before editing begins.",
            },
            {
                title: "Edit & vary",
                body: "Each concept cut into multiple hook variants ready to run against each other.",
            },
        ],
        faqs: [
            {
                q: "Do you provide the creators?",
                a: "Yes. We handle casting, briefing, product shipping coordination and usage rights.",
            },
            {
                q: "How many videos do I need to test properly?",
                a: "Plan on several concepts with a few hook variants each. Testing one video against nothing is not a test.",
            },
            {
                q: "Who owns the footage?",
                a: "You get paid usage rights, with the term and platforms agreed in writing before the shoot.",
            },
        ],
        timeline: "2–4 weeks",
        startingAt: "Per-video pricing",
        accent: ACCENTS.violet,
        seo: {
            title: "UGC Video Production for Paid Social",
            description:
                "User-generated-style video production: creator casting, hook scripting, multiple edit variants and cleared usage rights for Meta, TikTok and YouTube ads.",
            keywords: [
                "ugc video production",
                "ugc creator agency",
                "tiktok ugc ads",
                "user generated content videos",
                "ugc for ecommerce brands",
            ],
        },
    },
];

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */

/** Base path for every service detail page. */
export const SERVICES_BASE_PATH = "/services/our-service";

/** Canonical URL path for one service. */
export function serviceHref(slug: string): string {
    return `${SERVICES_BASE_PATH}/${slug}`;
}

export function getService(slug: string): Service | undefined {
    return SERVICES.find((service) => service.slug === slug);
}

export function getServicesByGroup(group: ServiceGroupSlug): Service[] {
    return SERVICES.filter((service) => service.group === group);
}

export function getGroup(slug: ServiceGroupSlug): ServiceGroup | undefined {
    return SERVICE_GROUPS.find((group) => group.slug === slug);
}

/**
 * The exact shape the header and mobile menu render: one entry per group,
 * each carrying its own services. Building it here rather than in the nav
 * component is what guarantees "every submenu title comes from the service".
 */
export interface ServiceMenuGroup extends ServiceGroup {
    items: { title: string; href: string; summary: string; slug: string }[];
}

export const SERVICE_MENU: ServiceMenuGroup[] = SERVICE_GROUPS.map((group) => ({
    ...group,
    items: getServicesByGroup(group.slug).map((service) => ({
        slug: service.slug,
        title: service.title,
        href: serviceHref(service.slug),
        summary: service.summary,
    })),
}));

/** Every service slug — feeds generateStaticParams. */
export const SERVICE_SLUGS: string[] = SERVICES.map((service) => service.slug);

/**
 * The homepage marquee runs two rows. Splitting here keeps the component
 * dumb, and keeps the split from drifting when a service is added.
 */
export const MARQUEE_TOP_ROW: Service[] = SERVICES.slice(0, 7);
export const MARQUEE_BOTTOM_ROW: Service[] = SERVICES.slice(7);
