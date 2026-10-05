"use client";

import { useEffect, type ReactNode } from "react";

import ServiceDetail from "@/components/services/ServiceDetail";
import LoadErrorView from "@/components/ui/LoadErrorView";
import NotFoundView from "@/components/ui/NotFoundView";
import PageLoader from "@/components/ui/PageLoader";
import type { Service } from "@/data/servicesData";
import { LIVE_ROUTES } from "@/lib/live-routes";
import {
    fetchServicesCatalog,
    findGroup,
    findService,
    relatedServices,
    type ServicesCatalog,
} from "@/lib/services-catalog";
import { useLiveLookup, type LiveLookup } from "@/lib/useLiveLookup";

type Found = { catalog: ServicesCatalog; service: Service };

async function loadService(slug: string): Promise<LiveLookup<Found>> {
    const catalog = await fetchServicesCatalog();
    if (!catalog) return { status: "error" };
    const service = findService(catalog, slug);
    return service
        ? { status: "found", data: { catalog, service } }
        : { status: "missing" };
}

/**
 * The static host serves 404.html for any URL it has no file for, including
 * services created in the dashboard after the last build. This looks the slug
 * up in the live API and renders the service; anything else shows `children`.
 */
export default function LiveServiceFallback({
    children,
}: {
    children: ReactNode;
}) {
    const { slug, lookup, retry } = useLiveLookup(
        LIVE_ROUTES.service,
        loadService,
    );

    useEffect(() => {
        if (lookup?.status !== "found") return;
        const { service } = lookup.data;
        document.title = service.seo.title || service.title;
    }, [lookup]);

    if (!slug) return <>{children}</>;
    if (!lookup) return <PageLoader label="Loading service" />;

    if (lookup.status === "error") {
        return (
            <LoadErrorView
                onRetry={retry}
                backHref="/services"
                backLabel="Browse all services"
            />
        );
    }

    if (lookup.status === "missing") {
        return (
            <NotFoundView
                title="Service not found"
                message="We could not find a service at this address. It may have been renamed or retired."
                action={{ href: "/services", label: "Browse all services" }}
            />
        );
    }

    const { catalog, service } = lookup.data;
    return (
        <ServiceDetail
            service={service}
            group={findGroup(catalog, service.group)}
            related={relatedServices(catalog, service)}
        />
    );
}
