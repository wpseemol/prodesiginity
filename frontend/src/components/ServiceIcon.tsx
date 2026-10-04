/**
 * Maps the icon names stored for services (static data and the admin-managed
 * catalog) back to lucide icons.
 *
 * Why a map instead of putting the component in the data: service objects are
 * passed from server to client components, and React components cannot be
 * serialised across that boundary. A string survives the trip.
 */

import { Sparkles } from "lucide-react";

import { SERVICE_ICON_MAP } from "@/components/serviceIconRegistry";

export default function ServiceIcon({
    name,
    className,
}: {
    name: string;
    className?: string;
}) {
    const Icon = SERVICE_ICON_MAP[name] ?? Sparkles;
    return <Icon className={className} aria-hidden="true" />;
}
