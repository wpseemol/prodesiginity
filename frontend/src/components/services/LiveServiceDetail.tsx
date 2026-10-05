"use client";

import ServiceDetail from "@/components/services/ServiceDetail";
import {
    findGroup,
    findService,
    relatedServices,
    type ServicesCatalog,
} from "@/lib/services-catalog";
import { useServicesCatalog } from "@/lib/useServicesCatalog";

/**
 * Renders the service baked into the static export, then swaps in the live
 * API version so dashboard edits show up without a redeploy.
 */
export default function LiveServiceDetail({
    slug,
    initialCatalog,
}: {
    slug: string;
    initialCatalog: ServicesCatalog;
}) {
    const live = useServicesCatalog(initialCatalog);
    const catalog = findService(live, slug) ? live : initialCatalog;
    const service = findService(catalog, slug);

    if (!service) return null;

    return (
        <ServiceDetail
            service={service}
            group={findGroup(catalog, service.group)}
            related={relatedServices(catalog, service)}
        />
    );
}
