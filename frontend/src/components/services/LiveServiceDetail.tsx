"use client";

import { useEffect } from "react";

import ServiceDetail from "@/components/services/ServiceDetail";
import NotFoundView from "@/components/ui/NotFoundView";
import PageLoader from "@/components/ui/PageLoader";
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
        if (!live) return <PageLoader label="Loading service" />;
        return (
            <NotFoundView
                title="This service is no longer available"
                message="It may have been renamed or retired. Have a look at everything we offer instead."
                action={{ href: "/services", label: "Browse all services" }}
            />
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
