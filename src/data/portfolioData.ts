/* ------------------------------------------------------------------
 *  Prodesignity — Portfolio data model
 *
 *  Nine disciplines. Four *content profiles*.
 *
 *  A profile decides the SHAPE of the case study (what the modal shell
 *  looks like); the `kind` decides the DETAIL (which fields exist, which
 *  card renders, which body renders).
 *
 *    player   → one embedded video          (Video Editing)
 *    gallery  → an array of stills          (Packaging, Amazon A+, 3D, Marketing)
 *    live     → a real URL + metrics        (Web Development, Shopify, Web Application)
 *    report   → tables and numbers          (SEO)
 *
 *  Nothing is optional-everything soup: narrow on `kind` and you get
 *  exactly the fields that discipline needs.
 * ------------------------------------------------------------------ */

/* ===================== IMAGE SOURCES — READ ME =====================
 *
 *  Why nothing was rendering before: paths like "/portfolio/video/x.jpg"
 *  only work if that file physically exists in /public. It didn't, so
 *  next/image returned nothing and you got empty boxes.
 *
 *  Two rules to keep images alive:
 *
 *  1. LOCAL files must sit in  public/portfolio/...  and be referenced
 *     WITHOUT the word "public" —  "/portfolio/video/x.jpg".
 *  2. REMOTE files must have their host whitelisted in next.config.
 *
 *  Everything below uses remote demo art so the section renders on a
 *  clean checkout. Swap `demoImage()` for your own paths when the real
 *  assets land — one function, one edit, the whole grid changes.
 *
 *  next.config.ts:
 *
 *    images: {
 *      remotePatterns: [
 *        { protocol: "https", hostname: "picsum.photos" },
 *        { protocol: "https", hostname: "i.ytimg.com" },
 *        { protocol: "https", hostname: "images.unsplash.com" },
 *      ],
 *    },
 * =================================================================== */

/** Deterministic demo art. Same seed always returns the same picture. */
export const demoImage = (seed: string, w = 1200, h = 750) =>
    `https://picsum.photos/seed/${seed}/${w}/${h}`;

/** Real YouTube cover for a real video id. Always resolves. */
export const youtubeThumb = (id: string) =>
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

/* --------------------------- Categories --------------------------- */

export type PortfolioCategory =
    | "Video Editing"
    | "Web Development"
    | "Web Application"
    | "Shopify"
    | "Amazon A+"
    | "SEO"
    | "Marketing"
    | "Packaging"
    | "3D Product Design";

export type ContentProfile = "player" | "gallery" | "live" | "report";

export type VideoFormat = "Full-Form" | "Short-Form";

/** Accent per discipline. Full literal class names — Tailwind must see them. */
export type AccentKey =
    | "red"
    | "blue"
    | "indigo"
    | "emerald"
    | "orange"
    | "violet"
    | "rose"
    | "amber"
    | "cyan";

/* ---------------------------- Base -------------------------------- */

interface BaseWork {
    id: string;
    kind: string;
    category: PortfolioCategory;
    profile: ContentProfile;
    accent: AccentKey;
    title: string;
    subtitle: string;
    /** Small pill on the card, e.g. "Long-Form Edit" */
    badge: string;
    /** Card cover. 16:10 crop looks best. */
    thumbnail: string;
    client: string;
    industry: string;
    year: string;
    description: string;
    tools: string[];
}

/* ================= 1. VIDEO EDITING — profile: player ==============
 * YouTube only. Nothing else lives in this category.
 * ================================================================== */
export interface VideoWork extends BaseWork {
    kind: "video";
    category: "Video Editing";
    profile: "player";
    format: VideoFormat;
    youtubeId: string;
    runtime: string;
    resolution: string;
    channel: string;
    viewCount: string;
    retention: string;
    editingStyle: string[];
    chapters: { time: string; label: string }[];
}

/* =============== 2. WEB DEVELOPMENT — profile: live ================
 * Marketing sites. Judged on speed, not screenshots.
 * ================================================================== */
export interface WebDevWork extends BaseWork {
    kind: "webdev";
    category: "Web Development";
    profile: "live";
    siteUrl: string;
    /** Tall full-page capture — pans on hover on the card. */
    longThumbnail: string;
    lighthouse: {
        performance: number;
        accessibility: number;
        bestPractices: number;
        seo: number;
    };
    pageCount: number;
    loadTime: string;
    deviceShots: { device: "Desktop" | "Tablet" | "Mobile"; src: string }[];
    buildScope: string[];
    stack: string[];
}

/* =============== 3. WEB APPLICATION — profile: live ================
 * Software with users, roles and screens. Not a brochure site.
 * ================================================================== */
export interface WebAppWork extends BaseWork {
    kind: "webapp";
    category: "Web Application";
    profile: "live";
    appUrl: string;
    appType: "Dashboard" | "Portal" | "SaaS" | "Internal Tool" | "Marketplace";
    /** The screens a reviewer actually clicks through. */
    screens: { label: string; src: string; caption: string }[];
    modules: { name: string; detail: string }[];
    roles: string[];
    scale: { label: string; value: string }[];
    stack: string[];
}

/* ==================== 4. SHOPIFY — profile: live ===================
 * A store is measured by what it sells, not how it looks.
 * ================================================================== */
export interface ShopifyWork extends BaseWork {
    kind: "shopify";
    category: "Shopify";
    profile: "live";
    storeUrl: string;
    longThumbnail: string;
    plan: "Shopify" | "Shopify Plus" | "Headless (Hydrogen)";
    theme: string;
    speedScore: number;
    skuCount: string;
    /** Before/after outcomes — the reason anyone hires for this. */
    results: { label: string; value: string; delta: string }[];
    apps: string[];
    buildScope: string[];
}

/* =================== 5. AMAZON A+ — profile: gallery ===============
 * A stack of modules that has to read on a phone in three seconds.
 * ================================================================== */
export interface AmazonWork extends BaseWork {
    kind: "amazon";
    category: "Amazon A+";
    profile: "gallery";
    asin: string;
    marketplace: "Amazon US" | "Amazon UK" | "Amazon DE" | "Amazon AE";
    contentTier: "A+ Basic" | "A+ Premium" | "Brand Story";
    /** Each A+ module, in the order it appears on the listing. */
    modules: {
        type: string;
        src: string;
        headline: string;
        purpose: string;
    }[];
    listingStats: { label: string; value: string; delta: string }[];
    keywords: string[];
    deliverables: string[];
}

/* ======================= 6. SEO — profile: report ==================
 * Almost no imagery. The evidence is the table.
 * ================================================================== */
export interface SeoWork extends BaseWork {
    kind: "seo";
    category: "SEO";
    profile: "report";
    domain: string;
    timeframe: string;
    engagementType: "Technical Audit" | "Content Programme" | "Local SEO";
    /** Monthly organic sessions, oldest → newest. Drives the sparkline. */
    trafficSeries: number[];
    rankings: {
        keyword: string;
        before: number;
        after: number;
        volume: string;
    }[];
    kpis: { label: string; value: string; delta: string }[];
    fixes: { area: string; issue: string; action: string }[];
    deliverables: string[];
}

/* =================== 7. MARKETING — profile: gallery ===============
 * Paid creative. Every asset is a variant that won or lost.
 * ================================================================== */
export interface MarketingWork extends BaseWork {
    kind: "marketing";
    category: "Marketing";
    profile: "gallery";
    channels: ("Meta" | "TikTok" | "Google" | "YouTube" | "Email")[];
    objective: string;
    spend: string;
    /** Ad variants, each with the hook that was tested. */
    creatives: {
        src: string;
        label: string;
        hook: string;
        platform: string;
        result: string;
    }[];
    kpis: { label: string; value: string; delta: string }[];
    funnel: { stage: string; metric: string }[];
}

/* =================== 8. PACKAGING — profile: gallery ===============
 * Artwork that has to survive a print run.
 * ================================================================== */
export interface PackagingWork extends BaseWork {
    kind: "packaging";
    category: "Packaging";
    profile: "gallery";
    artboards: { src: string; label: string; note: string }[];
    dieline?: string;
    palette: { hex: string; name: string }[];
    printSpec: {
        substrate: string;
        finish: string;
        dimensions: string;
        printMethod: string;
    };
    deliverables: string[];
}

/* ============== 9. 3D PRODUCT DESIGN — profile: gallery ============
 * An array of rendered angles the viewer switches between.
 * ================================================================== */
