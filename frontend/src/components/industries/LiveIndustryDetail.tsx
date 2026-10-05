"use client";

import Link from "next/link";
import { useEffect } from "react";

import IndustryDetail from "@/components/industries/IndustryDetail";
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
        if (!live) return null;
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-4 text-center dark:bg-[#070B14]">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    This industry page is no longer available
                </h1>
                <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
                    It may have been renamed or retired. Have a look at every
                    industry we work with instead.
                </p>
                <Link
                    href={INDUSTRIES_BASE_PATH}
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
                >
                    Browse all industries
                </Link>
            </div>
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
