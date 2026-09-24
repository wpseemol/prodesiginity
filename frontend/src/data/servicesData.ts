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
    | "BookOpen"
    | "TrendingUp"
    | "Store"
    | "ShoppingCart"
    | "SlidersHorizontal"
    | "Eye"
    | "Clapperboard"
    | "Search"
    | "Target"
    | "Share2"
    | "FileText"
    | "Users"
    | "UserCheck";

export type ServiceGroupSlug =
    | "e-commerce"
    | "web"
    | "creative-branding"
    | "animation-video"
    | "marketing-growth"
    | "dedicated-team";

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
        slug: "e-commerce",
        title: "E-commerce",
        blurb: "High-converting storefronts, optimized listings, and seamless checkout experiences built to scale sales.",
        icon: "ShoppingBag",
    },
    {
        slug: "web",
        title: "Web",
        blurb: "Storefronts, marketing sites and custom web apps.",
        icon: "Layout",
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
    {
        slug: "marketing-growth",
        title: "Marketing & Growth",
        blurb: "Strategies and tactics to drive more traffic and sales.",
        icon: "TrendingUp",
    },
    {
        slug: "dedicated-team",
        title: "Dedicated Team",
        blurb: "A hand-picked team of designers and developers working exclusively for you.",
        icon: "Box",
    },
];

/* -------------------------------------------------------------------------
   Services — the SECOND level of the dropdown, and one page each.
   ------------------------------------------------------------------------- */