export interface Product3DWork extends BaseWork {
    kind: "product3d";
    category: "3D Product Design";
    profile: "gallery";
    renders: { angle: string; src: string; lighting: string }[];
    /** Optional looping turntable (mp4/webm). */
    turntable?: string;
    engine: string;
    polyCount: string;
    textureMaps: string[];
    renderPasses: { label: string; value: string }[];
    deliverables: string[];
}

export type PortfolioItem =
    | VideoWork
    | WebDevWork
    | WebAppWork
    | ShopifyWork
    | AmazonWork
    | SeoWork
    | MarketingWork
    | PackagingWork
    | Product3DWork;

/* ------------------------ Category config -------------------------- */

export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
    // "Video Editing",
    "Web Development",
    "Shopify",
    "Amazon A+",
    "SEO",
    "3D Product Design",
    "Marketing",
    "Packaging",
    "Web Application",
];

/** Short labels for the filter row on narrow screens. */
export const CATEGORY_SHORT_LABEL: Record<PortfolioCategory, string> = {
    "Video Editing": "Video",
    "Web Development": "Web Dev",
    "Web Application": "Web App",
    Shopify: "Shopify",
    "Amazon A+": "Amazon",
    SEO: "SEO",
    Marketing: "Ads",
    Packaging: "Packaging",
    "3D Product Design": "3D",
};

/** One line under the section heading, per discipline. */
export const CATEGORY_SUBHEAD: Record<PortfolioCategory, string> = {
    "Video Editing": "YouTube edits — long-form and vertical.",
    "Web Development": "Sites judged on load time, not screenshots.",
    "Web Application": "Software with real users, roles and screens.",
    Shopify: "Stores measured by what they sell.",
    "Amazon A+": "Listing content that has to work on a phone.",
    SEO: "Rankings, traffic and the fixes behind them.",
    Marketing: "Paid creative, tested until something wins.",
    Packaging: "Artwork that has to survive a print run.",
    "3D Product Design": "Modelled once, rendered from every angle.",
};

/** Only video splits into Full-Form / Short-Form. */
export function categoryHasFormats(category: PortfolioCategory): boolean {
    return category === "Video Editing";
}

