/**
 * Services catalog — what the dashboard's Admin → Services page manages.
 *
 * Reads `GET /api/services` and maps it onto the same `Service` /
 * `ServiceGroup` shapes as `data/servicesData.ts`, which stays as the fallback
 * whenever the API is unreachable (offline builds, API outage).
 *
 * Safe to import from server and client components.
 */

import { apiBaseUrl } from "@/config/api";
import {
    SERVICES,
    SERVICE_GROUPS,
    serviceHref,
    type Service,
    type ServiceAccent,
    type ServiceGroup,
    type ServiceGroupSlug,
    type ServiceIconName,
    type ServiceMenuGroup,
} from "@/data/servicesData";

export interface ServicesCatalog {
    groups: ServiceGroup[];
    services: Service[];
}

export const STATIC_SERVICES_CATALOG: ServicesCatalog = {
    groups: SERVICE_GROUPS,
    services: SERVICES,
};

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

function toGroup(raw: Json): ServiceGroup {
    return {
        slug: str(raw.slug) as ServiceGroupSlug,
        title: str(raw.title),
        blurb: str(raw.blurb),
        icon: str(raw.icon, "Sparkles") as ServiceIconName,
    };
}

function toService(raw: Json): Service {
    const accent = (raw.accent ?? {}) as Partial<ServiceAccent>;
    const seo = (raw.seo ?? {}) as Partial<Service["seo"]>;
    const title = str(raw.title);
    const summary = str(raw.summary);

    return {
        slug: str(raw.slug),
        title,
        group: str(raw.group) as ServiceGroupSlug,
        icon: str(raw.icon, "Sparkles") as ServiceIconName,
        tagline: str(raw.tagline),
        summary,
        intro: strList(raw.intro),
        deliverables: strList(raw.deliverables),
        idealFor: strList(raw.idealFor),
        process: objList(raw.process).map((step) => ({
            title: str(step.title),
            body: str(step.body),
        })),
        faqs: objList(raw.faqs).map((faq) => ({
            q: str(faq.q),
            a: str(faq.a),
        })),
        timeline: str(raw.timeline),
        startingAt: str(raw.startingAt),
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
export async function fetchServicesCatalog(
    init?: RequestInit,
): Promise<ServicesCatalog | null> {
    try {
        // no-store: Next's build cache would otherwise reuse an old catalog.
        const res = await fetch(`${apiBaseUrl}/services`, {
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
            ...init,
        });
        if (!res.ok) return null;

        const data = (await res.json()) as { groups?: unknown; services?: unknown };
        const groups = objList(data.groups).map(toGroup).filter((g) => g.slug);
        const services = objList(data.services)
            .map(toService)
            .filter((s) => s.slug && s.title);

        if (groups.length === 0 || services.length === 0) return null;
        return { groups, services };
    } catch {
        return null;
    }
}

/** Build-time / server loader — never throws, falls back to static data. */
export async function getServicesCatalog(): Promise<ServicesCatalog> {
    return (await fetchServicesCatalog()) ?? STATIC_SERVICES_CATALOG;
}

export function findService(
    catalog: ServicesCatalog,
    slug: string,
): Service | undefined {
    return catalog.services.find((service) => service.slug === slug);
}

export function findGroup(
    catalog: ServicesCatalog,
    slug: string,
): ServiceGroup | undefined {
    return catalog.groups.find((group) => group.slug === slug);
}

export function servicesInGroup(
    catalog: ServicesCatalog,
    slug: string,
): Service[] {
    return catalog.services.filter((service) => service.group === slug);
}

/** Groups that have at least one published service, in catalog order. */
export function visibleGroups(catalog: ServicesCatalog): ServiceGroup[] {
    return catalog.groups.filter(
        (group) => servicesInGroup(catalog, group.slug).length > 0,
    );
}

/** Same group first, topped up from other groups when the group is small. */
export function relatedServices(
    catalog: ServicesCatalog,
    service: Service,
    count = 3,
): Service[] {
    const siblings = servicesInGroup(catalog, service.group).filter(
        (item) => item.slug !== service.slug,
    );
    if (siblings.length >= count) return siblings.slice(0, count);
    return [
        ...siblings,
        ...catalog.services.filter(
            (item) =>
                item.group !== service.group && item.slug !== service.slug,
        ),
    ].slice(0, count);
}

export function buildServiceMenu(catalog: ServicesCatalog): ServiceMenuGroup[] {
    return visibleGroups(catalog).map((group) => ({
        ...group,
        items: servicesInGroup(catalog, group.slug).map((service) => ({
            slug: service.slug,
            title: service.title,
            href: serviceHref(service.slug),
            summary: service.summary,
        })),
    }));
}
