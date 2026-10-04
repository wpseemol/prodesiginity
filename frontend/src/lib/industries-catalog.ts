/**
 * Industries — what the dashboard's Admin → Industries page manages.
 *
 * Reads `GET /api/industries` and maps it onto the `Industry` shape from
 * `data/industriesData.ts`, which stays as the fallback whenever the API is
 * unreachable (offline builds, API outage).
 *
 * Safe to import from server and client components.
 */

import { apiBaseUrl } from "@/config/api";
import {
    INDUSTRIES,
    industryHref,
    type Industry,
    type IndustryPoint,
} from "@/data/industriesData";
import type { Service, ServiceAccent } from "@/data/servicesData";
import { findService, type ServicesCatalog } from "@/lib/services-catalog";

export const STATIC_INDUSTRIES: Industry[] = INDUSTRIES;

const DEFAULT_ACCENT: ServiceAccent = {
    iconBg: "bg-primary/10 dark:bg-dark-primary/15",
    iconColor: "text-primary dark:text-dark-primary",
    hoverBorder:
        "group-hover:border-primary/40 dark:group-hover:border-dark-primary/40",
    wash: "from-primary/18 via-brand-violet/12 to-brand-blue/15",
};

type Json = Record<string, unknown>;

const str = (value: unknown, fallback = ""): string =>
    typeof value === "string" ? value : fallback;

const strList = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];

const objList = (value: unknown): Json[] =>
    Array.isArray(value)
        ? value.filter(
              (item): item is Json => !!item && typeof item === "object",
          )
        : [];

const points = (value: unknown): IndustryPoint[] =>
    objList(value)
        .map((p) => ({ title: str(p.title), body: str(p.body) }))
        .filter((p) => p.title || p.body);

function toIndustry(raw: Json): Industry {
    const accent = (raw.accent ?? {}) as Partial<ServiceAccent>;
    const seo = (raw.seo ?? {}) as Partial<Industry["seo"]>;
    const title = str(raw.title);
    const summary = str(raw.summary);

    return {
        slug: str(raw.slug),
        title,
        headline: str(raw.headline) || title,
        icon: str(raw.icon, "Building2"),
        tagline: str(raw.tagline),
        summary,
        heroImage: str(raw.heroImage) || undefined,
        heroImageAlt: str(raw.heroImageAlt) || undefined,
        intro: strList(raw.intro),
        audience: strList(raw.audience),
        challenges: points(raw.challenges),
        solutions: points(raw.solutions),
        services: strList(raw.services),
        stats: objList(raw.stats)
            .map((s) => ({ value: str(s.value), label: str(s.label) }))
            .filter((s) => s.value && s.label),
        faqs: objList(raw.faqs)
            .map((faq) => ({ q: str(faq.q), a: str(faq.a) }))
            .filter((faq) => faq.q && faq.a),
        ctaTitle: str(raw.ctaTitle) || undefined,
        ctaBody: str(raw.ctaBody) || undefined,
        accent: {
            iconBg: accent.iconBg || DEFAULT_ACCENT.iconBg,
            iconColor: accent.iconColor || DEFAULT_ACCENT.iconColor,
            hoverBorder: accent.hoverBorder || DEFAULT_ACCENT.hoverBorder,
            wash: accent.wash || DEFAULT_ACCENT.wash,
        },
        seo: {
            title: str(seo.title) || title,
            description: str(seo.description) || summary,
            keywords: strList(seo.keywords),
        },
    };
}

/** `null` when the API is unreachable or returns nothing usable. */
export async function fetchIndustries(
    init?: RequestInit,
): Promise<Industry[] | null> {
    try {
        // no-store: Next's build cache would otherwise reuse an old list.
        const res = await fetch(`${apiBaseUrl}/industries`, {
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
            ...init,
        });
        if (!res.ok) return null;

        const data = (await res.json()) as { industries?: unknown };
        const industries = objList(data.industries)
            .map(toIndustry)
            .filter((i) => i.slug && i.title);

        return industries.length > 0 ? industries : null;
    } catch {
        return null;
    }
}

/** Build-time / server loader — never throws, falls back to static data. */
export async function getIndustries(): Promise<Industry[]> {
    return (await fetchIndustries()) ?? STATIC_INDUSTRIES;
}

export function findIndustry(
    industries: Industry[],
    slug: string,
): Industry | undefined {
    return industries.find((industry) => industry.slug === slug);
}

/** The industry's picked services, in the order the admin chose; unknown slugs are dropped. */
export function industryServices(
    catalog: ServicesCatalog,
    industry: Industry,
): Service[] {
    return industry.services
        .map((slug) => findService(catalog, slug))
        .filter((service): service is Service => Boolean(service));
}

/** Neighbours in menu order, wrapping around — keeps internal links stable. */
export function relatedIndustries(
    industries: Industry[],
    industry: Industry,
    count = 6,
): Industry[] {
    const index = industries.findIndex((i) => i.slug === industry.slug);
    if (index === -1) return industries.slice(0, count);
    const others = [
        ...industries.slice(index + 1),
        ...industries.slice(0, index),
    ];
    return others.slice(0, count);
}

export interface IndustryMenuItem {
    slug: string;
    title: string;
    icon: string;
    href: string;
}

export function buildIndustryMenu(industries: Industry[]): IndustryMenuItem[] {
    return industries.map((industry) => ({
        slug: industry.slug,
        title: industry.title,
        icon: industry.icon,
        href: industryHref(industry.slug),
    }));
}

export interface IndustryMenuGroup {
    slug: string;
    title: string;
    icon: string;
    items: IndustryMenuItem[];
}

/** Desktop flyout categories, in display order. */
const GROUP_DEFINITIONS: {
    slug: string;
    title: string;
    icon: string;
    industries: string[];
}[] = [
    {
        slug: "mechanical",
        title: "Mechanical Trades",
        icon: "PlugZap",
        industries: ["hvac", "plumbing", "electrical"],
    },
    {
        slug: "exteriors",
        title: "Roofing & Exteriors",
        icon: "House",
        industries: ["roofing", "painting", "pressure-washing", "window-cleaning"],
    },
    {
        slug: "outdoor",
        title: "Lawn & Outdoor",
        icon: "Trees",
        industries: ["landscaping", "lawn-care", "tree-care", "pool-service"],
    },
    {
        slug: "cleaning",
        title: "Cleaning & Pest",
        icon: "SprayCan",
        industries: [
            "cleaning",
            "commercial-cleaning",
            "pest-control",
            "junk-removal",
        ],
    },
    {
        slug: "building",
        title: "Building & Repair",
        icon: "Hammer",
        industries: [
            "remodeling-renovations",
            "construction-contracting",
            "handyman",
        ],
    },
];

/**
 * Industries grouped for the desktop flyout. Items keep the admin's order;
 * industries outside the known categories land in "More industries", and
 * empty groups are dropped.
 */
export function buildIndustryMenuGroups(
    industries: Industry[],
): IndustryMenuGroup[] {
    const items = buildIndustryMenu(industries);
    const grouped = new Set<string>();

    const groups = GROUP_DEFINITIONS.map(({ industries: slugs, ...group }) => {
        const members = items.filter((item) => slugs.includes(item.slug));
        members.forEach((item) => grouped.add(item.slug));
        return { ...group, items: members };
    });

    groups.push({
        slug: "more",
        title: "More industries",
        icon: "Building2",
        items: items.filter((item) => !grouped.has(item.slug)),
    });

    return groups.filter((group) => group.items.length > 0);
}
