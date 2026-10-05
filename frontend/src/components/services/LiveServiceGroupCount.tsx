"use client";

import { visibleGroups, type ServicesCatalog } from "@/lib/services-catalog";
import { useServicesCatalog } from "@/lib/useServicesCatalog";

/** Number of service groups with at least one published service, kept live. */
export default function LiveServiceGroupCount({
    initialCatalog,
}: {
    initialCatalog: ServicesCatalog;
}) {
    return <>{visibleGroups(useServicesCatalog(initialCatalog)).length}</>;
}
