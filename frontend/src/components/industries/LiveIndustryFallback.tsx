"use client";

import {
    useEffect,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";

import IndustryDetail from "@/components/industries/IndustryDetail";
import { INDUSTRIES_BASE_PATH, type Industry } from "@/data/industriesData";
import type { Service } from "@/data/servicesData";
import {
    fetchIndustries,
    findIndustry,
    industryServices,
    relatedIndustries,
} from "@/lib/industries-catalog";
import {
    STATIC_SERVICES_CATALOG,
    fetchServicesCatalog,
} from "@/lib/services-catalog";

const INDUSTRY_PATH = new RegExp(`^${INDUSTRIES_BASE_PATH}/([^/]+)/?$`);

const subscribe = () => () => {};

/**
 * Read the browser URL: on the static 404 page the router's pathname is the
 * not-found route, not what the visitor requested.
 */
function requestedIndustrySlug(): string | null {
    const match = window.location.pathname.match(INDUSTRY_PATH);
    return match ? decodeURIComponent(match[1]) : null;
}

type Lookup = {
    slug: string;
    industry?: Industry;
    services: Service[];
    related: Industry[];
};

/**
 * The static host serves 404.html for any URL it has no file for, including
 * industries created in the dashboard after the last build. This looks the
 * slug up in the live API and renders the page; anything else shows
 * `children`.
 */
export default function LiveIndustryFallback({
    children,
}: {
    children: ReactNode;
}) {
    const slug = useSyncExternalStore(
        subscribe,
        requestedIndustrySlug,
        () => null,
    );
    const [lookup, setLookup] = useState<Lookup | null>(null);

    useEffect(() => {
        if (!slug) return;
        let active = true;

        void Promise.all([fetchIndustries(), fetchServicesCatalog()]).then(
            ([industries, catalog]) => {
                if (!active) return;
                const industry = industries
                    ? findIndustry(industries, slug)
                    : undefined;
                if (industry) {
                    document.title = industry.seo.title || industry.headline;
                }
                setLookup({
                    slug,
                    industry,
                    services: industry
                        ? industryServices(
                              catalog ?? STATIC_SERVICES_CATALOG,
                              industry,
                          )
                        : [],
                    related:
                        industry && industries
                            ? relatedIndustries(industries, industry)
                            : [],
                });
            },
        );

        return () => {
            active = false;
        };
    }, [slug]);

    if (!slug) return <>{children}</>;

    if (lookup?.slug !== slug) {
        return (
            <div
                className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-[#070B14]"
                aria-busy="true"
            >
                <span className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
        );
    }

    if (lookup.industry) {
        return (
            <IndustryDetail
                industry={lookup.industry}
                services={lookup.services}
                related={lookup.related}
            />
        );
    }

    return <>{children}</>;
}
