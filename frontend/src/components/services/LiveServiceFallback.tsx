"use client";

import {
    useEffect,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";

import ServiceDetail from "@/components/services/ServiceDetail";
import { SERVICES_BASE_PATH, type Service } from "@/data/servicesData";
import {
    fetchServicesCatalog,
    findGroup,
    findService,
    relatedServices,
    type ServicesCatalog,
} from "@/lib/services-catalog";

const SERVICE_PATH = new RegExp(`^${SERVICES_BASE_PATH}/([^/]+)/?$`);

const subscribe = () => () => {};

/**
 * Read the browser URL: on the static 404 page the router's pathname is the
 * not-found route, not what the visitor requested.
 */
function requestedServiceSlug(): string | null {
    const match = window.location.pathname.match(SERVICE_PATH);
    return match ? decodeURIComponent(match[1]) : null;
}

type Lookup = {
    slug: string;
    catalog: ServicesCatalog | null;
    service: Service | undefined;
};

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
    const slug = useSyncExternalStore(
        subscribe,
        requestedServiceSlug,
        () => null,
    );
    const [lookup, setLookup] = useState<Lookup | null>(null);

    useEffect(() => {
        if (!slug) return;
        let active = true;

        void fetchServicesCatalog().then((catalog) => {
            if (!active) return;
            const service = catalog ? findService(catalog, slug) : undefined;
            if (service) document.title = service.seo.title || service.title;
            setLookup({ slug, catalog, service });
        });

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

    if (lookup.catalog && lookup.service) {
        return (
            <ServiceDetail
                service={lookup.service}
                group={findGroup(lookup.catalog, lookup.service.group)}
                related={relatedServices(lookup.catalog, lookup.service)}
            />
        );
    }

    return <>{children}</>;
}