export const SERVICES: Service[] = [
    /* -------------------------- E-commerce ------------------------- */
    {
        slug: "shopify-store-design",
        title: "Shopify Store Design",
        group: "e-commerce",
        icon: "Store",
        tagline:
            "Bespoke, high-converting Shopify storefronts designed to showcase your products and maximize sales.",
        summary:
            "Custom Online Store 2.0 layouts, high-converting product pages, and brand-aligned shopping experiences that turn visitors into loyal customers.",
        intro: [
            "A default Shopify theme out of the box rarely represents a premium brand. Generic templates display identical block arrangements regardless of what you sell, clutter the visual hierarchy, and offer checkout journeys that fail to inspire buyer confidence.",
            "We design tailored, brand-first storefronts built specifically around your core product catalog and customer buying habits. From intuitive collection filtering and story-driven product detail pages (PDPs) to seamless cart drawers with high-converting upsells, we ensure every pixel drives conversion.",
        ],
        deliverables: [
            "Complete bespoke UI/UX design in Figma for mobile, tablet, and desktop",
            "Conversion-engineered Product Detail Page (PDP) & Collection layouts",
            "Custom Online Store 2.0 modular section designs ready for theme implementation",
            "Optimized Cart Drawer (Slide-out cart) with dynamic upsells and free shipping tiers",
            "Brand identity styling: typography hierarchy, color palette, badges, and trust icons",
            "Mobile-first checkout flow and sticky add-to-cart UX architecture",
            "Design system asset kit and developer handoff documentation",
        ],
        idealFor: [
            "DTC brands looking to upgrade from a basic stock or free Shopify theme",
            "E-commerce stores experiencing steady traffic but struggling with low add-to-cart rates",
            "Growing merchants launching new flagship collections or repositioning into the premium space",
        ],
        process: [
            {
                title: "Store Audit & Funnel Discovery",
                body: "We review your brand guidelines, customer demographics, competitor benchmarks, and existing purchase funnel friction points.",
            },
            {
                title: "Wireframing & Information Architecture",
                body: "We map out high-priority user flows across your Homepage, Collection pages, PDPs, and Cart drawer to maximize retention.",
            },
            {
                title: "High-Fidelity Visual Design",
                body: "We craft pixel-perfect Figma prototypes incorporating rich brand visuals, custom banners, trust badges, and interactive elements.",
            },
            {
                title: "Interactive Review & Refinement",
                body: "We test clickable desktop and mobile prototypes with your team to fine-tune spacing, micro-interactions, and conversion modules.",
            },
            {
                title: "Handoff & Build Preparation",
                body: "We package design tokens, asset libraries, and annotated section specs for seamless integration into Shopify OS 2.0.",
            },
        ],
        faqs: [
            {
                q: "Can my team edit banners and text without coding after this redesign?",
                a: "Yes. Our designs are built modularly for Shopify's Online Store 2.0 section architecture, allowing you to easily swap banners, change text, and reorder homepage sections via the standard Shopify theme editor.",
            },
            {
                q: "Do you design custom elements like sticky add-to-cart bars and bundles?",
                a: "Yes. We design high-converting interactive modules including sticky buy buttons, quantity breaks, cross-sell recommendation blocks, size guides, and trust badge strips.",
            },
            {
                q: "Will this design work smoothly on mobile devices?",
                a: "Absolutely. Over 75% of e-commerce traffic is mobile, so every page and interactive component is designed mobile-first with thumb-friendly navigation and fast-loading layouts.",
            },
        ],
        timeline: "2–4 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.primary || ACCENTS.indigo,
        seo: {
            title: "Shopify Store Design Services & Custom DTC Storefronts",
            description:
                "Custom Shopify store design and conversion-focused UX: bespoke Online Store 2.0 layouts, high-converting product pages, and mobile-first storefront architectures.",
            keywords: [
                "shopify store design",
                "custom shopify storefront",
                "shopify ui ux design",
                "dtc ecommerce store design",
                "shopify product page design",
                "shopify theme design agency",
            ],
        },
    },
    {
        slug: "shopify-development",
        title: "Shopify Development",
        group: "e-commerce",
        icon: "ShoppingBag",
        tagline:
            "Robust Liquid theme engineering, custom app integrations, and high-performance Shopify builds.",
        summary:
            "Develop high-performance Online Store 2.0 themes, bespoke Liquid components, and seamless third-party app integrations to scale your store.",
        intro: [
            "A successful Shopify store requires more than a visual theme; it needs clean, scalable code under the hood. Bloated apps, broken JavaScript, and poorly configured Liquid templates slow down your site and degrade customer trust during checkout.",
            "We build custom, fast, maintainable Shopify storefronts on Online Store 2.0. Whether you need custom Liquid sections, headless Shopify setups, custom app bridges, or seamless API integrations, we engineer back-end and front-end solutions that keep your store fast, reliable, and easy for your team to manage.",
        ],
        deliverables: [
            "Custom Online Store 2.0 theme development from Figma/design files",
            "Bespoke Liquid section and block development with dynamic schema settings",
            "Shopify App integration and configuration (Klaviyo, Recharge, Gorgias, Yotpo, etc.)",
            "Custom cart functionality: slide-out drawer, tiered rewards, and upsell logic",
            "Performance optimization: script minification, image sizing, and app bloat removal",
            "Third-party API & webhook integrations (ERP, CRM, inventory, custom logistics)",
            "Zero-downtime platform migration from WooCommerce, Magento, or custom carts",
        ],
        idealFor: [
            "Growing brands needing custom features beyond standard theme capabilities",
            "Stores struggling with slow load times due to excessive or poorly coded apps",
            "Merchants migrating to Shopify from WooCommerce, Magento, or legacy platforms",
        ],
        process: [
            {
                title: "Architecture & Code Audit",
                body: "We audit your existing store architecture, apps, and codebase to identify bottlenecks, bugs, and structural requirements.",
            },
            {
                title: "Theme & Section Build",
                body: "We write clean, modular Liquid code and native components matching your exact design specifications on OS 2.0.",
            },
            {
                title: "Integrations & Custom Logic",
                body: "We hook up custom checkout extensions, subscription engines, customer portals, and back-office API feeds.",
            },
            {
                title: "Speed & Quality Assurance",
                body: "We test responsiveness across real devices, eliminate script bottlenecks, and ensure top-tier Core Web Vitals.",
            },
            {
                title: "Staging Review & Deployment",
                body: "We test on a secure staging environment, run end-to-end checkout simulations, and deploy with zero downtime.",
            },
        ],
        faqs: [
            {
                q: "Can my team edit content without writing code?",
                a: "Yes. Every custom section and block is built using Shopify OS 2.0 theme schema, giving your marketing team complete control over text, images, and layout directly inside the Shopify Theme Editor.",
            },
            {
                q: "Can you build custom functionality to replace heavy monthly apps?",
                a: "Yes. We frequently replace slow, paid apps with lightweight native Liquid/JavaScript solutions (e.g., custom cart drawers, bundle builders, size charts, countdown timers), reducing monthly app fees and speeding up your store.",
            },
            {
                q: "Will our live store experience downtime during development?",
                a: "No. All development and testing take place in an unpublished theme or private staging environment. We only publish once everything has been thoroughly QA tested.",
            },
        ],
        timeline: "2–6 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.primary || ACCENTS.emerald,
        seo: {
            title: "Custom Shopify Development Agency & Theme Engineering",
            description:
                "Custom Shopify development services: bespoke Online Store 2.0 themes, custom Liquid sections, app integrations, performance optimization, and platform migrations.",
            keywords: [
                "shopify development agency",
                "custom shopify development",
                "shopify liquid developer",
                "shopify app integration",
                "shopify speed optimization",
                "shopify migration services",
            ],
        },
    },
    {
        slug: "ecommerce-website",
        title: "E-commerce Website",
        group: "e-commerce",
        icon: "ShoppingCart",
        tagline:
            "Full-scale, multi-channel e-commerce architectures built for seamless buying experiences and high conversion.",
        summary:
            "Design and develop robust, scalable e-commerce websites with smooth checkout flows, inventory syncing, and custom integrations.",
        intro: [
            "A standalone e-commerce website is the foundation of your digital retail brand. When a store suffers from confusing navigation, slow category filtering, or clunky checkout steps, buyers abandon their carts for competitors.",
            "We build complete, custom e-commerce web platforms engineered for peak sales volume. From structured product catalogs and responsive filtering to multi-currency payment gateways and back-office order fulfillment sync, we deliver high-performing storefronts built to scale your revenue.",
        ],
        deliverables: [
            "End-to-end e-commerce UX/UI design across desktop, tablet, and mobile",
            "Custom storefront architecture (WooCommerce, Shopify, BigCommerce, or Headless Commerce)",
            "Advanced product catalog management with dynamic filters, variants, and search",
            "Multi-currency & multi-language localization with international tax/shipping setup",
            "Seamless payment gateway integrations (Stripe, PayPal, Apple Pay, Klarna, local methods)",
            "Inventory, CRM, and order fulfillment system synchronization",
            "Security hardening, SSL encryption, PCI compliance, and speed optimization",
        ],
        idealFor: [
            "Brands launching a direct-to-consumer (DTC) or B2B online storefront",
            "Retail businesses transitioning from physical locations or third-party marketplaces to their own website",
            "Established stores needing to re-platform for greater speed, flexibility, and lower fees",
        ],
        process: [
            {
                title: "Store Strategy & Catalog Mapping",
                body: "We map out your product taxonomy, shipping tiers, tax zones, user accounts, and payment requirements.",
            },
            {
                title: "UX Wireframing & Interface Design",
                body: "We design high-converting visual layouts for home, catalog, brand collections, PDPs, and checkout.",
            },
            {
                title: "Storefront & Engine Development",
                body: "We code the platform, configure product databases, and build custom cart and checkout mechanics.",
            },
            {
                title: "Payment & System Integration",
                body: "We connect payment gateways, shipping calculators, automated email triggers, and inventory tools.",
            },
            {
                title: "End-to-End QA & Launch",
                body: "We run comprehensive test transactions, verify mobile speed and security, and coordinate a zero-downtime launch.",
            },
        ],
        faqs: [
            {
                q: "Which e-commerce platforms do you build on?",
                a: "We develop on Shopify, WooCommerce, BigCommerce, and custom Headless Commerce architectures (Next.js with Commerce APIs), choosing the best fit for your catalog size and operational requirements.",
            },
            {
                q: "Can you connect the store to our warehouse or inventory software?",
                a: "Yes. We integrate your store with third-party ERPs, POS systems, inventory managers, and fulfillment centers via webhooks and REST APIs.",
            },
            {
                q: "How secure will customer data and transactions be?",
                a: "All builds follow strict e-commerce security standards including end-to-end SSL encryption, PCI-DSS compliant payment processing, and secure customer account authentication.",
            },
        ],
        timeline: "3–8 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.emerald || ACCENTS.blue,
        seo: {
            title: "E-commerce Website Design & Custom Online Store Development",
            description:
                "Full-service e-commerce website design and development: scalable storefront architectures, multi-currency checkouts, inventory syncing, and high-converting product pages.",
            keywords: [
                "ecommerce website development",
                "custom online store design",
                "e-commerce website design agency",
                "e-commerce development services",
                "headless e-commerce website",
                "dtc e-commerce store development",
            ],
        },
    },
    {
        slug: "store-customization",
        title: "Store Customization",
        group: "e-commerce",
        icon: "SlidersHorizontal",
        tagline:
            "Custom features, conversion-tuned layouts, and bespoke UI tweaks for your existing online store.",
        summary:
            "Upgrade your existing storefront with tailored conversion modules, custom section templates, and seamless third-party enhancements without rebuilding from scratch.",
        intro: [
            "You don't always need a costly, ground-up store rebuild to unlock higher revenue. Often, high-impact improvements come from removing specific points of friction—like an outdated cart drawer, clunky variant selectors, or rigid product page layouts.",
            "We enhance your current Shopify or e-commerce theme with custom-engineered sections, conversion boosters, and bespoke feature integrations. We work directly inside your existing setup, ensuring changes are lightweight, fast, and completely manageable by your team.",
        ],
        deliverables: [
            "Custom product page modules (sticky buy bars, bundle selectors, custom swatches)",
            "Advanced Cart Drawer customizations (tier-based free shipping bars, dynamic cross-sells)",
            "Custom collection page enhancements (smart filters, quick-view modals, badge tags)",
            "Bespoke landing page and promotional section templates",
            "App replacement with native, lightweight Liquid/JavaScript code",
            "Mobile UX polish and checkout journey streamlining",
            "Pre-launch testing across major browsers and devices",
        ],
        idealFor: [
            "Stores happy with their current theme but needing specific custom functionality",
            "Brands looking to boost Average Order Value (AOV) through tailored upsells and bundles",
            "Merchants wanting to eliminate slow, expensive monthly Shopify apps with native code",
        ],
        process: [
            {
                title: "Store & Feature Audit",
                body: "We review your store's current theme, conversion flow, and requested features to plan clean, lightweight solutions.",
            },
            {
                title: "Design & Spec Approval",
                body: "We provide visual mockups or wireframes for custom components to align on UX and branding before coding.",
            },
            {
                title: "Custom Development",
                body: "We code custom sections and scripts in a draft theme, keeping your live store completely unaffected.",
            },
            {
                title: "Quality Assurance & Speed Check",
                body: "We test responsiveness, cross-browser compatibility, and verify that scripts don't degrade site speed.",
            },
            {
                title: "Publish & Theme Walkthrough",
                body: "We publish the updates to your live theme and provide instructions on adjusting settings in the customizer.",
            },
        ],
        faqs: [
            {
                q: "Will custom changes affect my live store while you work?",
                a: "No. All customization work is done in an unpublished theme or staging environment. Your live customers will experience zero interruption until you review and approve the final result.",
            },
            {
                q: "Can you customize third-party apps or widgets?",
                a: "Yes. We can restyle reviews widgets, subscription selectors, popups, and filter apps to blend naturally with your store's visual identity.",
            },
            {
                q: "Can I adjust the customized sections myself later?",
                a: "Yes. We build custom sections with native theme schema controls, allowing you to edit text, images, colors, and layout settings directly in the theme customizer.",
            },
        ],
        timeline: "1–3 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.emerald || ACCENTS.blue,
        seo: {
            title: "E-commerce & Shopify Store Customization Services",
            description:
                "Tailored e-commerce store customization: custom product page features, slide-out cart upsells, custom theme sections, and conversion optimization.",
            keywords: [
                "shopify store customization",
                "e-commerce theme customization",
                "custom shopify sections",
                "shopify cart drawer customization",
                "e-commerce conversion optimization",
                "custom product page features",
            ],
        },
    },

    /* ---------------------------- Web ---------------------------- */
    {
        slug: "website-design-development",
        title: "Website Design & Development",
        group: "web",
        icon: "Layout",
        tagline:
            "Fast, modern, search-friendly websites built to represent your brand and convert visitors into clients.",
        summary:
            "Custom-designed, high-performance websites engineered for speed, brand authority, and measurable business growth.",
        intro: [
            "A generic website template is a placeholder, not a business asset. Out-of-the-box templates often come loaded with bloated code, rigid layouts that don't match your brand story, and user journeys that fail to guide visitors toward taking action.",
            "We build custom, mobile-first websites focused on the essentials that drive results — strategic information hierarchy, clean UI/UX, responsive layouts, ultra-fast load times, and clear conversion funnels. The result is a seamless digital experience that turns casual visitors into paying customers.",
        ],
        deliverables: [
            "Custom UI/UX design tailored to your brand identity",
            "Responsive, mobile-first front-end development (Next.js / React / Modern Web)",
            "Search engine-friendly semantic structure and on-page technical SEO",
            "Performance optimization with 90+ mobile & desktop Google Lighthouse scores",
            "CMS integration (Headless CMS, WordPress, or custom admin portals)",
            "Lead generation forms, scheduling tools, and API integrations",
            "Cross-browser testing, accessibility compliance, and security audits",
        ],
        idealFor: [
            "Modern businesses and agencies needing a high-end digital presence",
            "Companies looking to re-architect an outdated, slow, or low-converting website",
            "Startups and service brands launching a new product or platform",
        ],
        process: [
            {
                title: "Discovery & Strategy",
                body: "We analyze your target audience, industry positioning, and core conversion goals to map out a clear site architecture.",
            },
            {
                title: "Wireframing & UI/UX Design",
                body: "We craft custom, high-fidelity visual mockups and interactive user journeys for every key page.",
            },
            {
                title: "Development & Integration",
                body: "We write clean, modular, scalable code with your chosen tech stack and connect all required forms and third-party tools.",
            },
            {
                title: "Speed & SEO Pass",
                body: "We optimize media assets, configure caching, minimize scripts, and verify structured metadata for top-tier performance.",
            },
            {
                title: "Testing & Launch",
                body: "We perform full responsive testing across multiple devices and browsers, execute a zero-downtime launch, and hand over documentation.",
            },
        ],
        faqs: [
            {
                q: "Will my new website be easy to update after launch?",
                a: "Yes. We integrate easy-to-use CMS platforms or modular section systems so your team can edit content, images, and blog posts without touching any code.",
            },
            {
                q: "Will my current Google search rankings be protected during a redesign?",
                a: "Yes. We perform full URL mapping, implement 301 redirects for any altered routes, and maintain structured metadata so you keep your search authority.",
            },
            {
                q: "What tech stack do you use for website development?",
                a: "We tailor the stack to your requirements — typically Next.js, React, and Tailwind CSS for custom ultra-fast builds, or WordPress and Headless CMS setups when extensive content editing is needed.",
            },
        ],
        timeline: "2–5 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.indigo,
        seo: {
            title: "Website Design & Development Services",
            description:
                "High-performance website design and modern web development: custom UI/UX, responsive mobile-first architecture, SEO optimization, and high-converting layouts.",
            keywords: [
                "website design and development",
                "custom web development agency",
                "responsive web design",
                "ui ux web design",
                "modern business websites",
                "seo friendly website development",
            ],
        },
    },

    {
        slug: "web-applications",
        title: "Web Applications",
        group: "web",
        icon: "AppWindow",
        tagline:
            "Custom, scalable, interactive web platforms built to automate workflows and drive business operations.",
        summary:
            "Develop robust, secure, full-stack web applications tailored to streamline internal processes and deliver rich user experiences.",
        intro: [
            "Off-the-shelf software often leaves businesses stuck with inflexible workflows, costly monthly per-seat fees, and features they never use. We engineer custom web applications designed around your exact operational models, logic, and data structures.",
            "From customer self-service portals and SaaS MVPs to internal management dashboards and custom booking engines, we develop full-stack, API-driven solutions. Every application is built with security, database integrity, real-time interactivity, and long-term scalability from day one.",
        ],
        deliverables: [
            "Architecture planning, system design, and database schema modeling",
            "Interactive UI/UX prototypes and responsive web app dashboards in Figma",
            "Full-stack development with modern frameworks (React, Next.js, Node.js, TypeScript)",
            "Secure authentication, role-based access control (RBAC), and session management",
            "RESTful & GraphQL API design with third-party webhooks and service integrations",
            "Payment gateway, invoicing, automated notifications, and reporting engine setup",
            "End-to-end automated testing, load balancing, cloud deployment, and documentation",
        ],
        idealFor: [
            "Businesses outgrowing messy spreadsheets and seeking custom workflow automation",
            "Founders and startups building and launching a scalable SaaS MVP",
            "Companies needing custom client portals, booking engines, or interactive dashboards",
        ],
        process: [
            {
                title: "Architecture & Logic Discovery",
                body: "We map out core business logic, user roles, system entities, data relationships, and key integration points.",
            },
            {
                title: "Product UI/UX & Prototyping",
                body: "We design clean, intuitive app views, dashboards, and responsive interaction flows for desktop and mobile devices.",
            },
            {
                title: "Full-Stack Development",
                body: "We write clean, modular frontend interfaces and secure backend APIs with optimized database queries and caching.",
            },
            {
                title: "Security & QA Audits",
                body: "We conduct penetration checks, data validation tests, cross-device QA, and edge-case error handling.",
            },
            {
                title: "Cloud Deployment & Handover",
                body: "We deploy the application to your production cloud environment, set up monitoring, and provide full technical documentation.",
            },
        ],
        faqs: [
            {
                q: "How does a custom web application differ from a standard website?",
                a: "A standard website is primarily content-driven for marketing and information. A web application is an interactive software platform that manages databases, user accounts, transactional logic, complex calculations, and automated workflows.",
            },
            {
                q: "Can the web application integrate with our existing tools and APIs?",
                a: "Yes. We can connect your application with CRM systems, payment gateways (Stripe, PayPal), messaging services (WhatsApp, Twilio, SendGrid), ERPs, and custom third-party REST/GraphQL APIs.",
            },
            {
                q: "Who owns the code and intellectual property after completion?",
                a: "You retain 100% full ownership of the codebase, database schemas, and intellectual property upon project completion and deployment.",
            },
        ],
        timeline: "4–10 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.blue,
        seo: {
            title: "Custom Web Application Development Services",
            description:
                "End-to-end custom web application development: scalable architecture, custom portals, SaaS platforms, internal business software, and secure API integrations.",
            keywords: [
                "custom web applications",
                "web app development agency",
                "full stack web development",
                "saas application development",
                "business portal development",
                "custom dashboard development",
            ],
        },
    },

    {
        slug: "ui-ux-design",
        title: "UI/UX Design",
        group: "web",
        icon: "Sparkles",
        tagline:
            "Intuitive, human-centered interfaces designed to turn complex products into effortless user experiences.",
        summary:
            "Crafting user research-backed wireframes, design systems, and high-fidelity prototypes that drive user retention and conversion.",
        intro: [
            "Great visual design attracts attention, but intelligent user experience keeps people coming back. If users struggle to navigate your platform, understand your product hierarchy, or complete checkout, your design is leaking revenue.",
            "We craft user journeys and interface architectures rooted in behavioral psychology and data. From user flows and interactive Figma wireframes to cohesive, scalable design systems, we build digital products that feel instinctive and delightful on any screen.",
        ],
        deliverables: [
            "User persona mapping, journey maps, and information architecture (IA)",
            "Low-fidelity wireframes and interactive user flow blueprints",
            "High-fidelity desktop, tablet, and mobile UI screens in Figma",
            "Scalable design systems: typography scale, color tokens, and modular UI components",
            "Clickable, interactive prototypes ready for user testing and stakeholder demos",
            "Usability audits, accessibility compliance checks (WCAG 2.1), and heuristic reviews",
            "Developer-ready handoff files with complete token documentation and asset exports",
        ],
        idealFor: [
            "Startups needing an intuitive, production-ready MVP design",
            "Established software & SaaS platforms aiming to eliminate user friction and churn",
            "E-commerce stores and service businesses looking to maximize conversion rates",
        ],
        process: [
            {
                title: "Research & Journey Mapping",
                body: "We analyze your audience, audit competitor products, and define core user journeys and functional pathways.",
            },
            {
                title: "Wireframing & Architecture",
                body: "We structure the layout and content hierarchy with rapid wireframes to validate interaction flow before visual styling.",
            },
            {
                title: "Design System & UI Craft",
                body: "We create pixel-perfect visual interfaces, defining typography, colors, iconography, and responsive states.",
            },
            {
                title: "Interactive Prototyping",
                body: "We link screens into a realistic, clickable prototype to test micro-interactions, animations, and transitions.",
            },
            {
                title: "Developer Handoff & Specs",
                body: "We organize Figma components with auto-layout, spacing variables, and CSS token specifications for clean engineering implementation.",
            },
        ],
        faqs: [
            {
                q: "What tools do you use for UI/UX design?",
                a: "We work primarily in Figma for wireframing, high-fidelity UI design, component systems, and interactive prototypes. We also use FigJam and Miro for journey mapping and information architecture.",
            },
            {
                q: "Do you provide design files that our engineering team can build directly?",
                a: "Yes. All Figma files are built using structured auto-layout, component variants, and design tokens, making developer inspection and frontend implementation frictionless.",
            },
            {
                q: "Can you redesign an existing product without rebuilding it from scratch?",
                a: "Yes. We can perform a targeted UX audit to identify high-friction drop-off points, then redesign specific user flows, forms, or navigation patterns while keeping your backend intact.",
            },
        ],
        timeline: "2–6 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.violet || ACCENTS.blue,
        seo: {
            title: "UI/UX Design Services & Interactive Prototyping",
            description:
                "User-centered UI/UX design for web and mobile products: wireframes, design systems, conversion-driven user journeys, and clickable Figma prototypes.",
            keywords: [
                "ui ux design services",
                "ui ux design agency",
                "product design agency",
                "figma prototyping",
                "web app ui design",
                "design systems development",
            ],
        },
    },

    /* ----------------------- Creative & Branding ------------------------ */
    {
        slug: "3d-product-visualization",
        title: "3D Product Visualization",
        group: "creative-branding",
        icon: "Box",
        tagline:
            "Photorealistic 3D models and digital environments that showcase your products from every angle.",
        summary:
            "Transform physical products, CAD files, and sketches into studio-grade 3D renders, lifestyle staging, and interactive digital models.",
        intro: [
            "Traditional photography is expensive, difficult to update, and limited by physical constraints. A single design tweak or new color variant often forces you to re-ship physical samples, book studios, and shoot everything all over again.",
            "We create hyper-realistic 3D digital twins of your products with accurate textures, lighting, and materials. Whether for e-commerce listings, advertising campaigns, or pre-launch marketing, 3D visualization lets you showcase your product in any environment before it even rolls off the assembly line.",
        ],
        deliverables: [
            "High-poly and low-poly 3D modeling from sketches, CAD, or physical reference",
            "Photorealistic studio renders with custom lighting setups and transparent cutouts",
            "Contextual lifestyle scene staging (interior, outdoor, and architectural environments)",
            "Material, color, and texture variant sets (CMF exploration)",
            "Exploded views, cutaways, and internal component breakdowns",
            "Ultra-high-resolution print and web-ready assets (4K/8K resolution)",
            "Source 3D files and assets ready for interactive web viewers (GLB, FBX, OBJ)",
        ],
        idealFor: [
            "DTC and e-commerce brands wanting studio-grade imagery without photoshoots",
            "Hardware and product companies launching kickstarter or pre-order campaigns",
            "Brands with extensive variant catalogs needing consistent, repeatable angles",
        ],
        process: [
            {
                title: "Reference & CAD Ingestion",
                body: "We review your CAD files, sketches, blueprints, or physical photo references to confirm dimensions and surface details.",
            },
            {
                title: "3D Modeling & Topology",
                body: "We build precise 3D geometry and optimize topology for clean curves, seams, and bevels.",
            },
            {
                title: "Texturing & Shading (PBR)",
                body: "We craft custom physically based rendering (PBR) materials, dialing in roughness, metalness, and sub-surface scattering.",
            },
            {
                title: "Lighting & Composition",
                body: "We set up virtual studio lighting and cameras to highlight form factor, branding, and key selling points.",
            },
            {
                title: "Hi-Res Rendering & Post-Processing",
                body: "We render out multi-pass high-resolution images, complete color grading, and deliver web-optimized and print files.",
            },
        ],
        faqs: [
            {
                q: "What files do I need to provide to get started?",
                a: "We can work from CAD files (STEP, IGES, OBJ, FBX), technical drawings, dimensioned blueprints, or simply clear photos of your product from multiple angles.",
            },
            {
                q: "How realistic are the 3D renders compared to real photography?",
                a: "Our renders use physically based materials and cinematic lighting setups, producing imagery indistinguishable from high-end studio photography—with complete control over reflections and background elements.",
            },
            {
                q: "Can I easily add new colors or packaging variants later?",
                a: "Yes. Once the core 3D asset is created, generating new colorways, material finishes, or updated label graphics takes a fraction of the time and cost of a new photoshoot.",
            },
        ],
        timeline: "1–3 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.orange || ACCENTS.emerald,
        seo: {
            title: "3D Product Visualization & Photorealistic 3D Modeling Services",
            description:
                "Professional 3D product visualization: photorealistic modeling, studio rendering, lifestyle scene staging, and e-commerce digital twins.",
            keywords: [
                "3d product visualization",
                "3d product modeling",
                "photorealistic 3d rendering",
                "ecommerce 3d renders",
                "3d product design agency",
                "cgi product visualization",
            ],
        },
    },
    {
        slug: "product-rendering",
        title: "Product Rendering",
        group: "creative-branding",
        icon: "Eye",
        tagline:
            "Studio-grade photorealistic CGI renders that elevate product presentation and buyer confidence.",
        summary:
            "High-definition 3D rendering with precision lighting, photorealistic textures, and multi-angle e-commerce imagery that outperforms physical photography.",
        intro: [
            "In modern e-commerce, the quality of your product imagery directly dictates perceived value and conversion rates. Relying on traditional photography often leads to inconsistent lighting, visible dust or flaws, and costly reshoots whenever a minor design or label update occurs.",
            "We deliver hyper-realistic, studio-grade 3D product renders with flawless lighting, reflections, and physically based materials. From isolated pure-white cutouts and macro detail close-ups to vibrant hero graphics, we ensure your catalog looks immaculate, uniform, and premium across all digital and print channels.",
        ],
        deliverables: [
            "Pure-white background e-commerce cutouts (Amazon, Shopify, and marketplace compliant)",
            "Macro close-up renders highlighting texture, material finishes, and fine craftsmanship",
            "Multi-angle studio product hero shots (front, 45-degree, side, top, and perspective views)",
            "Exploded component views and x-ray/ghosted internal breakdowns",
            "Color, material, and finish (CMF) batch variations across full SKU lineups",
            "Ultra-high-resolution image exports (up to 8K PNG/TIFF with alpha transparency)",
            "Post-production color grading and print-ready format exports",
        ],
        idealFor: [
            "Brands launching physical goods before mass production or shipping samples arrive",
            "E-commerce stores needing uniform, high-conversion product photography at scale",
            "Consumer packaged goods (CPG), cosmetics, electronics, and luxury merchandise brands",
        ],
        process: [
            {
                title: "Asset & Material Ingestion",
                body: "We review your 3D models or reference packaging graphics, CAD files, and material swatches.",
            },
            {
                title: "Shader Setup & PBR Tuning",
                body: "We dial in photorealistic material physics—refraction, sub-surface scattering, metallic gloss, and label finishes.",
            },
            {
                title: "Studio Lighting & Camera Angles",
                body: "We build customized 3-point and HDR studio lighting setups to accentuate contours and eliminate glare.",
            },
            {
                title: "Multi-Pass High-Res Rendering",
                body: "We render out raw multi-pass layers (diffuse, reflections, shadows, ambient occlusion, depth).",
            },
            {
                title: "Retouching & Format Delivery",
                body: "We color-grade, apply final post-processing, and export ready-to-upload web and high-DPI print files.",
            },
        ],
        faqs: [
            {
                q: "Can you render products from 2D label graphics and packaging dielines?",
                a: "Yes. If you have packaging dielines, PDF labels, and dimensions, we can construct the 3D bottle, box, tube, or pouch and wrap the artwork seamlessly.",
            },
            {
                q: "Are the renders suitable for large-format print as well as websites?",
                a: "Yes. We render at whatever resolution is needed—from optimized 2000x2000px web squares to 300 DPI 8K images suitable for billboards, trade show booths, and retail packaging.",
            },
            {
                q: "How do you ensure the materials match the physical product?",
                a: "We use Physically Based Rendering (PBR) workflows calibrated against physical photo references, Pantone codes, and real-world material properties to ensure exact color and sheen accuracy.",
            },
        ],
        timeline: "1–2 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.emerald || ACCENTS.blue,
        seo: {
            title: "Photorealistic 3D Product Rendering Services & CGI Studio",
            description:
                "Studio-grade 3D product rendering services: photorealistic CGI, white background e-commerce cutouts, multi-angle hero renders, and packaging visualization.",
            keywords: [
                "product rendering services",
                "3d product rendering",
                "photorealistic cgi rendering",
                "ecommerce product renders",
                "3d studio rendering",
                "commercial product cgi",
            ],
        },
    },
    {
        slug: "brand-identity",
        title: "Brand Identity",
        group: "creative-branding",
        icon: "Sparkles",
        tagline:
            "Distinctive visual systems and brand guidelines that build authority, trust, and memorability.",
        summary:
            "Crafting complete brand identity systems—from logo suites and typography to color palettes and brand style guides—that remain consistent across every touchpoint.",
        intro: [
            "A brand is far more than just a standalone logo; it is the entire visual and emotional impression your company leaves behind. When branding is fragmented, inconsistent, or outdated across packaging, websites, and social media, potential customers lose trust.",
            "We build cohesive, versatile brand identity systems engineered for longevity. From strategic typography pairings and balanced color palettes to dynamic logo variations and comprehensive brand style guides, we give your business an unmistakable, professional identity that stands out in competitive markets.",
        ],
        deliverables: [
            "Primary, secondary, and sub-mark logo suites (monochrome, color, horizontal, vertical)",
            "Curated brand color palette with Hex, RGB, CMYK, and Pantone (PMS) specifications",
            "Typography hierarchy system (headline, sub-headline, body, and accent font pairings)",
            "Comprehensive Brand Guidelines PDF detailing clear space, rules, and misuse guidelines",
            "Social media starter kit (profile badges, banner templates, story & feed assets)",
            "Stationery & collateral design (business cards, letterheads, email signatures, presentation decks)",
            "Full vector and web-ready source asset exports (AI, EPS, SVG, PNG, PDF)",
        ],
        idealFor: [
            "New businesses and startups launching into the market wanting to establish instant credibility",
            "Established companies undergoing a brand refresh or full market repositioning",
            "E-commerce and DTC brands seeking visual consistency across packaging, web, and ads",
        ],
        process: [
            {
                title: "Discovery & Brand Strategy",
                body: "We explore your core mission, target demographics, market positioning, and competitor landscape to define a clear creative direction.",
            },
            {
                title: "Concept Exploration & Moodboards",
                body: "We develop 2–3 distinct visual identity concepts presenting moodboards, logo archetypes, and color directions.",
            },
            {
                title: "Identity Refinement & System Design",
                body: "Once the winning concept is chosen, we refine the logo geometry, typography scale, icon marks, and color tokens.",
            },
            {
                title: "Collateral & Touchpoint Application",
                body: "We apply the identity across realistic mockups, stationery, social templates, and packaging to ensure universal adaptability.",
            },
            {
                title: "Style Guide & Asset Package",
                body: "We organize and export all production-ready master vector files alongside a detailed brand manual.",
            },
        ],
        faqs: [
            {
                q: "What file formats will I receive upon completion?",
                a: "You receive all master source files (Adobe Illustrator .AI, Figma), vector files (EPS, SVG, PDF), and high-resolution web formats (PNG with transparency, JPG).",
            },
            {
                q: "How many initial logo and brand concepts do you present?",
                a: "We deliver 2 to 3 distinct strategic visual concepts during the initial exploration phase, complete with real-world application mockups.",
            },
            {
                q: "Can you refresh our existing logo instead of creating a completely new one?",
                a: "Yes. We offer brand evolutions where we modernize, balance, and clean up your existing logo while upgrading your typography, color tokens, and guidelines.",
            },
        ],
        timeline: "2–4 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.violet || ACCENTS.emerald,
        seo: {
            title: "Brand Identity Design Services & Brand Guidelines",
            description:
                "Complete brand identity design: custom logo systems, typography palettes, brand guidelines, and marketing collateral for modern businesses.",
            keywords: [
                "brand identity design",
                "logo design agency",
                "brand style guidelines",
                "corporate visual identity",
                "branding agency",
                "brand design system",
            ],
        },
    },
    {
        slug: "graphic-design",
        title: "Graphic Design",
        group: "creative-branding",
        icon: "Palette",
        tagline:
            "High-impact marketing assets, packaging design, and visual creatives tailored to convert.",
        summary:
            "Produce high-converting ad creatives, packaging & label artwork, social media kits, and print collateral that amplify your brand across every channel.",
        intro: [
            "In a crowded digital marketplace, amateur or mismatched visual collateral instantly degrades perceived product quality. Every customer touchpoint—from social ads and packaging to marketing brochures—must communicate premium value.",
            "We create polished, conversion-focused graphic design assets crafted specifically for your audience. Whether you need retail packaging dielines, Amazon EBC graphics, promotional flyers, or performance ad sets, we deliver production-ready, pixel-perfect visuals built to sell.",
        ],
        deliverables: [
            "Custom product packaging and label artwork with print-ready bleed & dieline setups",
            "High-converting paid ad creatives for Meta, Google, and TikTok (statics, carousels, banners)",
            "Social media content kits (feed post templates, story graphics, highlighted covers)",
            "Marketing collateral: brochures, flyers, catalogs, roll-up banners, and sales line sheets",
            "E-commerce listing infographics and promotional hero banners",
            "Pitch decks, presentation templates, and corporate whitepaper layouts",
            "Full vector master files and web/print exports (AI, PSD, PDF, SVG, PNG)",
        ],
        idealFor: [
            "DTC and retail brands needing standout packaging and label designs",
            "E-commerce businesses running regular promotional campaigns and social media ads",
            "Marketing teams looking for a reliable, fast-turnaround creative production partner",
        ],
        process: [
            {
                title: "Creative Brief & Specifications",
                body: "We review your brand guidelines, project requirements, target dimensions, and dieline/technical specs.",
            },
            {
                title: "Concept Exploration",
                body: "We explore distinct design directions, typographic treatments, and layout hierarchies for your review.",
            },
            {
                title: "Asset Refinement & Polish",
                body: "We refine the approved concept, aligning colors, typography, imagery, and copywriting across the full deliverable suite.",
            },
            {
                title: "Preflight & Quality Check",
                body: "We verify print color profiles (CMYK/Pantone), resolution (300 DPI), bleed margins, and digital compression standards.",
            },
            {
                title: "Final Export & Delivery",
                body: "We package organized master source files and lightweight web-ready exports organized by format and channel.",
            },
        ],
        faqs: [
            {
                q: "Do you supply print-ready files with dielines and bleed margins?",
                a: "Yes. All print and packaging deliverables are delivered with precise printer specs—including CMYK color profiles, cut lines, bleed margins, and high-resolution 300 DPI PDFs.",
            },
            {
                q: "Can you design ongoing ad creatives and social graphics on a monthly basis?",
                a: "Yes. We offer both single-project scopes and dedicated monthly creative retainers for brands that need a steady flow of fresh ad variants and social assets.",
            },
            {
                q: "Do I get full access to the editable source files?",
                a: "Yes. You receive all editable Adobe Illustrator (.AI), Photoshop (.PSD), or Figma source files along with all linked fonts and exported asset packages.",
            },
        ],
        timeline: "1–3 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.emerald || ACCENTS.blue,
        seo: {
            title: "Graphic Design Services — Packaging, Social & Marketing Creatives",
            description:
                "Professional graphic design services: custom packaging design, ad creatives, social media kits, brochures, and print collateral with editable source files.",
            keywords: [
                "graphic design services",
                "packaging design agency",
                "ad creative design",
                "marketing collateral design",
                "social media graphic design",
                "commercial graphic designer",
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
        slug: "motion-graphics",
        title: "Motion Graphics",
        group: "animation-video",
        icon: "Clapperboard",
        tagline:
            "Dynamic 2D/3D kinetic design, animated typography, and promotional motion assets.",
        summary:
            "Transform static brand elements, complex ideas, and interface flows into engaging, high-retention motion graphics.",
        intro: [
            "Static visuals often get scrolled past in fast-moving social feeds and landing pages. When communicating abstract technology, financial workflows, or software features, motion is the most efficient way to capture attention and clarify value.",
            "We craft bespoke motion graphics that combine kinetic typography, fluid shape transitions, 2D/3D graphic design, and custom sound design. From social promo reels and explainer graphics to UI interaction animations and event screen loops, we deliver dynamic visuals engineered for high viewer retention.",
        ],
        deliverables: [
            "Dynamic 2D & 3D kinetic typography and title sequences",
            "Brand identity in motion: animated logos, idents, and lower thirds",
            "Product feature callouts, animated infographics, and stat counters",
            "High-energy paid ad cuts and promotional motion reels (Meta, TikTok, YouTube, LinkedIn)",
            "App & web UI motion walkthroughs and micro-interaction animations (Lottie / MP4)",
            "Sound design, foley effects, and royalty-free music mixing",
            "Multi-aspect ratio masters (16:9 widescreen, 9:16 vertical, 1:1 square, 4:5 social)",
        ],
        idealFor: [
            "SaaS, fintech, and tech brands needing to explain complex platforms concisely",
            "E-commerce businesses running high-velocity video ad campaigns",
            "Brands wanting animated logo stingers and social media video templates",
        ],
        process: [
            {
                title: "Concept & Narrative Scripting",
                body: "We define core messaging, visual metaphors, pacing, and draft a structured narrative script.",
            },
            {
                title: "Styleframes & Storyboarding",
                body: "We design static high-fidelity keyframes so you can approve the look, colors, and layout before animation begins.",
            },
            {
                title: "Motion Design & Rigging",
                body: "We animate vectors, typography, 3D elements, and transitions with natural physics and smooth easing curves.",
            },
            {
                title: "Sound Design & Audio Mix",
                body: "We layer immersive sound effects, whooshes, clicks, ambient beds, and licensed background music.",
            },
            {
                title: "Multi-Format Export & Handover",
                body: "We render out platform-optimized video masters (ProRes, H.264, web-ready MP4, and lightweight Lottie JSON).",
            },
        ],
        faqs: [
            {
                q: "What software do you use for motion graphics?",
                a: "We primarily work in Adobe After Effects, Cinema 4D, Blender, Illustrator, and Premiere Pro, alongside specialized plugins for physics, particle systems, and kinetic typography.",
            },
            {
                q: "Can you deliver lightweight web animations like Lottie files?",
                a: "Yes. For web applications and interactive landing pages, we can export lightweight, vector-based Lottie (JSON) or optimized MP4/WebM files that load instantly without slowing down your site.",
            },
            {
                q: "Do you provide voiceovers and music?",
                a: "Yes. We source licensed commercial music, custom sound effects (SFX), and can integrate professional human voiceovers in multiple accents and languages.",
            },
        ],
        timeline: "1–3 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.violet || ACCENTS.blue,
        seo: {
            title: "Motion Graphics Design & Kinetic Animation Studio",
            description:
                "Professional motion graphics design services: animated typography, kinetic social promo ads, UI motion design, animated explainer graphics, and logo idents.",
            keywords: [
                "motion graphics services",
                "motion design studio",
                "kinetic typography animation",
                "animated promo videos",
                "social media motion design",
                "ui motion graphics",
            ],
        },
    },
    {
        slug: "video-production",
        title: "Video Production",
        group: "animation-video",
        icon: "Video",
        tagline:
            "Cinematic brand films, high-converting product ads, and commercial video editing.",
        summary:
            "Full-spectrum video production—from concept scripting and storyboarding to post-production editing, motion grading, and ad variation cuts.",
        intro: [
            "Video is the highest-converting medium on the internet, but low-effort footage or disjointed pacing can damage brand credibility. To stop the scroll and drive conversions, your videos need sharp narrative structure, cinematic visuals, and platform-native pacing.",
            "We produce commercial-grade product films, promotional campaign videos, and performance ad edits. By combining live-action footage, studio product staging, dynamic motion graphics, and professional sound design, we create videos engineered to capture attention and convert viewers into customers.",
        ],
        deliverables: [
            "Creative concept development, scripting, and visual storyboarding",
            "Live-action & studio footage editing, color grading, and audio mastering",
            "Direct-response paid video ad batches with multiple hook and CTA variations",
            "Brand documentary, founder story, and company showcase videos",
            "Product launch trailers, unboxing showcases, and commercial feature films",
            "Dynamic sound design, foley, voiceover synchronization, and licensed music",
            "Multi-platform master exports (16:9 widescreen, 9:16 vertical, 1:1 square, 4:5 social)",
        ],
        idealFor: [
            "DTC and e-commerce brands scaling paid social on TikTok, Meta, and YouTube",
            "Companies launching a flagship product or major brand campaign",
            "Businesses wanting high-production customer testimonials, brand films, or commercial ads",
        ],
        process: [
            {
                title: "Pre-Production & Scripting",
                body: "We define the core objective, draft script angles, plan shot lists, and establish visual style references.",
            },
            {
                title: "Production & Asset Assembly",
                body: "We coordinate filming, studio footage capture, or organize provided raw footage libraries.",
            },
            {
                title: "Post-Production & Assembly",
                body: "We edit narrative pacing, integrate graphic overlays, and construct multiple hook variations.",
            },
            {
                title: "Color Grading & Sound Design",
                body: "We apply cinematic color treatment, sync sound effects, master dialogue/voiceovers, and mix background audio.",
            },
            {
                title: "Platform Mastering & Delivery",
                body: "We render high-bitrate ProRes/H.264 files optimized for web, YouTube, broadcast, and paid ad platforms.",
            },
        ],
        faqs: [
            {
                q: "Can you edit footage that our team has already filmed?",
                a: "Yes. We regularly handle post-production for clients who supply raw video, product clips, or event footage—providing professional cutting, sound design, color grading, and motion graphics.",
            },
            {
                q: "Do you deliver multiple aspect ratios for social media?",
                a: "Yes. Every video can be delivered in widescreen (16:9 for YouTube/Web), vertical (9:16 for Reels/TikTok/Shorts), and square (1:1/4:5 for feed ads).",
            },
            {
                q: "Are the background music tracks and voiceovers fully licensed?",
                a: "Yes. All music, sound effects, and voiceover recordings come with full commercial usage rights for digital and paid advertising distribution.",
            },
        ],
        timeline: "2–4 weeks",
        startingAt: "Custom quote",
        accent: ACCENTS.violet || ACCENTS.blue,
        seo: {
            title: "Commercial Video Production & Video Editing Agency",
            description:
                "Professional video production services: commercial product videos, brand films, paid social video ads, cinematic editing, and sound design.",
            keywords: [
                "video production services",
                "commercial video production",
                "video editing agency",
                "ecommerce video ads",
                "brand video production",
                "product promotional video",
            ],
        },
    },

    /* ----------------------- Marketing & Growth -------------------------- */
    {
        slug: "seo",
        title: "SEO",
        group: "marketing-growth",
        icon: "Search",
        tagline:
            "Data-driven technical, on-page, and authority SEO that compounds long-term organic revenue.",
        summary:
            "Improve your search visibility, dominate high-intent keywords, and attract ready-to-buy organic traffic to your website.",
        intro: [
            "Ranking on Google isn’t about keyword stuffing or buying low-quality backlink packages. Search engines reward websites with flawless technical architecture, fast page experiences, clear semantic content structures, and genuine topical authority.",
            "We engineer comprehensive SEO strategies designed around commercial intent. From fixing deep technical debt, schema markup, and Core Web Vitals to optimizing high-intent landing pages and building authoritative content clusters, we help your business capture sustainable, compounding organic revenue.",
        ],
        deliverables: [
            "Comprehensive technical SEO audit: crawlability, indexing, canonicals, and site architecture",
            "Commercial keyword research and search intent mapping per target URL",
            "On-page optimization: titles, meta tags, H-tag hierarchy, URL slugs, and internal linking",
            "Schema.org structured data implementation (Organization, Product, Service, FAQ)",
            "Core Web Vitals and mobile performance optimization for search crawl budgets",
            "Content gap analysis and strategic blog/article editorial calendar briefs",
            "Monthly reporting on organic traffic, keyword ranking movements, and conversion attribution",
        ],
        idealFor: [
            "Businesses struggling with low search visibility or relying too heavily on expensive paid ads",
            "E-commerce stores and service agencies launching new product or service verticals",
            "Websites experiencing organic traffic drops following a redesign or platform migration",
        ],
        process: [
            {
                title: "Technical Audit & Crawl Analysis",
                body: "We perform an in-depth audit using Google Search Console and crawling tools to detect indexing roadblocks, broken redirects, and speed bottlenecks.",
            },
            {
                title: "Keyword & Intent Mapping",
                body: "We identify high-volume, high-intent search queries and map them directly to dedicated landing pages and conversion funnels.",
            },
            {
                title: "On-Page & Schema Implementation",
                body: "We rewrite metadata, optimize page copy for semantic relevance, structure internal links, and add rich snippet schema.",
            },
            {
                title: "Content Strategy & Clustering",
                body: "We publish targeted, authoritative content clusters that answer customer questions and build topical domain authority.",
            },
            {
                title: "Monitoring & Conversion Tracking",
                body: "We monitor keyword position gains, organic click-through rates (CTR), and conversion events, continually refining based on data.",
            },
        ],
        faqs: [
            {
                q: "How long does it typically take to see measurable SEO results?",
                a: "Technical fixes and on-page improvements often show initial crawl improvements within 3 to 6 weeks. Significant competitive keyword ranking growth and revenue compounding typically materialize over 3 to 6 months of consistent execution.",
            },
            {
                q: "Do you provide guaranteed number-one rankings on Google?",
                a: "No ethical agency can guarantee specific rank positions because search algorithms fluctuate constantly. What we guarantee is rigorous, best-practice technical execution, high-intent targeting, transparent reporting, and proven ranking methodology.",
            },
            {
                q: "Can you protect our SEO rankings during a website redesign or migration?",
                a: "Yes. We manage pre-launch and post-launch migration checklists—including full 1:1 URL redirect mapping, metadata transfer, and crawl monitoring—to prevent traffic and ranking drops.",
            },
        ],
        timeline: "Ongoing (3-month minimum)",
        startingAt: "Monthly retainer",
        accent: ACCENTS.emerald || ACCENTS.blue,
        seo: {
            title: "Search Engine Optimization (SEO) Services & Technical Strategy",
            description:
                "Results-driven SEO services: technical audits, commercial keyword research, on-page optimization, schema markup, and long-term organic growth strategy.",
            keywords: [
                "seo services",
                "search engine optimization agency",
                "technical seo audit",
                "ecommerce seo agency",
                "on page seo optimization",
                "organic search strategy",
            ],
        },
    },
    {
        slug: "google-ads",
        title: "Google Ads",
        group: "marketing-growth",
        icon: "Target",
        tagline:
            "High-intent search, Performance Max, and Shopping campaigns managed against profit and ROAS.",
        summary:
            "Capture ready-to-buy search traffic and scale qualified leads with precision-targeted Google Search, Shopping, and Display campaigns.",
        intro: [
            "Google Ads is the fastest way to put your product or service in front of people actively searching to buy. However, without negative keyword pruning, proper bidding strategies, and conversion tracking, ad budgets quickly get wasted on irrelevant clicks and low-intent searches.",
            "We build, manage, and scale high-performance Google Ads campaigns. From granular single-intent Search ad groups and Google Merchant Center Shopping feeds to smart Performance Max (PMax) campaigns and remarketing, every dollar spent is tracked against cost per acquisition (CPA) and return on ad spend (ROAS).",
        ],
        deliverables: [
            "Server-side conversion tracking & Google Tag Manager (GTM) event integration",
            "High-intent commercial keyword research and extensive negative keyword lists",
            "Google Search ad copywriting with responsive ad variants and asset extensions",
            "Google Merchant Center setup, product feed optimization, and Shopping campaigns",
            "Performance Max (PMax) campaign configuration with audience signal curation",
            "Landing page conversion rate review and message-match optimization",
            "Bi-weekly bid adjustments, search term pruning, and transparent ROAS reporting",
        ],
        idealFor: [
            "E-commerce stores wanting to scale Google Shopping and Performance Max revenue",
            "Service-based businesses requiring a predictable flow of qualified inbound leads",
            "Brands spending money on Google Ads without clear conversion attribution or positive ROAS",
        ],
        process: [
            {
                title: "Tracking & Conversion Audit",
                body: "We audit or install Google Tag Manager and GA4 conversion tracking to ensure every lead, call, and checkout is accurately credited.",
            },
            {
                title: "Keyword & Competitor Research",
                body: "We identify high-intent commercial keywords, analyze competitor bidding, and build comprehensive negative keyword filters.",
            },
            {
                title: "Account Structure & Ad Copywriting",
                body: "We write compelling responsive search ads, set up structured asset extensions (sitelinks, callouts, promos), and organize themed ad groups.",
            },
            {
                title: "Bidding & Campaign Launch",
                body: "We launch with targeted bid strategies (Target CPA / Target ROAS) and audience signals to ramp up quality search traffic.",
            },
            {
                title: "Optimization & Scaling",
                body: "We review search terms weekly, prune budget-wasting clicks, test ad copy, and scale spend into top-performing keywords.",
            },
        ],
        faqs: [
            {
                q: "Who owns the Google Ads account?",
                a: "You retain 100% ownership of your Google Ads and Google Analytics accounts. We operate with agency manager access, ensuring you keep all historical data and campaign assets.",
            },
            {
                q: "How much should I spend on ad budget each month?",
                a: "Ad spend depends on your industry's cost-per-click (CPC), but we generally recommend a minimum ad budget of $1,500–$3,000/month separate from our management fee to gather statistical conversion data quickly.",
            },
            {
                q: "Do you handle Google Shopping and Merchant Center feeds?",
                a: "Yes. We set up Google Merchant Center, fix feed errors, optimize product titles/attributes for search relevance, and structure high-converting Standard Shopping and PMax campaigns.",
            },
        ],
        timeline: "Ongoing (3-month minimum)",
        startingAt: "Monthly retainer",
        accent: ACCENTS.blue || ACCENTS.emerald,
        seo: {
            title: "Google Ads Management Services & PPC Agency",
            description:
                "ROI-driven Google Ads management: Search campaigns, Google Shopping, Performance Max, conversion tracking, and PPC optimization for growing brands.",
            keywords: [
                "google ads management",
                "google ppc agency",
                "google shopping management",
                "performance max agency",
                "pay per click marketing",
                "google search ads agency",
            ],
        },
    },
    {
        slug: "social-media-marketing",
        title: "Social Media Marketing",
        group: "marketing-growth",
        icon: "Share2",
        tagline:
            "Strategic organic content, community building, and engagement funnels that turn followers into brand advocates.",
        summary:
            "Grow your audience, increase brand awareness, and build an active community across Instagram, TikTok, LinkedIn, and YouTube.",
        intro: [
            "Posting randomly without a cohesive content strategy wastes valuable time and creative energy. Social media algorithms favor consistency, high-retention storytelling, visual identity, and genuine community engagement.",
            "We build and execute tailored social media marketing strategies that build brand authority and drive customer action. From content calendars, short-form video concepts, and carousel designs to community moderation and growth analytics, we transform your social channels into predictable engagement and acquisition funnels.",
        ],
        deliverables: [
            "Channel audit, competitive benchmarking, and target audience persona mapping",
            "Monthly content calendar with structured pillars (educational, entertaining, promotional, social proof)",
            "Static graphic posts, carousel sets, and infographic design",
            "Short-form video editing and scripting for Reels, TikTok, and YouTube Shorts",
            "Engaging caption copywriting, hashtag strategy, and call-to-action (CTA) mapping",
            "Active community engagement guidance and comment/DM response workflows",
            "Monthly performance analytics tracking reach, engagement rate, profile visits, and link clicks",
        ],
        idealFor: [
            "Brands wanting a consistent, professional presence across social feeds without in-house overhead",
            "E-commerce & DTC companies looking to build a loyal community around their products",
            "B2B firms and founders seeking to establish thought leadership on LinkedIn and YouTube",
        ],
        process: [
            {
                title: "Strategy & Visual Alignment",
                body: "We define your core content pillars, audience tone of voice, visual templates, and monthly publishing cadence.",
            },
            {
                title: "Content Creation & Scheduling",
                body: "We write copy, design graphics, edit video reels, and batch-schedule posts in advance for your approval.",
            },
            {
                title: "Publishing & Distribution",
                body: "We post across your active platforms during peak audience hours with optimized formats and audio trends.",
            },
            {
                title: "Community & Interaction",
                body: "We foster active engagement with your audience, initiate conversations, and amplify user-generated content.",
            },
            {
                title: "Analytics & Iteration",
                body: "We review top-performing post formats, follower retention, and referral traffic to refine the next month's strategy.",
            },
        ],
        faqs: [
            {
                q: "Which social media platforms do you manage?",
                a: "We develop and manage strategies across Instagram, TikTok, LinkedIn, YouTube, Facebook, and X (Twitter), focusing on the channels where your target customers are most active.",
            },
            {
                q: "Do we get to review and approve posts before they go live?",
                a: "Yes. Every piece of copy, graphic, and video is organized in a monthly content calendar for your review and sign-off before being scheduled.",
            },
            {
                q: "How does organic social media marketing differ from paid advertising?",
                a: "Organic social marketing focuses on building brand loyalty, organic trust, retention, and community over time, whereas paid ads focus on immediate, scalable conversion and direct acquisition.",
            },
        ],
        timeline: "Ongoing (3-month minimum)",
        startingAt: "Monthly retainer",
        accent: ACCENTS.violet || ACCENTS.blue,
        seo: {
            title: "Social Media Marketing & Content Strategy Agency",
            description:
                "Results-driven social media marketing services: organic content strategy, short-form video reels, community engagement, and multi-channel brand growth.",
            keywords: [
                "social media marketing agency",
                "social media management",
                "instagram growth strategy",
                "tiktok marketing agency",
                "organic social media content",
                "b2b linkedin marketing",
            ],
        },
    },
    {
        slug: "content-marketing",
        title: "Content Marketing",
        group: "marketing-growth",
        icon: "FileText",
        tagline:
            "High-intent editorial strategy, authoritative storytelling, and conversion-focused content funnels.",
        summary:
            "Produce search-optimized articles, lead magnets, case studies, and email newsletters that educate your audience and drive conversions.",
        intro: [
            "Content marketing is not about publishing generic blog posts that nobody reads. Without clear search intent, strategic distribution, and distinct brand perspective, content production turns into an expensive vanity project.",
            "We build comprehensive content ecosystems designed to answer your customers' highest-intent questions. From in-depth technical guides, customer case studies, and whitepapers to automated email nurture sequences, we craft narrative assets that build authority, educate prospects, and drive measurable pipeline growth.",
        ],
        deliverables: [
            "Editorial content strategy and thematic topical cluster mapping",
            "SEO-driven long-form articles, guides, and thought leadership essays",
            "Lead magnets & conversion assets (whitepapers, e-books, industry reports, cheat sheets)",
            "Customer success case studies and narrative client spotlight stories",
            "Email marketing newsletters and automated onboarding/lead nurture sequences",
            "Content repurposing workflows (turning long-form assets into social carousels and threads)",
            "Monthly performance tracking covering organic reads, lead captures, and assisted conversions",
        ],
        idealFor: [
            "B2B firms and SaaS companies wanting to build industry domain authority",
            "DTC brands needing storytelling to explain product differentiation and build retention",
            "Service businesses looking to turn organic site visitors into qualified inbound leads",
        ],
        process: [
            {
                title: "Audience & Narrative Strategy",
                body: "We map your buyer personas, purchase objections, and industry questions to define your core editorial pillars.",
            },
            {
                title: "Topic Research & SEO Clustering",
                body: "We identify high-intent search queries and industry talking points to build a high-impact editorial calendar.",
            },
            {
                title: "Research, Writing & Editing",
                body: "We research and draft authoritative, publication-ready copy complete with custom data tables, infographics, and CTAs.",
            },
            {
                title: "Lead Magnet & Funnel Integration",
                body: "We set up lead capture forms, gated asset downloads, and automated email follow-up workflows.",
            },
            {
                title: "Distribution & Performance Review",
                body: "We distribute across your newsletter and social channels, tracking engagement, time on page, and conversion metrics.",
            },
        ],
        faqs: [
            {
                q: "How do you ensure the content aligns with our brand tone and technical accuracy?",
                a: "We start with a brand voice workshop and subject-matter briefing, establishing a comprehensive style guide and review workflow before drafting begins.",
            },
            {
                q: "Is SEO included in your content marketing services?",
                a: "Yes. Every long-form asset includes thorough keyword mapping, heading structure optimization, meta descriptions, internal linking, and image alt text.",
            },
            {
                q: "Do you write email newsletters and lead capture sequences as well?",
                a: "Yes. We create automated welcome series, promotional broadcast campaigns, and recurring editorial newsletters to nurture and retain your subscribers.",
            },
        ],
        timeline: "Ongoing (3-month minimum)",
        startingAt: "Monthly retainer",
        accent: ACCENTS.emerald || ACCENTS.blue,
        seo: {
            title: "Content Marketing Agency & Editorial Strategy Services",
            description:
                "Strategic content marketing services: SEO-driven long-form articles, lead magnets, case studies, email newsletters, and authority-building editorial funnels.",
            keywords: [
                "content marketing services",
                "b2b content marketing agency",
                "content strategy agency",
                "seo content writing",
                "lead magnet development",
                "email newsletter marketing",
            ],
        },
    },
    {
        slug: "paid-advertising",
        title: "Paid Advertising",
        group: "marketing-growth",
        icon: "FileText",
        tagline:
            "High-intent editorial strategy, authoritative storytelling, and conversion-focused content funnels.",
        summary:
            "Produce search-optimized articles, lead magnets, case studies, and email newsletters that educate your audience and drive conversions.",
        intro: [
            "Content marketing is not about publishing generic blog posts that nobody reads. Without clear search intent, strategic distribution, and distinct brand perspective, content production turns into an expensive vanity project.",
            "We build comprehensive content ecosystems designed to answer your customers' highest-intent questions. From in-depth technical guides, customer case studies, and whitepapers to automated email nurture sequences, we craft narrative assets that build authority, educate prospects, and drive measurable pipeline growth.",
        ],
        deliverables: [
            "Editorial content strategy and thematic topical cluster mapping",
            "SEO-driven long-form articles, guides, and thought leadership essays",
            "Lead magnets & conversion assets (whitepapers, e-books, industry reports, cheat sheets)",
            "Customer success case studies and narrative client spotlight stories",
            "Email marketing newsletters and automated onboarding/lead nurture sequences",
            "Content repurposing workflows (turning long-form assets into social carousels and threads)",
            "Monthly performance tracking covering organic reads, lead captures, and assisted conversions",
        ],
        idealFor: [
            "B2B firms and SaaS companies wanting to build industry domain authority",
            "DTC brands needing storytelling to explain product differentiation and build retention",
            "Service businesses looking to turn organic site visitors into qualified inbound leads",
        ],
        process: [
            {
                title: "Audience & Narrative Strategy",
                body: "We map your buyer personas, purchase objections, and industry questions to define your core editorial pillars.",
            },
            {
                title: "Topic Research & SEO Clustering",
                body: "We identify high-intent search queries and industry talking points to build a high-impact editorial calendar.",
            },
            {
                title: "Research, Writing & Editing",
                body: "We research and draft authoritative, publication-ready copy complete with custom data tables, infographics, and CTAs.",
            },
            {
                title: "Lead Magnet & Funnel Integration",
                body: "We set up lead capture forms, gated asset downloads, and automated email follow-up workflows.",
            },
            {
                title: "Distribution & Performance Review",
                body: "We distribute across your newsletter and social channels, tracking engagement, time on page, and conversion metrics.",
            },
        ],
        faqs: [
            {
                q: "How do you ensure the content aligns with our brand tone and technical accuracy?",
                a: "We start with a brand voice workshop and subject-matter briefing, establishing a comprehensive style guide and review workflow before drafting begins.",
            },
            {
                q: "Is SEO included in your content marketing services?",
                a: "Yes. Every long-form asset includes thorough keyword mapping, heading structure optimization, meta descriptions, internal linking, and image alt text.",
            },
            {
                q: "Do you write email newsletters and lead capture sequences as well?",
                a: "Yes. We create automated welcome series, promotional broadcast campaigns, and recurring editorial newsletters to nurture and retain your subscribers.",
            },
        ],
        timeline: "Ongoing (3-month minimum)",
        startingAt: "Monthly retainer",
        accent: ACCENTS.emerald || ACCENTS.blue,
        seo: {
            title: "Content Marketing Agency & Editorial Strategy Services",
            description:
                "Strategic content marketing services: SEO-driven long-form articles, lead magnets, case studies, email newsletters, and authority-building editorial funnels.",
            keywords: [
                "content marketing services",
                "b2b content marketing agency",
                "content strategy agency",
                "seo content writing",
                "lead magnet development",
                "email newsletter marketing",
            ],
        },
    },

    /* ----------------------- Dedicated Team -------------------------- */
    {
        slug: "3-team-members",
        title: "3 Team Members",
        group: "dedicated-team",
        icon: "Users",
        tagline:
            "A dedicated, embedded 3-person production pod designed to execute your design and engineering roadmap.",
        summary:
            "Scale your output with an agile 3-member team—typically a Lead Designer, Full-Stack Developer, and Technical Project Lead—integrated directly into your daily workflow.",
        intro: [
            "Hiring, vetting, and onboarding full-time in-house talent takes months and introduces high overhead costs and management friction. When your project demands continuous design iterations, feature builds, and rapid technical delivery, an embedded team pod provides immediate execution power.",
            "Our 3-member dedicated team operates as a natural extension of your company. With cross-functional capabilities spanning UI/UX design, full-stack web development, and agile project delivery, this pod gives you the momentum of an in-house department with the flexibility and speed of a specialized agency.",
        ],
        deliverables: [
            "Dedicated cross-functional team pod (e.g., Senior Designer, Full-Stack Engineer, Project Lead)",
            "100% focused allocation with daily standups and direct communication via Slack/Teams",
            "Continuous UI/UX design, web application development, and e-commerce maintenance",
            "Sprint planning, backlog prioritization, and transparent task management via Jira/Linear/ClickUp",
            "Real-time code reviews, continuous deployment (CI/CD), and QA verification",
            "Flexible skill reallocation based on changing sprint requirements",
            "Weekly velocity reports and bi-weekly executive alignment reviews",
        ],
        idealFor: [
            "Fast-moving startups needing to accelerate product roadmap delivery without hiring delays",
            "Growing brands managing multiple simultaneous design and engineering initiatives",
            "Agencies looking to expand production capacity without increasing full-time headcount",
        ],
        process: [
            {
                title: "Needs Assessment & Pod Assembly",
                body: "We assess your roadmap, tech stack, and workflow to assemble the precise 3-person talent combination you need.",
            },
            {
                title: "Onboarding & Tooling Setup",
                body: "We integrate into your Slack, GitHub, Linear/Jira, and Figma workspaces, setting up access and communication protocols.",
            },
            {
                title: "Sprint Planning & Backlog Execution",
                body: "We structure work into 2-week agile sprints, breaking objectives into clear tickets with defined acceptance criteria.",
            },
            {
                title: "Daily Standups & Continuous Delivery",
                body: "We execute daily tasks, push reviewed code to staging, share design files, and provide daily async progress updates.",
            },
            {
                title: "Sprint Review & Retrospective",
                body: "At the end of each sprint, we review shipped milestones, measure velocity, and refine goals for the upcoming sprint.",
            },
        ],
        faqs: [
            {
                q: "How does communication and task management work with the team?",
                a: "The team integrates directly into your existing communication and management tools (Slack, Teams, Linear, Jira, Asana, or ClickUp) and participates in daily or async standups just like an in-house team.",
            },
            {
                q: "Can we customize the roles within the 3-member pod?",
                a: "Yes. Common configurations include [1 Designer + 1 Frontend Developer + 1 Backend Developer], [1 UI/UX Designer + 1 Shopify Developer + 1 QA/PM], or [1 3D Artist + 1 Motion Designer + 1 Graphic Designer]. We tailor the roster to your current roadmap.",
            },
            {
                q: "What is the minimum commitment period for a dedicated team?",
                a: "We work on flexible monthly retainer agreements with a standard 3-month initial commitment, allowing sufficient time to onboard, establish velocity, and achieve major milestones.",
            },
        ],
        timeline: "Ongoing (Monthly retainer, 3-month min)",
        startingAt: "Monthly retainer",
        accent: ACCENTS.indigo || ACCENTS.blue,
        seo: {
            title: "Dedicated 3-Member Team | Remote Design & Engineering Pod",
            description:
                "Hire a dedicated 3-member remote production team: UI/UX designers, full-stack engineers, and project leads embedded directly into your business workflows.",
            keywords: [
                "dedicated development team",
                "embedded agency team",
                "remote engineering pod",
                "dedicated design and development team",
                "startup tech team outsourcing",
                "staff augmentation pod",
            ],
        },
    },
    {
        slug: "full-month-dedicated-team",
        title: "Full-Month Dedicated Team",
        group: "dedicated-team",
        icon: "Users",
        tagline:
            "An embedded, multi-disciplinary agency pod dedicated full-time to your design, 3D, and development roadmap.",
        summary:
            "Scale your organization's delivery capacity with a full-time, dedicated production team managing continuous design, development, and technical workflows with zero hiring friction.",
        intro: [
            "Scaling an internal team requires recruiting fees, weeks of technical vetting, management overhead, and high payroll commitments. When your business has an extensive roadmap spanning 3D rendering, brand design, web engineering, and product development, juggling fragmented freelancers slows down growth.",
            "Our Full-Month Dedicated Team model embeds a custom-tailored team of specialized designers, 3D artists, and developers directly into your company’s workflow. Operating with full-time bandwidth, structured sprints, and direct communication, your dedicated pod functions as your high-velocity in-house digital department.",
        ],
        deliverables: [
            "Fully dedicated, full-time multi-disciplinary team pod tailored to your tech stack",
            "Direct integration into your internal workspace (Slack, Microsoft Teams, Discord)",
            "Agile sprint planning, backlog management, and task tracking via Linear, Jira, or ClickUp",
            "Unlimited task queuing across UI/UX, 3D CGI, frontend/backend engineering, and motion",
            "Daily standups, continuous delivery pipelines, and staging deployments",
            "Dedicated Technical Project Lead ensuring code reviews, quality assurance, and timeline adherence",
            "Comprehensive monthly roadmap alignment reviews and velocity reporting",
        ],
        idealFor: [
            "Fast-scaling businesses and funded startups needing immediate execution without hiring cycles",
            "Agencies requiring a dedicated, white-label technical and creative production division",
            "Enterprise brands managing ongoing product maintenance, feature releases, and campaign collateral",
        ],
        process: [
            {
                title: "Roadmap & Team Architecture",
                body: "We review your upcoming product pipelines and technical stack to assemble the exact roster of talent required.",
            },
            {
                title: "Environment & Tooling Onboarding",
                body: "We set up repository access, design workspaces, staging servers, and communication channels for instant collaboration.",
            },
            {
                title: "Sprint Execution & Daily Output",
                body: "We work through your prioritized backlog in focused agile cycles with daily progress reporting.",
            },
            {
                title: "Continuous QA & Staging Reviews",
                body: "Every deliverable undergoes strict internal peer review, QA testing, and staging validation before sign-off.",
            },
            {
                title: "Retrospective & Capacity Planning",
                body: "We hold end-of-month reviews to analyze velocity, adjust skill allocations if necessary, and plan the next month's priorities.",
            },
        ],
        faqs: [
            {
                q: "How does the dedicated team integrate with our existing staff?",
                a: "The team integrates directly into your day-to-day communication tools (Slack/Teams) and project management boards (Linear/Jira/ClickUp), joining your standups and collaborating just like full-time employees.",
            },
            {
                q: "Can we swap skill sets as our project priorities shift?",
                a: "Yes. As your roadmap evolves—for example, moving from heavy UI/UX design to full-stack engineering or 3D product rendering—we can adjust pod composition at monthly renewal milestones.",
            },
            {
                q: "What is the commitment term for a full-month dedicated team?",
                a: "Our dedicated teams operate on a transparent monthly retainer model with no long-term lock-in beyond a standard 30-day notice period.",
            },
        ],
        timeline: "Ongoing (Full-time monthly engagement)",
        startingAt: "Monthly retainer",
        accent: ACCENTS.indigo || ACCENTS.blue,
        seo: {
            title: "Full-Month Dedicated Team | Embedded Creative & Tech Pods",
            description:
                "Hire a full-month dedicated design, 3D, and engineering team: embedded remote talent, full-time capacity, sprint-driven workflows, and zero recruitment overhead.",
            keywords: [
                "full month dedicated team",
                "dedicated agency pod",
                "embedded design team",
                "dedicated software developers",
                "remote product team",
                "staff augmentation agency",
            ],
        },
    },
    {
        slug: "flexible-team-support",
        title: "Flexible Team Support",
        group: "dedicated-team",
        icon: "UserCheck",
        tagline:
            "On-demand, fractional design and engineering support tailored to handle sudden spikes, backlog tasks, and specialized fixes.",
        summary:
            "Access agile, fractional technical and creative support on flexible terms—giving your team the exact bandwidth and skills needed without full-time commitments.",
        intro: [
            "Not every initiative requires a full-time, multi-person team. Often, what you need is a reliable, high-caliber engineering or design partner to step in for ad-hoc feature releases, bug fixes, urgent visual updates, or overflow support during peak seasons.",
            "Our Flexible Team Support model delivers fractional, on-demand agency resources when and where you need them most. Whether you need a senior developer for a few sprint tickets, a UI/UX designer for quick component variants, or a 3D artist to render new product iterations, you get instant expertise with zero management friction.",
        ],
        deliverables: [
            "Fractional access to specialized senior talent (UI/UX, Full-Stack, 3D CGI, Shopify, Motion)",
            "On-demand ticket execution and backlog grooming via Slack, Linear, Jira, or Trello",
            "Targeted feature development, bug fixes, and performance tuning",
            "Ad-hoc design asset production (social banners, packaging tweaks, UI mockups)",
            "Flexible hourly or fractional-time allocations adjusted to your workload",
            "Direct code reviews, staging pushes, and pull request approvals",
            "Transparent monthly hours tracking and roll-over balance options",
        ],
        idealFor: [
            "Teams needing dependable overflow capacity during product launches or peak seasons",
            "Companies with existing tech teams requiring niche expertise (3D rendering, custom Liquid, GSAP motion)",
            "Businesses wanting reliable ongoing maintenance and ad-hoc updates without hiring full-time staff",
        ],
        process: [
            {
                title: "Scope & Allocation Mapping",
                body: "We assess your expected monthly task volume and technical needs to establish the right fractional capacity tier.",
            },
            {
                title: "Quick Workspace Onboarding",
                body: "We connect to your communication channels and repository/task boards to begin processing tickets immediately.",
            },
            {
                title: "Task Queuing & Execution",
                body: "You submit tasks as they arise; we scope, assign the appropriate specialist, and execute with rapid turnaround.",
            },
            {
                title: "Review & Quality Verification",
                body: "Completed tasks undergo thorough internal testing and are delivered to your staging environment for approval.",
            },
            {
                title: "Usage Reporting & Review",
                body: "We provide regular transparency reports detailing completed items, hours utilized, and remaining capacity.",
            },
        ],
        faqs: [
            {
                q: "How does flexible team support differ from a full-month dedicated team?",
                a: "A dedicated team is a dedicated pod assigned full-time exclusively to your company. Flexible support is fractional and on-demand, allowing you to tap into multiple specialist skill sets as tasks arise without paying for full-time seats.",
            },
            {
                q: "How quickly can you turn around ad-hoc tasks?",
                a: "Standard ad-hoc requests and bug fixes typically turn around within 24 to 48 business hours. Larger feature tickets are scoped and delivered within agreed sprint timelines.",
            },
            {
                q: "Can we roll over unused hours to the next month?",
                a: "Yes. Depending on your flexible retainer agreement, unused hours can roll over into the following month, ensuring your budget is never wasted during quiet periods.",
            },
        ],
        timeline: "Ongoing (Flexible monthly support / block hours)",
        startingAt: "Monthly retainer",
        accent: ACCENTS.indigo || ACCENTS.blue,
        seo: {
            title: "Flexible Team Support & On-Demand Agency Assistance",
            description:
                "On-demand design and development support: fractional engineering talent, UI/UX assistance, bug fixes, and overflow capacity without full-time overhead.",
            keywords: [
                "flexible team support",
                "on demand web developers",
                "fractional design team",
                "ad hoc development support",
                "overflow creative support",
                "staff augmentation on demand",
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
