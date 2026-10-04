/**
 * data/industriesData.ts
 * ---------------------------------------------------------------------------
 * Default content for the "Industries" menu and the /industries pages.
 *
 * The live site reads the admin-managed list from GET /api/industries; this
 * file is the fallback when the API is unreachable and the source the backend
 * seed is exported from (backend-api/scripts/export-industries-seed.ts).
 *
 * Every industry gets its own intro, pain points, FAQs and keywords so the
 * pages are not near-duplicates of each other. Only the "how we help" points,
 * a few shared FAQs and the default stats/CTA come from templates below.
 */

// Relative on purpose: the backend seed export imports this file without the
// "@/" alias.
import { ACCENTS, type ServiceAccent, type ServiceFaq } from "./servicesData";

export interface IndustryPoint {
    title: string;
    body: string;
}

export interface IndustryStat {
    value: string;
    label: string;
}

export interface Industry {
    slug: string;
    /** Short label: menu item, card title, breadcrumb. */
    title: string;
    /** The page <h1>. */
    headline: string;
    icon: string;
    tagline: string;
    /** Card copy on the hub page; also the default meta description. */
    summary: string;
    heroImage?: string;
    heroImageAlt?: string;
    intro: string[];
    /** Business types the page speaks to. */
    audience: string[];
    challenges: IndustryPoint[];
    solutions: IndustryPoint[];
    /** Service slugs from the services catalog. */
    services: string[];
    stats: IndustryStat[];
    faqs: ServiceFaq[];
    ctaTitle?: string;
    ctaBody?: string;
    accent: ServiceAccent;
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
}

export const INDUSTRIES_BASE_PATH = "/industries";

export function industryHref(slug: string): string {
    return `${INDUSTRIES_BASE_PATH}/${slug}`;
}

/* -------------------------------------------------------------------------
   Templates
   ------------------------------------------------------------------------- */

type Draft = {
    slug: string;
    title: string;
    icon: string;
    accent: keyof typeof ACCENTS;
    /** Singular, lower-case: "HVAC company". */
    business: string;
    /** Plural, title case for the H1: "HVAC Companies". */
    businesses: string;
    /** Who buys from them: "homeowners". */
    customer: string;
    /** Their main jobs, lower-case. */
    jobs: string[];
    tagline: string;
    summary: string;
    intro: string[];
    audience: string[];
    challenges: IndustryPoint[];
    faqs: ServiceFaq[];
    keywords: string[];
    services?: string[];
};

const DEFAULT_SERVICES = [
    "website-design-development",
    "seo",
    "google-ads",
    "social-media-marketing",
    "brand-identity",
    "content-marketing",
];

const VISUAL_SERVICES = [
    "website-design-development",
    "seo",
    "google-ads",
    "social-media-marketing",
    "video-production",
    "brand-identity",
];

const DEFAULT_STATS: IndustryStat[] = [
    { value: "24/7", label: "Online booking & quote capture" },
    { value: "3–5 wks", label: "Typical website launch" },
    { value: "1 team", label: "Web, SEO, ads & branding" },
];

/** Lower-cases a phrase for use mid-sentence while keeping acronyms such as "HVAC". */
export function inSentence(phrase: string): string {
    return phrase
        .split(" ")
        .map((word) => (/^[A-Z0-9]{2,}$/.test(word) ? word : word.toLowerCase()))
        .join(" ");
}

function solutionsFor(d: Draft): IndustryPoint[] {
    const jobs = d.jobs.slice(0, 3).join(", ");
    const plural = inSentence(d.businesses);
    return [
        {
            title: "A website built to book jobs",
            body: `Fast, mobile-first pages for every service you sell — ${jobs} and more — with click-to-call, quote forms and online booking on every screen.`,
        },
        {
            title: "Local SEO & Google Maps",
            body: `Service-area pages, Google Business Profile optimisation and a steady review flow, so you show up when ${d.customer} search for ${d.jobs[0]} near them.`,
        },
        {
            title: "Google Ads that track to revenue",
            body: `Search and Local Services campaigns aimed at high-intent searches, with call tracking that shows which ads produce booked jobs — not just clicks.`,
        },
        {
            title: "A brand that looks established",
            body: `Logo, colours, vehicle wraps, uniforms and print that make your ${d.business} look like the safe, professional choice in your market.`,
        },
        {
            title: "Social proof & content",
            body: `Before-and-after posts, short videos and review highlights that keep ${plural} like yours top of mind long before the customer needs you.`,
        },
        {
            title: "Reporting you can actually read",
            body: "A monthly report on calls, forms, cost per lead and booked jobs — plus a call with a real person to decide what to do next.",
        },
    ];
}

function sharedFaqs(d: Draft): ServiceFaq[] {
    return [
        {
            q: `How long does it take to launch a new ${d.business} website?`,
            a: "Most sites launch in three to five weeks: a week of discovery and content, two to three weeks of design and build, then testing and launch. Local SEO and ads can start in parallel.",
        },
        {
            q: "Do you only work in one city or region?",
            a: "No. We work remotely with service businesses in many countries and build a dedicated page for every town or service area you cover, so you can rank where your customers actually are.",
        },
        {
            q: "Will we own the website and ad accounts?",
            a: "Yes. Your domain, website, Google Business Profile and ad accounts are set up in your name. If you ever leave, everything stays with you.",
        },
    ];
}

