"use client";

import { useEffect } from "react";

import IndustryDetail from "@/components/industries/IndustryDetail";
import NotFoundView from "@/components/ui/NotFoundView";
import PageLoader from "@/components/ui/PageLoader";
import { INDUSTRIES_BASE_PATH, type Industry } from "@/data/industriesData";
import {
    findIndustry,
    industryServices,
    relatedIndustries,
} from "@/lib/industries-catalog";
import type { ServicesCatalog } from "@/lib/services-catalog";
import { useLiveIndustries } from "@/lib/useIndustries";
import { useLiveServicesCatalog } from "@/lib/useServicesCatalog";

/**
 * Renders the industry baked into the static export, then swaps in the live
 * API version so dashboard edits (and hiding it) show up without a redeploy.
 * Linked services come from the live services catalog too.
 */
export default function LiveIndustryDetail({
    slug,
    initialIndustries,
    initialCatalog,
}: {
    slug: string;
    initialIndustries: Industry[];
    initialCatalog: ServicesCatalog;
}) {
    const { industries, live } = useLiveIndustries(initialIndustries);
    const { catalog } = useLiveServicesCatalog(initialCatalog);
    const industry = findIndustry(industries, slug);

    useEffect(() => {
        if (!live || !industry) return;
        document.title = industry.seo.title || industry.headline;
        document
            .querySelector('meta[name="description"]')
            ?.setAttribute(
                "content",
                industry.seo.description || industry.summary,
            );
    }, [live, industry]);

    if (!industry) {
        if (!live) return <PageLoader label="Loading industry" />;
        return (
            <NotFoundView
                title="This industry page is no longer available"
                message="It may have been renamed or retired. Have a look at every industry we work with instead."
                action={{ href: INDUSTRIES_BASE_PATH, label: "Browse all industries" }}
            />
        );
    }

    return (
        <IndustryDetail
            industry={industry}
            services={industryServices(catalog, industry)}
            related={relatedIndustries(industries, industry)}
        />
    );
}
