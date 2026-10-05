"use client";

import { useEffect, type ReactNode } from "react";

import IndustryDetail from "@/components/industries/IndustryDetail";
import LoadErrorView from "@/components/ui/LoadErrorView";
import NotFoundView from "@/components/ui/NotFoundView";
import PageLoader from "@/components/ui/PageLoader";
import { INDUSTRIES_BASE_PATH, type Industry } from "@/data/industriesData";
import type { Service } from "@/data/servicesData";
import {
    fetchIndustries,
    findIndustry,
    industryServices,
    relatedIndustries,
} from "@/lib/industries-catalog";
import { LIVE_ROUTES } from "@/lib/live-routes";
import {
    STATIC_SERVICES_CATALOG,
    fetchServicesCatalog,
} from "@/lib/services-catalog";
import { useLiveLookup, type LiveLookup } from "@/lib/useLiveLookup";

type Found = { industry: Industry; services: Service[]; related: Industry[] };

async function loadIndustry(slug: string): Promise<LiveLookup<Found>> {
    const [industries, catalog] = await Promise.all([
        fetchIndustries(),
        fetchServicesCatalog(),
    ]);
    if (!industries) return { status: "error" };
    const industry = findIndustry(industries, slug);
    if (!industry) return { status: "missing" };
    return {
        status: "found",
        data: {
            industry,
            services: industryServices(catalog ?? STATIC_SERVICES_CATALOG, industry),
            related: relatedIndustries(industries, industry),
        },
    };
}

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
    const { slug, lookup, retry } = useLiveLookup(
        LIVE_ROUTES.industry,
        loadIndustry,
    );

    useEffect(() => {
        if (lookup?.status !== "found") return;
        const { industry } = lookup.data;
        document.title = industry.seo.title || industry.headline;
    }, [lookup]);

    if (!slug) return <>{children}</>;
    if (!lookup) return <PageLoader label="Loading industry" />;

    if (lookup.status === "error") {
        return (
            <LoadErrorView
                onRetry={retry}
                backHref={INDUSTRIES_BASE_PATH}
                backLabel="Browse all industries"
            />
        );
    }

    if (lookup.status === "missing") {
        return (
            <NotFoundView
                title="Industry not found"
                message="We could not find an industry page at this address. It may have been renamed or retired."
                action={{ href: INDUSTRIES_BASE_PATH, label: "Browse all industries" }}
            />
        );
    }

    return (
        <IndustryDetail
            industry={lookup.data.industry}
            services={lookup.data.services}
            related={lookup.data.related}
        />
    );
}