function build(d: Draft): Industry {
    return {
        slug: d.slug,
        title: d.title,
        headline: `Websites & Marketing for ${d.businesses}`,
        icon: d.icon,
        tagline: d.tagline,
        summary: d.summary,
        intro: d.intro,
        audience: d.audience,
        challenges: d.challenges,
        solutions: solutionsFor(d),
        services: d.services ?? DEFAULT_SERVICES,
        stats: DEFAULT_STATS,
        faqs: [...d.faqs, ...sharedFaqs(d)],
        ctaTitle: `Ready to grow your ${d.business}?`,
        ctaBody:
            "Book a free 30-minute call. We'll review your website, Google ranking and ads, and show you where your next jobs will come from — no pitch deck.",
        accent: ACCENTS[d.accent],
        seo: {
            title: `${d.title} Website Design & Marketing`,
            description: d.summary.slice(0, 160),
            keywords: d.keywords,
        },
    };
}

/* -------------------------------------------------------------------------
   Industries — order matches the menu (column by column).
   ------------------------------------------------------------------------- */

const DRAFTS: Draft[] = [
    {
        slug: "hvac",
        title: "HVAC",
        icon: "AirVent",
        accent: "blue",
        business: "HVAC company",
        businesses: "HVAC Companies",
        customer: "homeowners",
        jobs: [
            "AC repair",
            "furnace installation",
            "heat pump upgrades",
            "maintenance plans",
        ],
        tagline:
            "Websites, local SEO and ads that keep your technicians booked — in peak season and the shoulder months.",
        summary:
            "Web design, local SEO and Google Ads for HVAC contractors who want more repair calls, installs and maintenance-plan sign-ups.",
        intro: [
            "Heating and cooling is a search-first trade. When an AC dies in July or a furnace quits in January, homeowners grab their phone, search, and call the first company that looks trustworthy and answers quickly. If that isn't you, the job goes to whoever ranks above you.",
            "We build HVAC websites and marketing that win that moment: fast pages for every service and every town you cover, a Google Business Profile that ranks in the map pack, and ad campaigns tuned to emergency and replacement searches — then we track every call back to its source.",
        ],
        audience: [
            "Residential HVAC contractors",
            "Heating & air conditioning companies",
            "Commercial mechanical contractors",
            "Heat pump & ductless specialists",
        ],
        challenges: [
            {
                title: "Feast-or-famine seasons",
                body: "Summer and winter peaks bury your phones, then demand drops off. Without a steady lead engine in spring and fall, crews sit idle and margins disappear.",
            },
            {
                title: "Missing the map pack",
                body: "Most emergency calls go to the three companies in Google's local pack. Thin service pages and too few reviews keep you out of it.",
            },
            {
                title: "Paying for clicks that never call",
                body: "Broad ad campaigns burn budget on DIY searches and job seekers instead of homeowners ready to book a repair or replacement.",
            },
        ],
        faqs: [
            {
                q: "Can you help us sell more HVAC maintenance plans?",
                a: "Yes. We build a dedicated maintenance-plan page, add sign-up prompts across the site and set up email and retargeting campaigns that remind past customers before each season.",
            },
            {
                q: "Do you run Google Local Services Ads for HVAC?",
                a: "We set up and manage Local Services Ads alongside search campaigns, help you get Google Guaranteed, and track both so you can see the real cost per booked job.",
            },
        ],
        keywords: [
            "hvac marketing",
            "hvac website design",
            "hvac seo",
            "hvac google ads",
            "marketing for hvac companies",
            "heating and cooling marketing",
        ],
    },
    {
        slug: "plumbing",
        title: "Plumbing",
        icon: "Wrench",
        accent: "blue",
        business: "plumbing company",
        businesses: "Plumbing Companies",
        customer: "homeowners and property managers",
        jobs: [
            "emergency plumbing",
            "drain cleaning",
            "water heater installs",
            "repiping",
        ],
        tagline:
            "Get found first when a pipe bursts — and turn urgent searches into booked plumbing jobs.",
        summary:
            "Plumbing websites, local SEO and Google Ads built to win emergency calls, water-heater installs and high-ticket repiping work.",
        intro: [
            "Plumbing leads are urgent. A burst pipe or a backed-up drain sends homeowners straight to Google, and they rarely scroll past the first few results. Speed, visibility and a phone number that's one tap away decide who gets the job.",
            "We design plumbing websites that load instantly on a phone, rank for every service and suburb you cover, and push visitors to call or book. Then we back them with local SEO, review generation and ads that target emergency and high-value searches.",
        ],
        audience: [
            "Residential plumbers",
            "Emergency & 24/7 plumbing services",
            "Drain & sewer specialists",
            "Water heater installers",
        ],
        challenges: [
            {
                title: "Emergency calls go to whoever is on top",
                body: "If you are not in the map pack or the top ads, the homeowner with water on the floor never sees you.",
            },
            {
                title: "Low-value jobs crowd out profitable work",
                body: "Generic marketing brings in tap washers while repipes, sewer lines and water heaters go to competitors.",
            },
            {
                title: "Lead aggregators taking the margin",
                body: "Directory leads are sold to three other plumbers at once. Owning your own lead flow is cheaper and closes better.",
            },
        ],
        faqs: [
            {
                q: "Can you target only the high-ticket plumbing services?",
                a: "Yes. We build dedicated pages and ad groups for water heaters, repiping, sewer lines and remodel work, and lower bids on low-value searches so budget goes where the margin is.",
            },
            {
                q: "How do you help plumbers get more Google reviews?",
                a: "We set up a simple review request by text and email after each job, add review widgets to your site and respond to reviews strategically to lift your map ranking.",
            },
        ],
        keywords: [
            "plumbing marketing",
            "plumber website design",
            "plumbing seo",
            "plumber google ads",
            "marketing for plumbers",
            "emergency plumber leads",
        ],
    },
    {
        slug: "electrical",
        title: "Electrical",
        icon: "PlugZap",
        accent: "orange",
        business: "electrical contractor",
        businesses: "Electricians & Electrical Contractors",
        customer: "homeowners and businesses",
        jobs: [
            "panel upgrades",
            "EV charger installs",
            "rewiring",
            "lighting installs",
        ],
        tagline:
            "Marketing that powers a full schedule of panel upgrades, EV chargers and commercial electrical work.",
        summary:
            "Websites, SEO and ads for electricians who want more panel upgrades, EV charger installs and commercial contracts — not just small call-outs.",
        intro: [
            "Homeowners don't hire an electrician on price alone — they hire the one who looks licensed, safe and professional. Your website, reviews and Google listing make that judgement for them before they ever pick up the phone.",
            "We build electrician websites that show credentials up front, explain each service clearly and capture quote requests on every page. Local SEO and targeted ads put you in front of people searching for panel upgrades, EV chargers, rewires and commercial work in your area.",
        ],
        audience: [
            "Residential electricians",
            "Commercial electrical contractors",
            "EV charger installers",
            "Solar & battery installers",
        ],
        challenges: [
            {
                title: "Looking like every other electrician",
                body: "A dated site with stock photos does nothing to prove you're licensed, insured and worth the call-out fee.",
            },
            {
                title: "Missing the EV and upgrade boom",
                body: "Demand for EV chargers, panel upgrades and smart-home work is growing fast, but those searches go to whoever has pages built for them.",
            },
            {
                title: "Unpredictable lead flow",
                body: "Relying on referrals alone means busy months followed by quiet ones you can't plan crews around.",
            },
        ],
        faqs: [
            {
                q: "Can you help us win more commercial electrical work?",
                a: "Yes. We create separate commercial pages with project case studies, capability statements and bid forms, and run search and LinkedIn campaigns aimed at facility managers and builders.",
            },
            {
                q: "Do you create pages for EV charger installation?",
                a: "We build dedicated EV charger, panel upgrade and generator pages for each service area, optimised for the searches homeowners actually use.",
            },
        ],
        keywords: [
            "electrician marketing",
            "electrician website design",
            "electrical contractor seo",
            "electrician google ads",
            "marketing for electricians",
            "ev charger installer marketing",
        ],
    },
    {
        slug: "roofing",
        title: "Roofing",
        icon: "House",
        accent: "orange",
        business: "roofing company",
        businesses: "Roofing Companies",
        customer: "homeowners",
        jobs: [
            "roof replacement",
            "storm damage repair",
            "roof inspections",
            "gutters",
        ],
        tagline:
            "Win more roof replacements with a website and ad strategy that builds trust before the first inspection.",
        summary:
            "Roofing websites, local SEO and lead-gen campaigns that generate inspection requests, storm-damage jobs and high-value roof replacements.",
        intro: [
            "A new roof is one of the biggest purchases a homeowner makes, so they research hard. They compare reviews, look at past projects and check whether you'll still be around to honour the warranty. Your online presence has to win that comparison.",
            "We build roofing websites packed with project galleries, financing information and easy inspection booking, then drive qualified traffic with local SEO, Google Ads and storm-response campaigns that switch on when weather hits your area.",
        ],
        audience: [
            "Residential roofing contractors",
            "Storm restoration companies",
            "Commercial & flat roofing firms",
            "Gutter & siding contractors",
        ],
        challenges: [
            {
                title: "High-ticket jobs need high trust",
                body: "Homeowners collect three to five quotes. Without strong reviews, warranties and project proof online, you compete on price alone.",
            },
            {
                title: "Storm chasers flooding the market",
                body: "After a storm, out-of-town crews buy every ad slot. Local companies need to stand out as the established, accountable choice.",
            },
            {
                title: "Expensive leads",
                body: "Roofing clicks are some of the costliest in home services, so poorly built landing pages waste serious money.",
            },
        ],
        faqs: [
            {
                q: "Can you run roofing ads only after storms hit our area?",
                a: "Yes. We prepare storm-response campaigns and landing pages in advance, then switch them on by zip code when hail or wind events are reported, so you're visible the moment demand spikes.",
            },
            {
                q: "Should we show financing on our roofing website?",
                a: "Usually, yes. Financing calculators and clear monthly-payment messaging make a replacement feel affordable, which lifts inspection bookings for high-ticket jobs.",
            },
        ],
        keywords: [
            "roofing marketing",
            "roofing website design",
            "roofer seo",
            "roofing google ads",
            "roofing leads",
            "marketing for roofing companies",
        ],
    },
    {
        slug: "landscaping",
        title: "Landscaping",
        icon: "Trees",
        accent: "emerald",
        business: "landscaping company",
        businesses: "Landscaping Companies",
        customer: "homeowners and property managers",
        jobs: [
            "landscape design",
            "hardscaping",
            "patios",
            "garden installs",
        ],
        tagline:
            "Show off your best work and book more design-build projects with a site as polished as your landscapes.",
        summary:
            "Landscaping websites, SEO and social campaigns that turn your project photos into design consultations and high-value hardscape jobs.",
        intro: [
            "Landscaping sells visually. Homeowners planning a new patio, garden or outdoor living space want to see what you've built and imagine it in their own yard. Your website and social feeds are your showroom.",
            "We design landscaping websites around striking project galleries and clear service pages, then grow your reach with local SEO, Instagram and Facebook content, and ads timed to the spring planning rush.",
        ],
        audience: [
            "Landscape design-build firms",
            "Hardscape & patio contractors",
            "Commercial landscape maintenance companies",
            "Irrigation & outdoor lighting specialists",
        ],
        challenges: [
            {
                title: "Great work, weak portfolio",
                body: "Phone photos buried in a Facebook album don't sell a $40,000 outdoor living project.",
            },
            {
                title: "Seasonal demand",
                body: "Bookings cluster in spring. Without planning-season marketing, your calendar fills late and with smaller jobs.",
            },
            {
                title: "Lumped in with mow-and-go crews",
                body: "Without clear positioning, design-build firms get compared against the cheapest quote in town.",
            },
        ],
        faqs: [
            {
                q: "Can you photograph or film our landscaping projects?",
                a: "We art-direct shoots, edit before-and-after videos and turn them into gallery pages, reels and ad creative that showcase your craftsmanship.",
            },
            {
                q: "Do you market design-build and maintenance separately?",
                a: "Yes. They attract different customers, so we build separate pages, offers and campaigns for high-ticket design-build work and recurring maintenance contracts.",
            },
        ],
        keywords: [
            "landscaping marketing",
            "landscaping website design",
            "landscaper seo",
            "landscaping company advertising",
            "hardscape marketing",
            "marketing for landscapers",
        ],
        services: VISUAL_SERVICES,
    },
    {
        slug: "lawn-care",
        title: "Lawn Care",
        icon: "Sprout",
        accent: "emerald",
        business: "lawn care business",
        businesses: "Lawn Care Companies",
        customer: "homeowners",
        jobs: [
            "weekly mowing",
            "fertilization",
            "weed control",
            "aeration",
        ],
        tagline:
            "Fill your routes with recurring customers — online quotes, local SEO and ads built for lawn care.",
        summary:
            "Lawn care websites and marketing that win recurring mowing, fertilization and weed-control customers in tight, profitable routes.",
        intro: [
            "Lawn care profits come from route density and recurring customers. Every new client on a street you already serve is almost pure margin — so your marketing should target exactly those streets.",
            "We build lawn care websites with instant quote forms and online sign-up for recurring plans, then use hyper-local SEO and Google Ads to grow density in the neighbourhoods you already cover.",
        ],
        audience: [
            "Residential mowing services",
            "Fertilization & weed control companies",
            "Lawn care franchises",
            "Seasonal yard clean-up services",
        ],
        challenges: [
            {
                title: "Scattered routes",
                body: "Customers spread across town eat up drive time and fuel. Untargeted marketing makes it worse.",
            },
            {
                title: "One-off jobs instead of plans",
                body: "Without a clear recurring offer, customers book a single mow and never come back.",
            },
            {
                title: "Spring rush, winter drought",
                body: "Sign-ups pile up in spring then dry up. Upsells like aeration, leaf clean-up and snow removal smooth out revenue.",
            },
        ],
        faqs: [
            {
                q: "Can customers get a lawn care quote online?",
                a: "Yes. We add instant or same-day quote forms that capture address and lawn size, and can connect them to tools like Jobber or Service Autopilot.",
            },
            {
                q: "Can you target lawn care ads to specific neighbourhoods?",
                a: "We geo-target ads and build area pages around the zip codes and subdivisions where you already have routes, so new customers add density instead of drive time.",
            },
        ],
        keywords: [
            "lawn care marketing",
            "lawn care website design",
            "lawn care seo",
            "lawn mowing business advertising",
            "lawn care leads",
            "marketing for lawn care companies",
        ],
    },
    {
        slug: "pool-service",
        title: "Pool Service",
        icon: "Waves",
        accent: "blue",
        business: "pool service company",
        businesses: "Pool Service Companies",
        customer: "pool owners",
        jobs: [
            "weekly pool cleaning",
            "equipment repair",
            "openings and closings",
            "pool renovations",
        ],
        tagline:
            "More weekly pool routes and equipment upgrades from a website that converts pool owners on sight.",
        summary:
            "Pool service websites, SEO and ads that grow weekly cleaning routes, equipment repairs and renovation projects.",
        intro: [
            "Pool owners want a service they can trust to show up every week and keep the water clear without hassle. They pick the company that looks reliable online and makes signing up easy.",
            "We build pool service websites with clear weekly plans, online sign-up and repair booking, then grow your routes with local SEO, reviews and seasonal campaigns for openings, closings and equipment upgrades.",
        ],
        audience: [
            "Weekly pool cleaning services",
            "Pool repair & equipment technicians",
            "Pool builders & renovators",
            "Spa & hot tub service companies",
        ],
        challenges: [
            {
                title: "Hard to stand out",
                body: "Most pool service sites look the same. Without reviews and clear plans, owners default to the cheapest option.",
            },
            {
                title: "Churn between seasons",
                body: "Customers cancel after summer unless you give them a reason to stay year-round.",
            },
            {
                title: "Missed equipment upsells",
                body: "Pumps, heaters and automation are high-margin, but most customers don't know you offer them.",
            },
        ],
        faqs: [
            {
                q: "Can you help us sell pool equipment upgrades?",
                a: "Yes. We create pages and email campaigns for variable-speed pumps, heaters, automation and salt systems, aimed at your existing customers first.",
            },
            {
                q: "Do you build pages for pool openings and closings?",
                a: "We create seasonal landing pages and ads that switch on ahead of opening and closing season in your region.",
            },
        ],
        keywords: [
            "pool service marketing",
            "pool cleaning website design",
            "pool company seo",
            "pool service advertising",
            "marketing for pool companies",
            "pool route growth",
        ],
    },
    {
        slug: "pest-control",
        title: "Pest Control",
        icon: "Bug",
        accent: "emerald",
        business: "pest control company",
        businesses: "Pest Control Companies",
        customer: "homeowners and businesses",
        jobs: [
            "general pest control",
            "termite treatment",
            "rodent removal",
            "mosquito programs",
        ],
        tagline:
            "Be the first call when pests show up — and turn one-time treatments into recurring service plans.",
        summary:
            "Pest control websites, local SEO and ads that win urgent infestation calls and convert them into recurring quarterly plans.",
        intro: [
            "Nobody shops around for long when they find termites or rodents. They want a local, licensed company that can come out fast. Pest control is won by visibility at the moment of panic and trust at the moment of choice.",
            "We build pest control websites with pest-by-pest pages, fast booking and clear recurring plans, then rank them in your service areas and support them with ads tuned to urgent, high-intent searches.",
        ],
        audience: [
            "Residential pest control companies",
            "Termite specialists",
            "Wildlife & rodent removal services",
            "Commercial pest management providers",
        ],
        challenges: [
            {
                title: "Urgent searches, short attention",
                body: "If your site is slow or confusing, the homeowner hits back and calls the next listing.",
            },
            {
                title: "One-and-done customers",
                body: "Single treatments don't build a business. The profit is in quarterly and annual plans.",
            },
            {
                title: "National brands outspending you",
                body: "Big franchises dominate ads. Local operators need sharper targeting and stronger local SEO to compete.",
            },
        ],
        faqs: [
            {
                q: "Can you create a page for each pest we treat?",
                a: "Yes. Separate pages for termites, ants, rodents, bed bugs, mosquitoes and more help you rank for each search and answer questions specific to that pest.",
            },
            {
                q: "How do you compete with national pest control brands?",
                a: "We focus on hyper-local SEO, reviews and ads around the towns you serve, and highlight local ownership, response times and guarantees the big brands can't match.",
            },
        ],
        keywords: [
            "pest control marketing",
            "pest control website design",
            "pest control seo",
            "exterminator advertising",
            "marketing for pest control companies",
            "pest control leads",
        ],
    },
    {
        slug: "painting",
        title: "Painting",
        icon: "PaintRoller",
        accent: "violet",
        business: "painting company",
        businesses: "Painting Contractors",
        customer: "homeowners and property managers",
        jobs: [
            "interior painting",
            "exterior painting",
            "cabinet refinishing",
            "commercial repaints",
        ],
        tagline:
            "Turn before-and-after photos into booked estimates with a painting website that sells quality, not just price.",
        summary:
            "Websites, SEO and ads for painting contractors who want more interior, exterior and cabinet jobs at healthy margins.",
        intro: [
            "Every homeowner gets several painting quotes. The contractor who wins is the one who looks most professional, shows the cleanest work and makes booking an estimate effortless.",
            "We build painting websites around before-and-after galleries, clear service pages and instant estimate requests. Local SEO and targeted ads then put you in front of homeowners actively planning a project.",
        ],
        audience: [
            "Residential painting companies",
            "Commercial painting contractors",
            "Cabinet refinishing specialists",
            "Painting franchise owners",
        ],
        challenges: [
            {
                title: "Competing on price",
                body: "Without proof of quality, homeowners compare quotes line by line and pick the lowest.",
            },
            {
                title: "Weather-dependent exterior season",
                body: "Exterior work is seasonal; interior and cabinet services need their own marketing to keep crews busy year-round.",
            },
            {
                title: "Too few online reviews",
                body: "Painters often do great work but rarely ask for reviews, so competitors with more stars win the click.",
            },
        ],
        faqs: [
            {
                q: "Can you promote cabinet painting separately?",
                a: "Yes. Cabinet refinishing is high-margin and year-round, so we build a dedicated page, gallery and ad campaign for it.",
            },
            {
                q: "Do you offer online painting estimate forms?",
                a: "We add estimate forms that collect room counts, photos and timing so you can quote faster and prioritise the best jobs.",
            },
        ],
        keywords: [
            "painting contractor marketing",
            "painting company website design",
            "painter seo",
            "house painter advertising",
            "marketing for painters",
            "painting leads",
        ],
        services: VISUAL_SERVICES,
    },
    {
        slug: "tree-care",
        title: "Tree Care",
        icon: "TreePine",
        accent: "emerald",
        business: "tree service company",
        businesses: "Tree Service Companies",
        customer: "homeowners",
        jobs: [
            "tree removal",
            "trimming and pruning",
            "stump grinding",
            "storm cleanup",
        ],
        tagline:
            "Rank for every tree removal, trimming and storm call in your area — and look like the safe, insured choice.",
        summary:
            "Tree service websites, local SEO and ads that win removals, trimming contracts and emergency storm work.",
        intro: [
            "Tree work is dangerous and expensive, so homeowners look for a company that is certified, insured and experienced. Your website has to show that instantly — then make it easy to request a quote with photos.",
            "We build tree service websites that highlight certifications, insurance and equipment, rank for removal, trimming and stump grinding across your service area, and capture emergency calls the moment a storm passes.",
        ],
        audience: [
            "Tree removal companies",
            "Certified arborists",
            "Stump grinding services",
            "Storm cleanup crews",
        ],
        challenges: [
            {
                title: "Proving you're safe and insured",
                body: "Homeowners fear property damage and liability. Without visible credentials, they won't risk the call.",
            },
            {
                title: "Storm demand spikes",
                body: "After high winds, everyone needs help at once — and the companies that are visible online take the work.",
            },
            {
                title: "Quoting blind",
                body: "Driving out to quote every job wastes hours each week. Photo-based quote requests fix that.",
            },
        ],
        faqs: [
            {
                q: "Can customers send photos for a tree removal quote?",
                a: "Yes. We add quote forms with photo upload so you can price many jobs remotely and only drive out for the big ones.",
            },
            {
                q: "Do you help arborists highlight their certifications?",
                a: "We feature ISA certification, insurance and safety records prominently and add them to structured data so search engines understand your credentials.",
            },
        ],
        keywords: [
            "tree service marketing",
            "tree service website design",
            "arborist seo",
            "tree removal advertising",
            "marketing for tree companies",
            "tree service leads",
        ],
    },
    {
        slug: "junk-removal",
        title: "Junk Removal",
        icon: "Trash2",
        accent: "orange",
        business: "junk removal company",
        businesses: "Junk Removal Companies",
        customer: "homeowners, landlords and businesses",
        jobs: [
            "junk hauling",
            "furniture removal",
            "estate cleanouts",
            "construction debris removal",
        ],
        tagline:
            "Same-day bookings on autopilot — a junk removal website and ad strategy built for speed.",
        summary:
            "Junk removal websites, local SEO and Google Ads that drive same-day bookings, cleanouts and commercial hauling jobs.",
        intro: [
            "Junk removal customers want it gone today. They search, compare a couple of prices and book whoever offers the fastest, clearest answer. Online booking and upfront pricing win the job.",
            "We build junk removal websites with pricing guides, online booking and click-to-text, then rank and advertise them across every town you haul in — with separate campaigns for estate cleanouts, landlords and contractors.",
        ],
        audience: [
            "Residential junk haulers",
            "Estate & hoarding cleanout services",
            "Construction debris removal",
            "Junk removal franchises",
        ],
        challenges: [
            {
                title: "Speed wins",
                body: "If customers can't book or get a price in seconds, they move on to the next company.",
            },
            {
                title: "Price shoppers",
                body: "Without clear value — same-day service, donation and recycling — you're compared only on cost.",
            },
            {
                title: "Big franchises dominate search",
                body: "National brands buy the top ads. Local haulers need sharper local SEO and targeting.",
            },
        ],
        faqs: [
            {
                q: "Can customers book junk removal online?",
                a: "Yes. We add online booking with time slots and optional photo upload for instant estimates, connected to your scheduling tool if you use one.",
            },
            {
                q: "Can you target landlords and property managers?",
                a: "We build dedicated pages and campaigns for tenant cleanouts, property managers and realtors, which bring repeat, higher-volume work.",
            },
        ],
        keywords: [
            "junk removal marketing",
            "junk removal website design",
            "junk removal seo",
            "junk hauling advertising",
            "marketing for junk removal companies",
            "junk removal leads",
        ],
    },
    {
        slug: "handyman",
        title: "Handyman",
        icon: "Hammer",
        accent: "indigo",
        business: "handyman business",
        businesses: "Handyman Businesses",
        customer: "homeowners",
        jobs: [
            "home repairs",
            "furniture assembly",
            "drywall repair",
            "fixture installs",
        ],
        tagline:
            "Turn your to-do-list services into a steady stream of booked handyman jobs.",
        summary:
            "Handyman websites, SEO and ads that showcase everything you fix and turn local searches into booked repair visits.",
        intro: [
            "Handyman customers usually have a list — a leaky tap, a door that sticks, shelves to hang. They want one reliable person who can do it all, shows up on time and charges fairly.",
            "We build handyman websites that list every service clearly, show transparent rates and make booking simple. Local SEO and targeted ads then win the searches for each task in your service area.",
        ],
        audience: [
            "Independent handymen",
            "Handyman franchises",
            "Home repair & maintenance services",
            "Property maintenance contractors",
        ],
        challenges: [
            {
                title: "Too many services, unclear message",
                body: "Listing everything in one paragraph confuses customers and ranks for nothing.",
            },
            {
                title: "Small tickets",
                body: "Single small jobs barely cover drive time unless you bundle tasks or sell maintenance plans.",
            },
            {
                title: "Earning trust at the door",
                body: "Customers let you into their home. Reviews, background checks and guarantees need to be front and centre.",
            },
        ],
        faqs: [
            {
                q: "Should each handyman service have its own page?",
                a: "Yes, for your main services. Pages for drywall repair, TV mounting, furniture assembly and more help you rank for each search and convert better.",
            },
            {
                q: "Can you help us sell home maintenance plans?",
                a: "We design maintenance-plan offers and pages that turn one-off customers into recurring clients with scheduled visits.",
            },
        ],
        keywords: [
            "handyman marketing",
            "handyman website design",
            "handyman seo",
            "handyman advertising",
            "marketing for handyman business",
            "handyman leads",
        ],
    },
    {
        slug: "cleaning",
        title: "Cleaning",
        icon: "SprayCan",
        accent: "violet",
        business: "cleaning company",
        businesses: "House Cleaning Companies",
        customer: "busy households",
        jobs: [
            "recurring house cleaning",
            "deep cleaning",
            "move-out cleaning",
            "vacation rental turnovers",
        ],
        tagline:
            "Book more recurring cleans with instant quotes, local SEO and ads busy households respond to.",
        summary:
            "House cleaning websites and marketing that win recurring weekly and bi-weekly clients, deep cleans and move-out jobs.",
        intro: [
            "Residential cleaning is built on recurring clients. Win a household once and keep them for years — but only if your website makes booking easy and your brand feels trustworthy enough to hand over a key.",
            "We build cleaning company websites with instant pricing, online booking and clear recurring plans, then grow your client base with local SEO, review generation and ads targeted to the neighbourhoods you serve.",
        ],
        audience: [
            "House cleaning services",
            "Maid services",
            "Move-in & move-out cleaners",
            "Vacation rental & Airbnb cleaners",
        ],
        challenges: [
            {
                title: "The trust barrier",
                body: "Customers are letting strangers into their home. Without reviews, vetting details and guarantees, they hesitate.",
            },
            {
                title: "Quote friction",
                body: "If pricing requires a phone call, many customers never book at all.",
            },
            {
                title: "Client churn",
                body: "Clients cancel without a reason to stay. Recurring discounts and good follow-up keep them.",
            },
        ],
        faqs: [
            {
                q: "Can customers book and pay for cleaning online?",
                a: "Yes. We add instant quote calculators and online booking, and can connect them to tools like BookingKoala, Launch27 or Jobber.",
            },
            {
                q: "How do you help cleaning companies reduce churn?",
                a: "We set up recurring-plan incentives, automated follow-ups and review requests that keep clients engaged and booking.",
            },
        ],
        keywords: [
            "cleaning business marketing",
            "cleaning company website design",
            "house cleaning seo",
            "maid service advertising",
            "marketing for cleaning companies",
            "cleaning leads",
        ],
    },
    {
        slug: "commercial-cleaning",
        title: "Commercial Cleaning",
        icon: "Building2",
        accent: "indigo",
        business: "commercial cleaning company",
        businesses: "Commercial Cleaning Companies",
        customer: "facility managers and business owners",
        jobs: [
            "office cleaning",
            "janitorial contracts",
            "medical facility cleaning",
            "post-construction cleaning",
        ],
        tagline:
            "Win bigger janitorial contracts with a website and outreach that speak to facility managers.",
        summary:
            "Commercial cleaning websites, SEO and B2B lead generation that win office, medical and janitorial contracts.",
        intro: [
            "Commercial cleaning buyers are facility managers, office administrators and property groups. They care about reliability, compliance, insurance and response times — and they research suppliers carefully before requesting a bid.",
            "We build commercial cleaning websites with facility-specific pages, compliance and certification details and bid-request forms, then generate B2B leads through SEO, LinkedIn and Google Ads aimed at decision-makers.",
        ],
        audience: [
            "Janitorial companies",
            "Office cleaning services",
            "Medical & healthcare cleaners",
            "Post-construction cleaning crews",
        ],
        challenges: [
            {
                title: "B2B buyers need proof",
                body: "Contracts go to companies that show insurance, compliance, case studies and references up front.",
            },
            {
                title: "Long sales cycles",
                body: "Contract decisions take weeks or months. You need ways to stay in front of prospects until they're ready.",
            },
            {
                title: "Looking like a residential cleaner",
                body: "A homey website undercuts your ability to win serious commercial accounts.",
            },
        ],
        faqs: [
            {
                q: "Can you generate leads from facility managers?",
                a: "Yes. We run LinkedIn and search campaigns aimed at facility and office managers, and build bid-request landing pages that speak their language.",
            },
            {
                q: "Should we have separate pages for each facility type?",
                a: "Yes. Pages for offices, medical clinics, schools, warehouses and post-construction help you rank and show relevant expertise to each buyer.",
            },
        ],
        keywords: [
            "commercial cleaning marketing",
            "janitorial website design",
            "commercial cleaning seo",
            "janitorial lead generation",
            "marketing for commercial cleaning companies",
            "office cleaning leads",
        ],
        services: [
            "website-design-development",
            "seo",
            "google-ads",
            "paid-advertising",
            "brand-identity",
            "content-marketing",
        ],
    },
    {
        slug: "remodeling-renovations",
        title: "Remodeling & Renovations",
        icon: "Drill",
        accent: "orange",
        business: "remodeling company",
        businesses: "Remodeling & Renovation Contractors",
        customer: "homeowners",
        jobs: [
            "kitchen remodels",
            "bathroom renovations",
            "basement finishing",
            "home additions",
        ],
        tagline:
            "Attract homeowners ready for kitchen, bath and whole-home projects — and qualify them before the site visit.",
        summary:
            "Remodeling websites, SEO and ads that attract serious kitchen, bathroom and whole-home renovation projects with real budgets.",
        intro: [
            "Remodeling clients spend months dreaming, researching and saving before they hire. They study portfolios, read reviews and look for a contractor whose style and process they trust with a five- or six-figure project.",
            "We build remodeling websites with rich project galleries, clear process pages and budget-qualifying consultation forms, then attract homeowners through SEO, inspiration content and targeted ads for kitchens, bathrooms and additions.",
        ],
        audience: [
            "Kitchen & bath remodelers",
            "Design-build firms",
            "Basement & addition contractors",
            "Whole-home renovation companies",
        ],
        challenges: [
            {
                title: "Tire-kickers and small budgets",
                body: "Without qualification, you lose evenings to site visits for projects that never go ahead.",
            },
            {
                title: "Long research cycles",
                body: "Homeowners browse for months. Content and retargeting keep you top of mind until they're ready.",
            },
            {
                title: "A portfolio that undersells the work",
                body: "Poor photos and no project stories make premium craftsmanship look average.",
            },
        ],
        faqs: [
            {
                q: "Can you help filter out low-budget remodeling leads?",
                a: "Yes. Consultation forms ask about budget range, timeline and scope, so you can prioritise serious projects before scheduling a visit.",
            },
            {
                q: "Do you create remodeling project case studies?",
                a: "We turn finished projects into case-study pages with photos, the client's goals and the result — strong content for both SEO and sales conversations.",
            },
        ],
        keywords: [
            "remodeling marketing",
            "remodeling contractor website design",
            "kitchen remodeler seo",
            "renovation contractor advertising",
            "marketing for remodelers",
            "home remodeling leads",
        ],
        services: VISUAL_SERVICES,
    },
    {
        slug: "pressure-washing",
        title: "Pressure Washing",
        icon: "Droplets",
        accent: "blue",
        business: "pressure washing business",
        businesses: "Pressure Washing Companies",
        customer: "homeowners and property managers",
        jobs: [
            "house washing",
            "driveway cleaning",
            "roof soft washing",
            "commercial pressure washing",
        ],
        tagline:
            "Before-and-after marketing that books house washes, driveways and commercial jobs all season long.",
        summary:
            "Pressure washing websites, local SEO and social ads that turn dramatic before-and-after results into booked jobs.",
        intro: [
            "Few services are as visual as pressure washing. A single before-and-after photo sells the job better than any paragraph — as long as customers can see it and book easily.",
            "We build pressure washing websites with instant quote forms and before-and-after galleries, then grow your bookings with local SEO, short-form video ads and neighbourhood-targeted campaigns.",
        ],
        audience: [
            "Residential pressure washing services",
            "Soft washing specialists",
            "Commercial & fleet washing companies",
            "Exterior cleaning businesses",
        ],
        challenges: [
            {
                title: "Low barrier to entry",
                body: "New competitors appear every season. A strong brand and a deep bank of reviews set you apart.",
            },
            {
                title: "Seasonal demand",
                body: "Bookings spike in spring. Roof cleaning, gutter brightening and commercial contracts smooth out the year.",
            },
            {
                title: "Underselling the result",
                body: "Most sites don't show the transformation that actually sells the service.",
            },
        ],
        faqs: [
            {
                q: "Do before-and-after videos really help pressure washing sales?",
                a: "Yes. They are some of the best-performing ad creative in home services. We edit your footage into short reels and ads that stop the scroll.",
            },
            {
                q: "Can you help us land commercial pressure washing contracts?",
                a: "We build commercial pages for storefronts, fleets, HOAs and property managers, plus outreach campaigns to win recurring contracts.",
            },
        ],
        keywords: [
            "pressure washing marketing",
            "pressure washing website design",
            "power washing seo",
            "soft washing advertising",
            "marketing for pressure washing business",
            "pressure washing leads",
        ],
        services: VISUAL_SERVICES,
    },
    {
        slug: "window-cleaning",
        title: "Window Cleaning",
        icon: "AppWindow",
        accent: "blue",
        business: "window cleaning business",
        businesses: "Window Cleaning Companies",
        customer: "homeowners and businesses",
        jobs: [
            "residential window cleaning",
            "storefront cleaning",
            "high-rise window cleaning",
            "screen and track cleaning",
        ],
        tagline:
            "A crystal-clear online presence that books residential jobs and recurring storefront routes.",
        summary:
            "Window cleaning websites, SEO and ads that grow residential bookings and recurring commercial storefront routes.",
        intro: [
            "Window cleaning customers want careful, reliable people who show up when promised and leave no streaks or mess. Recurring storefront routes and repeat homeowners are where the profit is.",
            "We build window cleaning websites with instant quotes, recurring service options and clear safety information, then market them through local SEO, review generation and campaigns aimed at homeowners and storefronts.",
        ],
        audience: [
            "Residential window cleaners",
            "Storefront & commercial window cleaners",
            "High-rise & rope access teams",
            "Exterior cleaning companies",
        ],
        challenges: [
            {
                title: "Seen as a commodity",
                body: "Without differentiation, customers simply compare prices.",
            },
            {
                title: "Building recurring routes",
                body: "One-off cleans don't build a stable business. You need recurring residential and storefront plans.",
            },
            {
                title: "Safety and insurance concerns",
                body: "Especially for multi-storey work, customers want to see insurance and safety practices before they book.",
            },
        ],
        faqs: [
            {
                q: "Can you help us sell recurring window cleaning plans?",
                a: "Yes. We design recurring-plan offers and pages, add plan options to quotes and follow up with past customers automatically.",
            },
            {
                q: "Do you market high-rise and commercial window cleaning?",
                a: "We create separate commercial pages highlighting safety certifications, insurance and equipment, aimed at property managers and building owners.",
            },
        ],
        keywords: [
            "window cleaning marketing",
            "window cleaning website design",
            "window cleaner seo",
            "window cleaning advertising",
            "marketing for window cleaning business",
            "window cleaning leads",
        ],
    },
    {
        slug: "construction-contracting",
        title: "Construction & Contracting",
        icon: "Construction",
        accent: "orange",
        business: "construction company",
        businesses: "Construction Companies & Contractors",
        customer: "property owners and developers",
        jobs: [
            "new builds",
            "commercial construction",
            "general contracting",
            "design-build projects",
        ],
        tagline:
            "A website and brand that win bids, attract developers and recruit skilled crews.",
        summary:
            "Construction websites, branding and SEO that help general contractors win bigger bids, attract clients and recruit skilled trades.",
        intro: [
            "Construction clients — developers, property owners and businesses — vet contractors carefully. They want to see completed projects, capabilities, safety records and a team that can deliver on time and on budget.",
            "We build construction company websites with project portfolios, capability statements and bid-request forms, plus brand identity, SEO and recruitment pages that help you win work and hire the people to deliver it.",
        ],
        audience: [
            "General contractors",
            "Commercial construction firms",
            "Residential home builders",
            "Specialty trade contractors",
        ],
        challenges: [
            {
                title: "An outdated online presence",
                body: "Many contractors rely on referrals and a decade-old website that undersells what they can deliver.",
            },
            {
                title: "Winning bigger bids",
                body: "Developers and procurement teams look for polished portfolios, safety data and capability statements.",
            },
            {
                title: "Hiring skilled crews",
                body: "Labour shortages make recruitment marketing as important as winning clients.",
            },
        ],
        faqs: [
            {
                q: "Can you build a careers section to help us hire?",
                a: "Yes. We create recruitment pages, job listings and campaigns that showcase your culture, projects and benefits to attract skilled trades.",
            },
            {
                q: "Do you create capability statements and project portfolios?",
                a: "We design capability statements, bid-ready PDFs and portfolio pages that present your projects, certifications and safety record professionally.",
            },
        ],
        keywords: [
            "construction marketing",
            "construction company website design",
            "contractor seo",
            "general contractor marketing",
            "construction branding",
            "construction leads",
        ],
        services: [
            "website-design-development",
            "brand-identity",
            "seo",
            "graphic-design",
            "video-production",
            "content-marketing",
        ],
    },
];

export const INDUSTRIES: Industry[] = DRAFTS.map(build);
