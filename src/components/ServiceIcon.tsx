/**
 * Maps the string keys stored in `data/servicesData.ts` back to lucide icons.
 *
 * Why a map instead of putting the component in the data file: the data module
 * is imported by both server and client components. React components cannot be
 * serialised across that boundary, so a `Service` object carrying a live icon
 * component would throw the moment it was passed as a prop to a "use client"
 * component. A string survives the trip.
 */

import {
    AppWindow,
    BookOpen,
    Box,
    Film,
    Layout,
    ListChecks,
    Megaphone,
    PackageSearch,
    Palette,
    SearchCheck,
    ShoppingBag,
    Sparkles,
    Video,
    type LucideIcon,
} from "lucide-react";

import type { ServiceIconName } from "@/data/servicesData";

export const SERVICE_ICONS: Record<ServiceIconName, LucideIcon> = {
    AppWindow,
    BookOpen,
    Box,
    Film,
    Layout,
    ListChecks,
    Megaphone,
    PackageSearch,
    Palette,
    SearchCheck,
    ShoppingBag,
    Sparkles,
    Video,
};

export default function ServiceIcon({
    name,
    className,
}: {
    name: ServiceIconName;
    className?: string;
}) {
    const Icon = SERVICE_ICONS[name] ?? Sparkles;
    return <Icon className={className} aria-hidden="true" />;
}
