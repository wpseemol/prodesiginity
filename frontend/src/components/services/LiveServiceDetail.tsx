"use client";

import Link from "next/link";
import { useEffect } from "react";

import ServiceDetail from "@/components/services/ServiceDetail";
import {
    findGroup,
    findService,
    relatedServices,
    type ServicesCatalog,
} from "@/lib/services-catalog";
import { useLiveServicesCatalog } from "@/lib/useServicesCatalog";

/**
 * Renders the service baked into the static export, then swaps in the live
 * API version so dashboard edits (and hiding it) show up without a redeploy.
 */
export default function LiveServiceDetail({
    slug,
    initialCatalog,
}: {
    slug: string;
    initialCatalog: ServicesCatalog;
}) {
    const { catalog, live } = useLiveServicesCatalog(initialCatalog);
    const service = findService(catalog, slug);

    useEffect(() => {
        if (!live || !service) return;
        document.title = service.seo.title || service.title;
        document
            .querySelector('meta[name="description"]')
            ?.setAttribute("content", service.seo.description || service.summary);
    }, [live, service]);

    if (!service) {
        if (!live) return null;
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-4 text-center dark:bg-[#070B14]">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    This service is no longer available
                </h1>
                <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
                    It may have been renamed or retired. Have a look at
                    everything we offer instead.
                </p>
                <Link
                    href="/services"
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
                >
                    Browse all services
                </Link>
            </div>
        );
    }

    return (
        <ServiceDetail
            service={service}
            group={findGroup(catalog, service.group)}
            related={relatedServices(catalog, service)}
        />
    );
}