/* ------------------------------ Data ------------------------------ */

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
    /* ═══════════════ VIDEO EDITING — FULL FORM ═══════════════ */
    {
        id: "vid-01",
        kind: "video",
        category: "Video Editing",
        profile: "player",
        accent: "red",
        format: "Full-Form",
        title: "Inside a 12-Person Roastery That Ships 40k Bags a Month",
        subtitle: "Documentary-style brand film for Northbrew Coffee",
        badge: "Long-Form Edit",
        thumbnail: youtubeThumb("dQw4w9WgXcQ"),
        youtubeId: "dQw4w9WgXcQ",
        runtime: "14:22",
        resolution: "4K · 24fps",
        channel: "Northbrew Coffee",
        viewCount: "412K",
        retention: "61% to end",
        client: "Northbrew Coffee",
        industry: "Speciality coffee",
        year: "2025",
        description:
            "A single roastery visit turned into fourteen minutes that still holds attention past the ten-minute mark. We cut around the sound of the roaster rather than a music bed, kept the founder's pauses in, and let the b-roll breathe.",
        editingStyle: [
            "Multicam sync",
            "Ambient-led sound design",
            "Film emulation grade",
            "Motion-tracked lower thirds",
        ],
        chapters: [
            { time: "00:00", label: "Cold open — the 6am roast" },
            { time: "02:14", label: "Founder interview" },
            { time: "06:40", label: "Green bean sourcing" },
            { time: "10:05", label: "Packing floor montage" },
            { time: "12:48", label: "Close + CTA card" },
        ],
        tools: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Audition"],
    },
    {
        id: "vid-02",
        kind: "video",
        category: "Video Editing",
        profile: "player",
        accent: "red",
        format: "Full-Form",
        title: "We Tested 9 Standing Desks for 60 Days",
        subtitle: "Review edit with animated data overlays",
        badge: "Review Edit",
        thumbnail: youtubeThumb("aqz-KE-bpKQ"),
        youtubeId: "aqz-KE-bpKQ",
        runtime: "18:47",
        resolution: "4K · 30fps",
        channel: "Deskbound",
        viewCount: "1.2M",
        retention: "54% to end",
        client: "Deskbound",
        industry: "Home office",
        year: "2025",
        description:
            "Nine products, one edit, no filler. Every claim on screen is backed by a chart built from the client's own test spreadsheet, so viewers can pause on any frame and check the number themselves.",
        editingStyle: [
            "Animated data overlays",
            "Split-screen comparisons",
            "Jump-cut pacing",
            "Chaptered structure",
        ],
        chapters: [
            { time: "00:00", label: "How we tested" },
            { time: "03:30", label: "Budget tier" },
            { time: "08:15", label: "Mid tier" },
            { time: "13:02", label: "Premium tier" },
            { time: "16:40", label: "Final ranking" },
        ],
        tools: ["Premiere Pro", "After Effects", "Illustrator"],
    },
    {
        id: "vid-03",
        kind: "video",
        category: "Video Editing",
        profile: "player",
        accent: "red",
        format: "Full-Form",
        title: "The Warehouse Rebuild — A 3-Part Founder Series",
        subtitle: "Episodic edit for a logistics brand",
        badge: "Series Edit",
        thumbnail: youtubeThumb("ScMzIvxBSi4"),
        youtubeId: "ScMzIvxBSi4",
        runtime: "22:10",
        resolution: "4K · 25fps",
        channel: "Palletworks",
        viewCount: "268K",
        retention: "48% to end",
        client: "Palletworks",
        industry: "Logistics",
        year: "2024",
        description:
            "Eleven hours of handheld footage and no script. We built the narrative in the edit — a cold open pulled from episode three, a recurring motif of the empty loading bay, and a title system that carries across all three parts.",
        editingStyle: [
            "Narrative restructure",
            "Recurring motif system",
            "Custom title package",
            "Dialogue cleanup",
        ],
        chapters: [
            { time: "00:00", label: "Recap" },
            { time: "01:35", label: "Racking install" },
            { time: "09:20", label: "First shipment" },
            { time: "17:55", label: "What went wrong" },
        ],
        tools: ["DaVinci Resolve", "After Effects", "Audition"],
    },

    /* ═══════════════ VIDEO EDITING — SHORT FORM ══════════════ */
    {
        id: "vid-04",
        kind: "video",
        category: "Video Editing",
        profile: "player",
        accent: "red",
        format: "Short-Form",
        title: "One Bag. Seven Days. No Laundry.",
        subtitle: "Vertical hook edit that ran as a Short and an ad",
        badge: "Vertical Short",
        thumbnail: youtubeThumb("jNQXAC9IVRw"),
        youtubeId: "jNQXAC9IVRw",
        runtime: "0:48",
        resolution: "1080×1920 · 30fps",
        channel: "Carryform",
        viewCount: "3.4M",
        retention: "78% past 3s",
        client: "Carryform",
        industry: "Travel gear",
        year: "2025",
        description:
            "The whole edit is built around the first 1.5 seconds. We cut four hook variants from the same footage, ran them against each other, and the winner held 78% through the three-second mark.",
        editingStyle: [
            "Hook A/B variants",
            "Beat-matched cuts",
            "Burned-in captions",
            "Safe-zone framing",
        ],
        chapters: [
            { time: "0:00", label: "Hook — the packed bag" },
            { time: "0:09", label: "Rapid item run" },
            { time: "0:38", label: "Payoff + CTA" },
        ],
        tools: ["Premiere Pro", "After Effects"],
    },
    {
        id: "vid-05",
        kind: "video",
        category: "Video Editing",
        profile: "player",
        accent: "red",
        format: "Short-Form",
        title: "Why Your Serum Bottle Feels Cheap",
        subtitle: "Talking-head Short with kinetic type",
        badge: "Kinetic Type",
        thumbnail: youtubeThumb("9bZkp7q19f0"),
        youtubeId: "9bZkp7q19f0",
        runtime: "0:59",
        resolution: "1080×1920 · 60fps",
        channel: "Lumea Skin",
        viewCount: "890K",
        retention: "64% past 3s",
        client: "Lumea Skin",
        industry: "Skincare",
        year: "2025",
        description:
            "A single unbroken take, made watchable by typography. Every claim lands as a word that snaps into frame on the stressed syllable — animated to the waveform, not to a grid.",
        editingStyle: [
            "Waveform-timed typography",
            "Punch-in rhythm",
            "Product macro inserts",
            "Loop-friendly ending",
        ],
        chapters: [
            { time: "0:00", label: "The claim" },
            { time: "0:16", label: "Why it happens" },
            { time: "0:44", label: "The fix" },
        ],
        tools: ["After Effects", "Premiere Pro"],
    },
    {
        id: "vid-06",
        kind: "video",
        category: "Video Editing",
        profile: "player",
        accent: "red",
        format: "Short-Form",
        title: "This Pallet Label Saved 40 Minutes a Shift",
        subtitle: "B2B Short — unusual subject, ordinary hook rules",
        badge: "B2B Short",
        thumbnail: youtubeThumb("kJQP7kiw5Fk"),
        youtubeId: "kJQP7kiw5Fk",
        runtime: "0:41",
        resolution: "1080×1920 · 30fps",
        channel: "Palletworks",
        viewCount: "512K",
        retention: "71% past 3s",
        client: "Palletworks",
        industry: "Logistics",
        year: "2025",
        description:
            "Warehouse labelling is not an obvious Shorts topic. It worked because the hook is a stopwatch, not a product — the viewer wants to know if the claim is true before they know what's being sold.",
        editingStyle: [
            "Stopwatch cold open",
            "On-screen timer",
            "Single-location shoot",
            "Caption-first framing",
        ],
        chapters: [
            { time: "0:00", label: "The stopwatch starts" },
            { time: "0:12", label: "Old label vs new" },
            { time: "0:33", label: "Result on screen" },
        ],
        tools: ["Premiere Pro", "After Effects"],
    },

    /* ═══════════════════ WEB DEVELOPMENT ═════════════════════ */
    {
        id: "web-01",
        kind: "webdev",
        category: "Web Development",
        profile: "live",
        accent: "blue",
        title: "Northbrew — Marketing Site Rebuild",
        subtitle: "Nine pages, one second, zero layout shift",
        badge: "Next.js Build",
        thumbnail: demoImage("prodesignity-webdev-northbrew"),
        longThumbnail: demoImage(
            "prodesignity-webdev-northbrew-full",
            900,
            2600,
        ),
        siteUrl: "https://northbrew.example.com",
        lighthouse: {
            performance: 99,
            accessibility: 100,
            bestPractices: 100,
            seo: 100,
        },
        pageCount: 9,
        loadTime: "0.9s LCP",
        client: "Northbrew Coffee",
        industry: "Speciality coffee",
        year: "2025",
        description:
            "The old WordPress site carried four page builders and 2.4MB of unused CSS. We rebuilt it in Next.js with the same content and the same photography — the only thing that changed is that it now loads before the visitor decides to leave.",
        deviceShots: [
            { device: "Desktop", src: demoImage("nb-web-desktop", 1600, 1000) },
            { device: "Tablet", src: demoImage("nb-web-tablet", 1200, 1600) },
            { device: "Mobile", src: demoImage("nb-web-mobile", 800, 1600) },
        ],
        buildScope: [
            "Content migration from WordPress",
            "Static generation with ISR",
            "Accessible nav and focus order",
            "Structured data for products",
        ],
        stack: ["Next.js", "TypeScript", "Tailwind CSS", "Sanity", "Vercel"],
        tools: ["VS Code", "Figma", "Lighthouse", "GitHub"],
    },
    {
        id: "web-02",
        kind: "webdev",
        category: "Web Development",
        profile: "live",
        accent: "blue",
        title: "Palletworks — Corporate Site & Quote Flow",
        subtitle: "A quote request that takes 40 seconds, not a phone call",
        badge: "Lead Gen Site",
        thumbnail: demoImage("prodesignity-webdev-pallet"),
        longThumbnail: demoImage("prodesignity-webdev-pallet-full", 900, 2600),
        siteUrl: "https://palletworks.example.com",
        lighthouse: {
            performance: 97,
            accessibility: 98,
            bestPractices: 100,
            seo: 100,
        },
        pageCount: 14,
        loadTime: "1.1s LCP",
        client: "Palletworks",
        industry: "Logistics",
        year: "2025",
        description:
            "Every enquiry used to arrive as a blank email that needed three follow-ups before anyone could price it. The new multi-step form asks the four questions the sales team always asked anyway, and routes by region.",
        deviceShots: [
            { device: "Desktop", src: demoImage("pw-web-desktop", 1600, 1000) },
            { device: "Mobile", src: demoImage("pw-web-mobile", 800, 1600) },
            { device: "Tablet", src: demoImage("pw-web-tablet", 1200, 1600) },
        ],
        buildScope: [
            "Four-step quote form",
            "Region-based lead routing",
            "Case study CMS",
            "Bilingual EN/DE routing",
        ],
        stack: ["Next.js", "TypeScript", "Tailwind CSS", "Resend", "Vercel"],
        tools: ["VS Code", "Figma", "Postman", "Lighthouse"],
    },
    {
        id: "web-03",
        kind: "webdev",
        category: "Web Development",
        profile: "live",
        accent: "blue",
        title: "Lumea — Editorial Landing System",
        subtitle: "One template, twenty campaign landers, no dev time",
        badge: "Landing System",
        thumbnail: demoImage("prodesignity-webdev-lumea"),
        longThumbnail: demoImage("prodesignity-webdev-lumea-full", 900, 2600),
        siteUrl: "https://lumea.example.com/launch",
        lighthouse: {
            performance: 98,
            accessibility: 100,
            bestPractices: 96,
            seo: 100,
        },
        pageCount: 22,
        loadTime: "1.0s LCP",
        client: "Lumea Skin",
        industry: "Skincare",
        year: "2024",
        description:
            "The marketing team needed a new lander for every campaign and kept waiting on us. We shipped a block-based template instead — they now build and publish their own, and we only get involved when a genuinely new block is needed.",
        deviceShots: [
            { device: "Desktop", src: demoImage("lu-web-desktop", 1600, 1000) },
            { device: "Mobile", src: demoImage("lu-web-mobile", 800, 1600) },
            { device: "Tablet", src: demoImage("lu-web-tablet", 1200, 1600) },
        ],
        buildScope: [
            "12 reusable content blocks",
            "Live preview in the CMS",
            "A/B variant routing",
            "Consent-safe analytics",
        ],
        stack: ["Next.js", "Tailwind CSS", "Sanity", "PostHog", "Vercel"],
        tools: ["VS Code", "Figma", "PostHog", "GitHub"],
    },

    /* ═══════════════════════ SHOPIFY ═════════════════════════ */
    {
        id: "shop-01",
        kind: "shopify",
        category: "Shopify",
        profile: "live",
        accent: "emerald",
        title: "Northbrew — Subscription-First Store",
        subtitle: "Rebuilt around the recurring order, not the one-off bag",
        badge: "Shopify Plus",
        thumbnail: demoImage("prodesignity-shopify-northbrew"),
        longThumbnail: demoImage("prodesignity-shopify-nb-full", 900, 2800),
        storeUrl: "https://northbrew.example.com/shop",
        plan: "Shopify Plus",
        theme: "Custom (Dawn fork)",
        speedScore: 96,
        skuCount: "38 SKUs",
        client: "Northbrew Coffee",
        industry: "Speciality coffee",
        year: "2025",
        description:
            "The old store treated the subscription as an upsell at checkout. We made it the default path: grind and frequency get chosen on the product page, and the cart carries that choice through without a second decision.",
        results: [
            { label: "Subscription share", value: "44%", delta: "+19pts" },
            { label: "Mobile LCP", value: "1.3s", delta: "−2.4s" },
            { label: "Checkout completion", value: "71%", delta: "+12pts" },
            { label: "Support tickets", value: "−38%", delta: "post-launch" },
        ],
        apps: ["Recharge", "Klaviyo", "Judge.me", "Shopify Flow"],
        buildScope: [
            "Custom subscription picker",
            "Grind selector on the product page",
            "Rebuilt cart drawer",
            "Roast-date freshness badge",
        ],
        tools: ["Shopify CLI", "Liquid", "Figma", "Lighthouse"],
    },
    {
        id: "shop-02",
        kind: "shopify",
        category: "Shopify",
        profile: "live",
        accent: "emerald",
        title: "Carryform — Variant-Heavy Storefront",
        subtitle: "Eleven colourways, four sizes, one instant swap",
        badge: "Headless",
        thumbnail: demoImage("prodesignity-shopify-carryform"),
        longThumbnail: demoImage("prodesignity-shopify-cf-full", 900, 2800),
        storeUrl: "https://carryform.example.com",
        plan: "Headless (Hydrogen)",
        theme: "Hydrogen storefront",
        speedScore: 99,
        skuCount: "44 variants",
        client: "Carryform",
        industry: "Travel gear",
        year: "2025",
        description:
            "Forty-four variant images meant a product page that took eight seconds to settle. We moved the storefront to Hydrogen, preloaded the adjacent colourways, and cut the variant switch to an instant swap with no layout shift.",
        results: [
            { label: "Lighthouse", value: "99", delta: "+41" },
            { label: "Layout shift", value: "0.01", delta: "−0.24" },
            { label: "Add-to-cart rate", value: "9.8%", delta: "+3.1pts" },
            { label: "Cutover downtime", value: "0 min", delta: "live swap" },
        ],
        apps: ["Algolia", "Klaviyo", "Gorgias", "Shop Pay"],
        buildScope: [
            "Hydrogen storefront",
            "Variant image preloading",
            "Predictive search",
            "Zero-downtime migration",
        ],
        tools: ["Shopify CLI", "Hydrogen", "Figma", "Lighthouse"],
    },
    {
        id: "shop-03",
        kind: "shopify",
        category: "Shopify",
        profile: "live",
        accent: "emerald",
        title: "Lumea — CRO Teardown & Rebuild",
        subtitle: "Same traffic, same products, rewritten funnel",
        badge: "CRO Sprint",
        thumbnail: demoImage("prodesignity-shopify-lumea"),
        longThumbnail: demoImage("prodesignity-shopify-lu-full", 900, 2800),
        storeUrl: "https://lumea.example.com",
        plan: "Shopify",
        theme: "Impulse (heavily modified)",
        speedScore: 94,
        skuCount: "19 SKUs",
        client: "Lumea Skin",
        industry: "Skincare",
        year: "2024",
        description:
            "No redesign, no new photography. We ran six weeks of tests on the three pages carrying 80% of revenue, and shipped only what won. Four of nine tests lost, which is the point of running them.",
        results: [
            { label: "Conversion rate", value: "3.9%", delta: "+1.4pts" },
            { label: "Average order", value: "$78", delta: "+$14" },
            { label: "Cart abandonment", value: "62%", delta: "−11pts" },
            { label: "Tests shipped", value: "5 of 9", delta: "6 weeks" },
        ],
        apps: ["Intelligems", "Klaviyo", "Loox", "Rebuy"],
        buildScope: [
            "Trust-signal block on the product page",
            "Sticky add-to-cart on mobile",
            "Bundle upsell in the cart",
            "One-page checkout test",
        ],
        tools: ["Figma", "Hotjar", "GA4", "Shopify CLI"],
    },

    /* ═════════════════════ AMAZON A+ ═════════════════════════ */
    {
        id: "amz-01",
        kind: "amazon",
        category: "Amazon A+",
        profile: "gallery",
        accent: "orange",
        title: "Lumea Vitamin C Serum — A+ Premium",
        subtitle: "Seven modules that answer the seven review complaints",
        badge: "A+ Premium",
        thumbnail: demoImage("prodesignity-amazon-lumea"),
        asin: "B0C7XKQ2LM",
        marketplace: "Amazon US",
        contentTier: "A+ Premium",
        client: "Lumea Skin",
        industry: "Skincare",
        year: "2025",
        description:
            "We read 640 reviews before designing anything. The seven modules answer, in order, the seven objections that came up most — so a shopper scrolling on a phone gets their question handled before they reach the review section.",
        modules: [
            {
                type: "Full-width hero",
                src: demoImage("amz-lumea-hero", 1464, 600),
                headline: "What it actually does",
                purpose: "Sets the claim in one line, no jargon",
            },
            {
                type: "Comparison table",
                src: demoImage("amz-lumea-compare", 1464, 600),
                headline: "Against the other three in the range",
                purpose: "Keeps cross-shoppers inside the brand",
            },
            {
                type: "Four-image text",
                src: demoImage("amz-lumea-how", 1464, 600),
                headline: "How to use it, morning and night",
                purpose: "Kills the top misuse complaint",
            },
            {
                type: "Ingredient callout",
                src: demoImage("amz-lumea-ingredients", 1464, 600),
                headline: "The full INCI, readable",
                purpose: "Pre-empts the allergy questions",
            },
            {
                type: "Brand story",
                src: demoImage("amz-lumea-brand", 1464, 600),
                headline: "Who makes it and where",
                purpose: "Trust module for first-time buyers",
            },
        ],
        listingStats: [
            { label: "Conversion", value: "18.4%", delta: "+5.2pts" },
            { label: "Return rate", value: "3.1%", delta: "−4.4pts" },
            { label: "Sessions", value: "94K/mo", delta: "+22%" },
            { label: "Review score", value: "4.6", delta: "+0.4" },
        ],
        keywords: [
            "vitamin c serum",
            "brightening serum",
            "vitamin c face serum for dark spots",
            "fragrance free serum",
        ],
        deliverables: [
            "7 A+ modules, US sizing",
            "Mobile-first crop for each",
            "Alt text for all imagery",
            "Editable source files",
        ],
        tools: ["Photoshop", "Illustrator", "Figma", "Helium 10"],
    },
    {
        id: "amz-02",
        kind: "amazon",
        category: "Amazon A+",
        profile: "gallery",
        accent: "orange",
        title: "Carryform 32L — Listing & Brand Story",
        subtitle: "A bag that had to explain its own capacity",
        badge: "Brand Story",
        thumbnail: demoImage("prodesignity-amazon-carryform"),
        asin: "B0D3MTQ9RS",
        marketplace: "Amazon UK",
        contentTier: "Brand Story",
        client: "Carryform",
        industry: "Travel gear",
        year: "2025",
        description:
            "Everyone asked the same question in the Q&A: does it fit as carry-on. So the first module is a dimensioned diagram against a standard sizer, not a lifestyle shot.",
        modules: [
            {
                type: "Dimension diagram",
                src: demoImage("amz-cf-dims", 1464, 600),
                headline: "Against a standard carry-on sizer",
                purpose: "Answers the top Q&A question first",
            },
            {
                type: "Packed-state gallery",
                src: demoImage("amz-cf-packed", 1464, 600),
                headline: "Seven days of clothing, packed",
                purpose: "Makes capacity concrete",
            },
            {
                type: "Material detail",
                src: demoImage("amz-cf-material", 1464, 600),
                headline: "900D recycled shell, YKK zips",
                purpose: "Justifies the price gap",
            },
            {
                type: "Brand story banner",
                src: demoImage("amz-cf-brand", 1464, 600),
                headline: "Two people, one workshop",
                purpose: "Cross-sells the rest of the range",
            },
        ],
        listingStats: [
            { label: "Conversion", value: "14.8%", delta: "+3.9pts" },
            { label: "Q&A volume", value: "−52%", delta: "post-launch" },
            { label: "Sessions", value: "41K/mo", delta: "+16%" },
            { label: "Buy Box share", value: "97%", delta: "steady" },
        ],
        keywords: [
            "carry on backpack",
            "32l travel backpack",
            "cabin bag backpack",
            "recycled travel backpack",
        ],
        deliverables: [
            "4 A+ modules, UK sizing",
            "Brand Story carousel",
            "Dimension diagram source",
            "Main-image compliance check",
        ],
        tools: ["Photoshop", "Illustrator", "Blender", "Helium 10"],
    },
    {
        id: "amz-03",
        kind: "amazon",
        category: "Amazon A+",
        profile: "gallery",
        accent: "orange",
        title: "Northbrew Sampler — Variation Family",
        subtitle: "Six origins on one listing without confusing anyone",
        badge: "A+ Basic",
        thumbnail: demoImage("prodesignity-amazon-northbrew"),
        asin: "B0F1KPQ8TZ",
        marketplace: "Amazon US",
        contentTier: "A+ Basic",
        client: "Northbrew Coffee",
        industry: "Speciality coffee",
        year: "2024",
        description:
            "Six origins under one parent ASIN meant shoppers landing on a random child and bouncing. The A+ content now works as a chooser: roast level on a scale, tasting notes as icons, and a clear route to the sampler.",
        modules: [
            {
                type: "Roast scale",
                src: demoImage("amz-nb-roast", 1464, 600),
                headline: "Light to dark, all six placed",
                purpose: "Orients whoever lands on a child ASIN",
            },
            {
                type: "Tasting note grid",
                src: demoImage("amz-nb-notes", 1464, 600),
                headline: "Icons, not adjectives",
                purpose: "Scannable on a phone in two seconds",
            },
            {
                type: "Sampler cross-sell",
                src: demoImage("amz-nb-sampler", 1464, 600),
                headline: "Try all six for the price of two",
                purpose: "Moves undecided shoppers to the bundle",
            },
        ],
        listingStats: [
            { label: "Conversion", value: "11.2%", delta: "+2.6pts" },
            { label: "Sampler share", value: "31%", delta: "+31pts" },
            { label: "Sessions", value: "58K/mo", delta: "+9%" },
            { label: "Bounce", value: "−18%", delta: "child ASINs" },
        ],
        keywords: [
            "coffee sampler pack",
            "single origin coffee beans",
            "whole bean coffee gift",
            "light roast coffee",
        ],
        deliverables: [
            "3 A+ modules",
            "Variation family imagery",
            "Roast-scale illustration set",
            "Copy for all six children",
        ],
        tools: ["Photoshop", "Illustrator", "Figma"],
    },

    /* ═══════════════════════════ SEO ═════════════════════════ */
    {
        id: "seo-01",
        kind: "seo",
        category: "SEO",
        profile: "report",
        accent: "violet",
        title: "Lumea — Technical Audit & Recovery",
        subtitle:
            "A migration lost 60% of organic traffic. Ten weeks to get it back.",
        badge: "Technical Audit",
        thumbnail: demoImage("prodesignity-seo-lumea"),
        domain: "lumea.example.com",
        timeframe: "Feb – Nov 2025",
        engagementType: "Technical Audit",
        client: "Lumea Skin",
        industry: "Skincare",
        year: "2025",
        description:
            "A platform migration shipped without redirects and took 4,100 URLs offline in a weekend. We mapped the old sitemap against the new one, restored what mattered, and killed the 2,800 thin variant pages that should never have been indexed.",
        trafficSeries: [
            48000, 19000, 21000, 27000, 34000, 41000, 52000, 61000, 68000,
            74000,
        ],
        rankings: [
            {
                keyword: "vitamin c serum uk",
                before: 41,
                after: 3,
                volume: "22K/mo",
            },
            {
                keyword: "best serum for dark spots",
                before: 68,
                after: 7,
                volume: "14K/mo",
            },
            {
                keyword: "fragrance free moisturiser",
                before: 24,
                after: 4,
                volume: "9.6K/mo",
            },
            {
                keyword: "niacinamide vs vitamin c",
                before: 91,
                after: 2,
                volume: "8.1K/mo",
            },
        ],
        kpis: [
            { label: "Organic sessions", value: "74K/mo", delta: "+54%" },
            { label: "Indexed pages", value: "1,340", delta: "−2,800 thin" },
            { label: "Core Web Vitals", value: "Pass", delta: "all URLs" },
            { label: "Organic revenue", value: "$212K", delta: "+$88K" },
        ],
        fixes: [
            {
                area: "Redirects",
                issue: "4,100 URLs returning 404 after migration",
                action: "Mapped and restored 1:1 where intent matched",
            },
            {
                area: "Index bloat",
                issue: "2,800 near-duplicate variant pages indexed",
                action: "Canonicalised to parent, removed from sitemap",
            },
            {
                area: "Speed",
                issue: "LCP over 4s on all product pages",
                action: "Image pipeline rebuilt, fonts self-hosted",
            },
            {
                area: "Schema",
                issue: "No product or review markup",
                action: "Product, Review and FAQ schema added sitewide",
            },
        ],
        deliverables: [
            "Full technical audit (86 findings)",
            "Redirect map, 4,100 rows",
            "Prioritised fix backlog",
            "Monthly rank and traffic reporting",
        ],
        tools: ["Screaming Frog", "Ahrefs", "GSC", "Looker Studio"],
    },
    {
        id: "seo-02",
        kind: "seo",
        category: "SEO",
        profile: "report",
        accent: "violet",
        title: "Northbrew — Content Programme",
        subtitle: "Forty guides, written for people who already own a grinder",
        badge: "Content Programme",
        thumbnail: demoImage("prodesignity-seo-northbrew"),
        domain: "northbrew.example.com",
        timeframe: "Jan – Dec 2025",
        engagementType: "Content Programme",
        client: "Northbrew Coffee",
        industry: "Speciality coffee",
        year: "2025",
        description:
            "The blog was chasing 'best coffee maker' and losing to publishers with fifty times the authority. We moved down the funnel to brew-method and origin questions their own customer service inbox was already answering.",
        trafficSeries: [
            6200, 7100, 9400, 12800, 17200, 23000, 29500, 36000, 41000, 47500,
        ],
        rankings: [
            {
                keyword: "v60 ratio calculator",
                before: 0,
                after: 1,
                volume: "12K/mo",
            },
            {
                keyword: "how long do coffee beans stay fresh",
                before: 34,
                after: 2,
                volume: "8.9K/mo",
            },
            {
                keyword: "ethiopian coffee tasting notes",
                before: 0,
                after: 5,
                volume: "4.4K/mo",
            },
            {
                keyword: "grind size chart",
                before: 47,
                after: 3,
                volume: "18K/mo",
            },
        ],
        kpis: [
            { label: "Organic sessions", value: "47.5K/mo", delta: "+666%" },
            { label: "Ranking keywords", value: "3,120", delta: "+2,740" },
            { label: "Email signups", value: "1,180/mo", delta: "from blog" },
            { label: "Assisted revenue", value: "$96K", delta: "12 months" },
        ],
        fixes: [
            {
                area: "Targeting",
                issue: "Competing for head terms with no authority",
                action: "Rebuilt the map around long-tail brew questions",
            },
            {
                area: "Format",
                issue: "Text-only guides on visual topics",
                action: "Added interactive calculators and grind charts",
            },
            {
                area: "Internal links",
                issue: "Blog isolated from product pages",
                action: "Contextual links from every guide to a matching SKU",
            },
        ],
        deliverables: [
            "40 published guides",
            "Two interactive calculators",
            "Internal link architecture",
            "Quarterly content refresh cycle",
        ],
        tools: ["Ahrefs", "GSC", "Surfer", "Looker Studio"],
    },
    {
        id: "seo-03",
        kind: "seo",
        category: "SEO",
        profile: "report",
        accent: "violet",
        title: "Palletworks — Local & B2B Search",
        subtitle: "Eleven depots, eleven pages that actually rank",
        badge: "Local SEO",
        thumbnail: demoImage("prodesignity-seo-palletworks"),
        domain: "palletworks.example.com",
        timeframe: "Mar – Oct 2025",
        engagementType: "Local SEO",
        client: "Palletworks",
        industry: "Logistics",
        year: "2025",
        description:
            "Eleven depot pages that differed only by the town name were being folded together by Google. We rewrote each around what that depot actually does — the Rotterdam one handles cold chain, the Leeds one does not — and the folding stopped.",
        trafficSeries: [
            3100, 3400, 4200, 5800, 7900, 10400, 13200, 15800, 18100, 20600,
        ],
        rankings: [
            {
                keyword: "pallet delivery leeds",
                before: 18,
                after: 1,
                volume: "3.2K/mo",
            },
            {
                keyword: "cold chain pallet storage",
                before: 55,
                after: 4,
                volume: "1.9K/mo",
            },
            {
                keyword: "next day pallet courier",
                before: 29,
                after: 6,
                volume: "6.7K/mo",
            },
            {
                keyword: "pallet storage near me",
                before: 22,
                after: 2,
                volume: "5.1K/mo",
            },
        ],
        kpis: [
            { label: "Organic sessions", value: "20.6K/mo", delta: "+564%" },
            { label: "Quote requests", value: "310/mo", delta: "+218" },
            { label: "Map pack", value: "9 of 11", delta: "depots ranking" },
            { label: "Cost per lead", value: "£4.20", delta: "vs £31 paid" },
        ],
        fixes: [
            {
                area: "Duplication",
                issue: "Eleven near-identical depot pages",
                action: "Rewritten around each depot's real capability",
            },
            {
                area: "Local profiles",
                issue: "Inconsistent hours and categories",
                action: "All eleven profiles corrected and photographed",
            },
            {
                area: "Reviews",
                issue: "No review flow for B2B customers",
                action: "Post-delivery review request built into dispatch",
            },
        ],
        deliverables: [
            "11 rewritten depot pages",
            "Local profile management",
            "Review generation flow",
            "Monthly map-pack reporting",
        ],
        tools: ["Ahrefs", "GSC", "BrightLocal", "Looker Studio"],
    },

    /* ═════════════════ 3D PRODUCT DESIGN ═════════════════════ */
    {
        id: "3d-01",
        kind: "product3d",
        category: "3D Product Design",
        profile: "gallery",
        accent: "cyan",
        title: "Amber Glass Dropper — Full Angle Set",
        subtitle: "Studio product renders for a skincare launch",
        badge: "Product Render",
        thumbnail: demoImage("prodesignity-3d-dropper"),
        client: "Lumea Skin",
        industry: "Skincare",
        year: "2025",
        description:
            "Photography was quoted at six weeks and one fixed set of angles. We modelled the bottle from the manufacturer's CAD instead, so the client could request a new angle on a Tuesday and have it Wednesday — including three that never existed as a physical sample.",
        renders: [
            {
                angle: "Front",
                src: demoImage("3d-dropper-front", 1600, 900),
                lighting: "Softbox key, 45° fill",
            },
            {
                angle: "Three-Quarter",
                src: demoImage("3d-dropper-tq", 1600, 900),
                lighting: "Rim light, dark gradient",
            },
            {
                angle: "Top-Down",
                src: demoImage("3d-dropper-top", 1600, 900),
                lighting: "Flat overhead, no shadow",
            },
            {
                angle: "Macro Cap",
                src: demoImage("3d-dropper-macro", 1600, 900),
                lighting: "Grazing light for knurl detail",
            },
            {
                angle: "Exploded",
                src: demoImage("3d-dropper-exploded", 1600, 900),
                lighting: "Even studio wrap",
            },
        ],
        engine: "Blender · Cycles",
        polyCount: "486K tris",
        textureMaps: ["Base Color", "Roughness", "Normal", "Transmission"],
        renderPasses: [
            { label: "Resolution", value: "6000 × 6000 px" },
            { label: "Samples", value: "2048 + OIDN denoise" },
            { label: "Render time", value: "9 min / frame" },
            { label: "Output", value: "PNG + alpha, ACES" },
        ],
        deliverables: [
            "5 hero angles, print resolution",
            "Transparent PNG set for the store",
            "Exploded diagram for the manual",
            "Source .blend with named collections",
        ],
        tools: ["Blender", "Substance Painter", "Photoshop"],
    },
    {
        id: "3d-02",
        kind: "product3d",
        category: "3D Product Design",
        profile: "gallery",
        accent: "cyan",
        title: "Aluminium Travel Mug — Colourway Array",
        subtitle: "One model, eleven finishes, zero reshoots",
        badge: "Colour Variants",
        thumbnail: demoImage("prodesignity-3d-mug"),
        client: "Carryform",
        industry: "Travel gear",
        year: "2025",
        description:
            "The catalogue needed eleven colourways before the factory had produced more than two. We built one shader with a swappable base colour and rendered the array overnight — product page images shipped before the samples cleared customs.",
        renders: [
            {
                angle: "Hero",
                src: demoImage("3d-mug-hero", 1600, 900),
                lighting: "Two-light studio, seamless white",
            },
            {
                angle: "Lid Detail",
                src: demoImage("3d-mug-lid", 1600, 900),
                lighting: "Tight key, black background",
            },
            {
                angle: "In Hand",
                src: demoImage("3d-mug-hand", 1600, 900),
                lighting: "Window light, soft shadow",
            },
            {
                angle: "Cross-Section",
                src: demoImage("3d-mug-section", 1600, 900),
                lighting: "Technical flat, labelled",
            },
        ],
        engine: "Blender · Cycles",
        polyCount: "212K tris",
        textureMaps: ["Base Color", "Metallic", "Roughness", "Anisotropy"],
        renderPasses: [
            { label: "Resolution", value: "4000 × 4000 px" },
            { label: "Variants", value: "11 colourways" },
            { label: "Render time", value: "4 min / frame" },
            { label: "Output", value: "WebP + PNG master" },
        ],
        deliverables: [
            "44 images (11 colours × 4 angles)",
            "Web-optimised WebP set",
            "Colour swatch reference sheet",
            "Shader file for future colours",
        ],
        tools: ["Blender", "Substance Painter", "Affinity Photo"],
    },
    {
        id: "3d-03",
        kind: "product3d",
        category: "3D Product Design",
        profile: "gallery",
        accent: "cyan",
        title: "Retail Endcap — Environment Build",
        subtitle: "Photoreal shelf mockup for a buyer pitch",
        badge: "Scene Build",
        thumbnail: demoImage("prodesignity-3d-endcap"),
        client: "Northbrew Coffee",
        industry: "Speciality coffee",
        year: "2024",
        description:
            "A retail buyer wanted to see the range on shelf before committing to a print run. We built the endcap, the shelf edge, the store lighting and the scuffed floor — then rendered it from the exact eye height a shopper would stand at.",
        renders: [
            {
                angle: "Shopper Eye-Level",
                src: demoImage("3d-endcap-eye", 1600, 900),
                lighting: "Store fluorescents, cool white",
            },
            {
                angle: "Aisle Wide",
                src: demoImage("3d-endcap-wide", 1600, 900),
                lighting: "Ambient occlusion heavy",
            },
            {
                angle: "Shelf Close",
                src: demoImage("3d-endcap-shelf", 1600, 900),
                lighting: "Spot key on facings",
            },
        ],
        engine: "Blender · Cycles",
        polyCount: "3.1M tris",
        textureMaps: [
            "Base Color",
            "Roughness",
            "Normal",
            "AO",
            "Displacement",
        ],
        renderPasses: [
            { label: "Resolution", value: "5120 × 2880 px" },
            { label: "Samples", value: "3000 + denoise" },
            { label: "Render time", value: "31 min / frame" },
            { label: "Output", value: "EXR multi-pass" },
        ],
        deliverables: [
            "3 pitch renders, print resolution",
            "Planogram-accurate shelf layout",
            "Alternate facing arrangement",
            "Scene file for future SKUs",
        ],
        tools: ["Blender", "Substance Painter", "Photoshop", "Fusion"],
    },

    /* ═══════════════════════ MARKETING ═══════════════════════ */
    {
        id: "mkt-01",
        kind: "marketing",
        category: "Marketing",
        profile: "gallery",
        accent: "rose",
        title: "Lumea — Winter Acquisition Sprint",
        subtitle: "Nine creatives, three survived, one paid for the quarter",
        badge: "Paid Social",
        thumbnail: demoImage("prodesignity-mkt-lumea"),
        channels: ["Meta", "TikTok"],
        objective: "New customer acquisition",
        spend: "$46K over 9 weeks",
        client: "Lumea Skin",
        industry: "Skincare",
        year: "2025",
        description:
            "We shipped nine creatives against one audience and let them run until the data said something. The winner was the least polished of the batch — a phone-shot bathroom clip with a caption that named the problem in the first frame.",
        creatives: [
            {
                src: demoImage("mkt-lumea-c1", 900, 1600),
                label: "Bathroom UGC",
                hook: "Nobody tells you serum stings if you layer it wrong",
                platform: "TikTok",
                result: "ROAS 4.8 — winner",
            },
            {
                src: demoImage("mkt-lumea-c2", 900, 1600),
                label: "Before / after",
                hook: "Eight weeks, same lighting, no filter",
                platform: "Meta",
                result: "ROAS 3.1 — scaled",
            },
            {
                src: demoImage("mkt-lumea-c3", 900, 1600),
                label: "Studio product",
                hook: "The one with 640 reviews",
                platform: "Meta",
                result: "ROAS 1.4 — cut week 3",
            },
            {
                src: demoImage("mkt-lumea-c4", 900, 1600),
                label: "Founder to camera",
                hook: "Why we reformulated it twice",
                platform: "TikTok",
                result: "ROAS 2.9 — kept",
            },
        ],
        kpis: [
            { label: "Blended ROAS", value: "3.6", delta: "+1.7" },
            { label: "Cost per acquisition", value: "$21", delta: "−$16" },
            { label: "New customers", value: "2,140", delta: "9 weeks" },
            { label: "Creative win rate", value: "3 of 9", delta: "kept live" },
        ],
        funnel: [
            { stage: "Impressions", metric: "4.2M" },
            { stage: "Clicks", metric: "108K (2.6%)" },
            { stage: "Add to cart", metric: "9,400" },
            { stage: "Purchases", metric: "2,140" },
        ],
        tools: [
            "Meta Ads Manager",
            "TikTok Ads",
            "Triple Whale",
            "Premiere Pro",
        ],
    },
    {
        id: "mkt-02",
        kind: "marketing",
        category: "Marketing",
        profile: "gallery",
        accent: "rose",
        title: "Carryform — Search & Shopping Rebuild",
        subtitle: "Cut the account in half and spend went further",
        badge: "Google Ads",
        thumbnail: demoImage("prodesignity-mkt-carryform"),
        channels: ["Google", "YouTube"],
        objective: "Profitable scale on existing demand",
        spend: "$71K over 6 months",
        client: "Carryform",
        industry: "Travel gear",
        year: "2025",
        description:
            "The account had 340 keywords, 290 of which had never converted. We paused those, rebuilt the shopping feed around the questions people actually search, and put the saved budget into the four terms that were already profitable.",
        creatives: [
            {
                src: demoImage("mkt-cf-c1", 1200, 900),
                label: "Shopping feed",
                hook: "Titles rewritten around capacity, not model name",
                platform: "Google Shopping",
                result: "CTR +71%",
            },
            {
                src: demoImage("mkt-cf-c2", 1200, 900),
                label: "Search RSA",
                hook: "Fits under the seat. Genuinely.",
                platform: "Google Search",
                result: "CPA −44%",
            },
            {
                src: demoImage("mkt-cf-c3", 1600, 900),
                label: "YouTube pre-roll",
                hook: "Six seconds, one zip, one bag",
                platform: "YouTube",
                result: "View rate 38%",
            },
        ],
        kpis: [
            { label: "ROAS", value: "5.2", delta: "+2.4" },
            { label: "Cost per acquisition", value: "$29", delta: "−$23" },
            { label: "Keywords live", value: "48", delta: "−292" },
            { label: "Revenue", value: "$369K", delta: "6 months" },
        ],
        funnel: [
            { stage: "Impressions", metric: "1.8M" },
            { stage: "Clicks", metric: "62K (3.4%)" },
            { stage: "Add to cart", metric: "6,100" },
            { stage: "Purchases", metric: "2,440" },
        ],
        tools: ["Google Ads", "Merchant Center", "GA4", "Looker Studio"],
    },
    {
        id: "mkt-03",
        kind: "marketing",
        category: "Marketing",
        profile: "gallery",
        accent: "rose",
        title: "Northbrew — Retention & Email Flows",
        subtitle: "The second order is cheaper than the first",
        badge: "Lifecycle Email",
        thumbnail: demoImage("prodesignity-mkt-northbrew"),
        channels: ["Email", "Meta"],
        objective: "Repeat purchase and subscription retention",
        spend: "$12K build + platform",
        client: "Northbrew Coffee",
        industry: "Speciality coffee",
        year: "2024",
        description:
            "Coffee runs out on a schedule, so the flows are built around the bag, not the calendar. A 250g bag at two cups a day is fourteen days — the reorder email lands on day eleven, when the tin is visibly low.",
        creatives: [
            {
                src: demoImage("mkt-nb-c1", 1200, 1500),
                label: "Reorder flow",
                hook: "Sent on day 11, not day 30",
                platform: "Email",
                result: "Open 61% · CTR 14%",
            },
            {
                src: demoImage("mkt-nb-c2", 1200, 1500),
                label: "Welcome series",
                hook: "Pick your grind, we'll remember it",
                platform: "Email",
                result: "42% first-order rate",
            },
            {
                src: demoImage("mkt-nb-c3", 1200, 1500),
                label: "Winback",
                hook: "The Ethiopia you liked is back",
                platform: "Email",
                result: "$18K recovered",
            },
            {
                src: demoImage("mkt-nb-c4", 900, 1600),
                label: "Retargeting set",
                hook: "Roasted the day it ships",
                platform: "Meta",
                result: "ROAS 6.1",
            },
        ],
        kpis: [
            { label: "Repeat rate", value: "48%", delta: "+17pts" },
            { label: "Email revenue share", value: "31%", delta: "+19pts" },
            { label: "Subscriber churn", value: "4.2%/mo", delta: "−3.1pts" },
            { label: "Lifetime value", value: "$186", delta: "+$71" },
        ],
        funnel: [
            { stage: "Subscribers", metric: "38K" },
            { stage: "Opens", metric: "21K (55%)" },
            { stage: "Clicks", metric: "4,600" },
            { stage: "Orders", metric: "1,380/mo" },
        ],
        tools: ["Klaviyo", "Figma", "Meta Ads Manager", "Shopify"],
    },

    /* ═══════════════════════ PACKAGING ═══════════════════════ */
    {
        id: "pkg-01",
        kind: "packaging",
        category: "Packaging",
        profile: "gallery",
        accent: "amber",
        title: "Northbrew Single-Origin Bag System",
        subtitle: "One structure, six origins, one shelf language",
        badge: "Label System",
        thumbnail: demoImage("prodesignity-pkg-northbrew"),
        client: "Northbrew Coffee",
        industry: "Speciality coffee",
        year: "2025",
        description:
            "Six origins that had to read as one family from three metres away and as six distinct coffees from thirty centimetres. The origin colour does the far-distance work; the tasting-note typography does the close-up work.",
        artboards: [
            {
                src: demoImage("pkg-nb-01", 1200, 1500),
                label: "Front face",
                note: "Origin colour block + roast date window",
            },
            {
                src: demoImage("pkg-nb-02", 1200, 1500),
                label: "Back face",
                note: "Tasting notes, altitude, producer credit",
            },
            {
                src: demoImage("pkg-nb-03", 1600, 1000),
                label: "Full range",
                note: "Six origins side by side",
            },
            {
                src: demoImage("pkg-nb-04", 1600, 1000),
                label: "Shelf test",
                note: "Photographed at 3m under retail lighting",
            },
        ],
        dieline: demoImage("pkg-nb-dieline", 1600, 1000),
        palette: [
            { hex: "#1B1B1F", name: "Roast Black" },
            { hex: "#E4572E", name: "Ethiopia Ember" },
            { hex: "#2F9C95", name: "Colombia Teal" },
            { hex: "#F5EFE6", name: "Kraft Cream" },
        ],
        printSpec: {
            substrate: "Kraft-lined foil pouch, 250g",
            finish: "Matte varnish, spot gloss on origin block",
            dimensions: "180 × 280 × 70 mm gusset",
            printMethod: "6-colour flexo + 1 spot Pantone",
        },
        deliverables: [
            "Print-ready dielines (6 SKUs)",
            "Pantone spec sheet",
            "Roast-date sticker template",
            "Photography art direction",
        ],
        tools: ["Illustrator", "Photoshop", "InDesign", "Esko ArtPro"],
    },
    {
        id: "pkg-02",
        kind: "packaging",
        category: "Packaging",
        profile: "gallery",
        accent: "amber",
        title: "Lumea Serum Carton & Bottle Label",
        subtitle: "Small format, very long ingredient list",
        badge: "Carton + Label",
        thumbnail: demoImage("prodesignity-pkg-lumea"),
        client: "Lumea Skin",
        industry: "Skincare",
        year: "2025",
        description:
            "The regulatory copy alone ran to 340 characters on a 30ml bottle. We solved it with a wrap-around label that hides the ingredient list on the reverse and a carton that carries the brand story — so neither panel has to do both jobs.",
        artboards: [
            {
                src: demoImage("pkg-lu-01", 1200, 1500),
                label: "Carton front",
                note: "Debossed logo, uncoated stock",
            },
            {
                src: demoImage("pkg-lu-02", 1200, 1500),
                label: "Bottle wrap",
                note: "Clear BOPP, white ink underprint",
            },
            {
                src: demoImage("pkg-lu-03", 1200, 1500),
                label: "Ingredient reverse",
                note: "6pt type, tested for legibility",
            },
            {
                src: demoImage("pkg-lu-04", 1600, 1000),
                label: "Unboxing",
                note: "Insert card and seal sticker",
            },
        ],
        dieline: demoImage("pkg-lu-dieline", 1600, 1000),
        palette: [
            { hex: "#0F2A38", name: "Deep Marine" },
            { hex: "#C9A227", name: "Muted Gold" },
            { hex: "#FBF7F2", name: "Bone" },
            { hex: "#7FA6A0", name: "Sea Glass" },
        ],
        printSpec: {
            substrate: "350gsm uncoated carton + clear BOPP label",
            finish: "Soft-touch lamination, gold foil stamp",
            dimensions: "42 × 42 × 120 mm carton",
            printMethod: "Offset CMYK + foil + deboss",
        },
        deliverables: [
            "Carton dieline with bleed",
            "Label artwork (2 sizes)",
            "Foil and deboss separations",
            "Press-check proof set",
        ],
        tools: ["Illustrator", "InDesign", "Photoshop", "Dimension"],
    },
    {
        id: "pkg-03",
        kind: "packaging",
        category: "Packaging",
        profile: "gallery",
        accent: "amber",
        title: "Palletworks Shipping Mark Standard",
        subtitle: "Industrial labelling that survives a forklift",
        badge: "Industrial Label",
        thumbnail: demoImage("prodesignity-pkg-palletworks"),
        client: "Palletworks",
        industry: "Logistics",
        year: "2024",
        description:
            "Warehouse staff were misreading SKUs at speed, so we redesigned around the scan, not the brand. Bigger numerals, a colour-coded destination band, and a barcode placed where a hand naturally lands when lifting.",
        artboards: [
            {
                src: demoImage("pkg-pw-01", 1200, 1500),
                label: "Master carton",
                note: "A5 label, high-contrast numerals",
            },
            {
                src: demoImage("pkg-pw-02", 1200, 1500),
                label: "Pallet placard",
                note: "A3 destination band system",
            },
            {
                src: demoImage("pkg-pw-03", 1600, 1000),
                label: "Fragile variant",
                note: "Diagonal hazard rule",
            },
        ],
        palette: [
            { hex: "#111827", name: "Ink" },
            { hex: "#F59E0B", name: "Hazard Amber" },
            { hex: "#2563EB", name: "Route Blue" },
            { hex: "#FFFFFF", name: "Stock White" },
        ],
        printSpec: {
            substrate: "Self-adhesive matte polypropylene",
            finish: "Scuff-resistant topcoat",
            dimensions: "148 × 210 mm / 297 × 420 mm",
            printMethod: "Thermal transfer, 300dpi",
        },
        deliverables: [
            "Label templates (3 sizes)",
            "Barcode placement spec",
            "Colour-coding key for staff",
            "Printer profile settings",
        ],
        tools: ["Illustrator", "InDesign", "BarTender"],
    },

    /* ═════════════════════ WEB APPLICATION ═══════════════════ */
    {
        id: "app-01",
        kind: "webapp",
        category: "Web Application",
        profile: "live",
        accent: "indigo",
        title: "Palletworks Dispatch Console",
        subtitle: "Eleven depots, one screen, live",
        badge: "Internal Tool",
        thumbnail: demoImage("prodesignity-app-dispatch"),
        appUrl: "https://dispatch.palletworks.example.com",
        appType: "Internal Tool",
        client: "Palletworks",
        industry: "Logistics",
        year: "2025",
        description:
            "Dispatch ran on a shared spreadsheet that three people edited at once and nobody trusted after 4pm. The console replaced it with a live board — same columns the team already used, but the row locks when someone else is editing it.",
        screens: [
            {
                label: "Live board",
                src: demoImage("app-dispatch-board", 1600, 1000),
                caption: "Every open consignment, grouped by depot",
            },
            {
                label: "Consignment detail",
                src: demoImage("app-dispatch-detail", 1600, 1000),
                caption: "Full history, documents, and driver contact",
            },
            {
                label: "Depot capacity",
                src: demoImage("app-dispatch-capacity", 1600, 1000),
                caption: "Pallet spaces free, updated on every scan",
            },
            {
                label: "Driver mobile view",
                src: demoImage("app-dispatch-mobile", 800, 1600),
                caption: "Signature capture and photo proof of delivery",
            },
        ],
        modules: [
            {
                name: "Live consignment board",
                detail: "Real-time rows with per-row edit locking",
            },
            {
                name: "Capacity planner",
                detail: "Pallet spaces per depot, updated on scan",
            },
            {
                name: "Proof of delivery",
                detail: "Driver photo and signature, stored against the job",
            },
            {
                name: "Exception queue",
                detail: "Damaged and refused deliveries routed to a manager",
            },
        ],
        roles: ["Dispatcher", "Depot manager", "Driver", "Finance"],
        scale: [
            { label: "Daily users", value: "140" },
            { label: "Consignments / day", value: "3,200" },
            { label: "Depots", value: "11" },
            { label: "Uptime", value: "99.97%" },
        ],
        stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Pusher"],
        tools: ["VS Code", "Figma", "Linear", "Sentry"],
    },
    {
        id: "app-02",
        kind: "webapp",
        category: "Web Application",
        profile: "live",
        accent: "indigo",
        title: "Northbrew Wholesale Portal",
        subtitle: "Cafés order at 5am and nobody wants to phone anyone",
        badge: "B2B Portal",
        thumbnail: demoImage("prodesignity-app-wholesale"),
        appUrl: "https://wholesale.northbrew.example.com",
        appType: "Portal",
        client: "Northbrew Coffee",
        industry: "Speciality coffee",
        year: "2025",
        description:
            "Wholesale accounts each had their own price list living in a PDF attached to an email from 2023. The portal holds the real one, remembers what each café ordered last time, and lets them repeat it in two taps.",
        screens: [
            {
                label: "Reorder screen",
                src: demoImage("app-wholesale-reorder", 1600, 1000),
                caption: "Last order pre-filled, editable, two taps to send",
            },
            {
                label: "Account pricing",
                src: demoImage("app-wholesale-pricing", 1600, 1000),
                caption: "Per-account tiers with volume breaks",
            },
            {
                label: "Invoice history",
                src: demoImage("app-wholesale-invoices", 1600, 1000),
                caption: "Downloadable, filterable, no email needed",
            },
        ],
        modules: [
            {
                name: "One-tap reorder",
                detail: "Previous basket restored and editable",
            },
            {
                name: "Account price tiers",
                detail: "Volume breaks applied automatically at checkout",
            },
            {
                name: "Standing orders",
                detail: "Weekly recurring delivery with skip and pause",
            },
            {
                name: "Invoice archive",
                detail: "Self-serve PDFs, synced from accounting",
            },
        ],
        roles: ["Café owner", "Café staff", "Account manager", "Accounts"],
        scale: [
            { label: "Wholesale accounts", value: "310" },
            { label: "Orders / week", value: "890" },
            { label: "Phone orders", value: "−84%" },
            { label: "Uptime", value: "99.99%" },
        ],
        stack: ["Next.js", "TypeScript", "Shopify Admin API", "Xero", "Vercel"],
        tools: ["VS Code", "Figma", "Postman", "Sentry"],
    },
    {
        id: "app-03",
        kind: "webapp",
        category: "Web Application",
        profile: "live",
        accent: "indigo",
        title: "Lumea Formulation Tracker",
        subtitle: "Every batch, every supplier, one audit trail",
        badge: "SaaS Build",
        thumbnail: demoImage("prodesignity-app-tracker"),
        appUrl: "https://tracker.lumea.example.com",
        appType: "SaaS",
        client: "Lumea Skin",
        industry: "Skincare",
        year: "2024",
        description:
            "Cosmetic compliance means proving where every ingredient in every batch came from. That lived across four spreadsheets and a filing cabinet. Now a batch number returns the full chain in one query, which turned a two-day audit into an afternoon.",
        screens: [
            {
                label: "Batch record",
                src: demoImage("app-tracker-batch", 1600, 1000),
                caption: "Ingredients, suppliers, certificates, signatures",
            },
            {
                label: "Supplier register",
                src: demoImage("app-tracker-suppliers", 1600, 1000),
                caption: "Documents with expiry alerts",
            },
            {
                label: "Audit export",
                src: demoImage("app-tracker-audit", 1600, 1000),
                caption: "Regulator-ready PDF for any date range",
            },
        ],
        modules: [
            {
                name: "Batch records",
                detail: "Immutable log with electronic signature",
            },
            {
                name: "Supplier documents",
                detail: "Certificates with automatic expiry alerts",
            },
            {
                name: "Formulation versions",
                detail: "Diff between any two revisions of a formula",
            },
            {
                name: "Audit export",
                detail: "Date-ranged PDF pack for regulators",
            },
        ],
        roles: ["Formulator", "QA lead", "Production", "Auditor (read-only)"],
        scale: [
            { label: "Batches logged", value: "4,800" },
            { label: "Suppliers tracked", value: "62" },
            { label: "Audit prep time", value: "2 days → 4h" },
            { label: "Uptime", value: "99.95%" },
        ],
        stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "S3"],
        tools: ["VS Code", "Figma", "Linear", "Sentry"],
    },
];

/* --------------------------- Selectors ---------------------------- */

export function filterPortfolio(
    category: PortfolioCategory,
    format: VideoFormat,
): PortfolioItem[] {
    return PORTFOLIO_ITEMS.filter((item) => {
        if (item.category !== category) return false;
        // Format only narrows video work; other disciplines ignore it.
        if (item.kind === "video") return item.format === format;
        return true;
    });
}

export function countByCategory(category: PortfolioCategory): number {
    return PORTFOLIO_ITEMS.filter((i) => i.category === category).length;
}
