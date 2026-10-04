"use client";

/**
 * Desktop navigation. Services and Industries open the same two-level flyout
 * (see FlyoutMenu): groups on the left, the hovered group's items on the right.
 *
 * Every label comes from the live catalogs (falling back to `data/*Data.ts`),
 * so adding a service or industry adds it to these menus.
 */

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import FlyoutMenu from "@/components/home/nav/FlyoutMenu";
import { siteConfig } from "@/config/site";
import { INDUSTRIES_BASE_PATH } from "@/data/industriesData";
import { SERVICES_BASE_PATH } from "@/data/servicesData";
import { buildIndustryMenuGroups } from "@/lib/industries-catalog";
import { buildServiceMenu } from "@/lib/services-catalog";
import { useIndustries } from "@/lib/useIndustries";
import { useServicesCatalog } from "@/lib/useServicesCatalog";
import { cn } from "@/lib/utils";

export interface NavLink {
    name: string;
    href: string;
    /** Renders the services or industries flyout instead of a link. */
    mega?: "services" | "industries";
}

export default function DesktopNav({ navLinks }: { navLinks: NavLink[] }) {
    const pathname = usePathname();
    const catalog = useServicesCatalog();
    const serviceMenu = useMemo(() => buildServiceMenu(catalog), [catalog]);
    const industries = useIndustries();
    const industryMenu = useMemo(
        () => buildIndustryMenuGroups(industries),
        [industries],
    );

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    const linkClass = (href: string) =>
        cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            "text-slate-600 dark:text-slate-300",
            "hover:text-primary dark:hover:text-white/70",
            "hover:bg-slate-100/70 dark:hover:bg-slate-800/50",
            isActive(href) &&
                "text-primary dark:text-white bg-slate-100/70 dark:bg-slate-800/50",
        );

    return (
        <nav
            className="hidden md:flex items-center space-x-1 lg:space-x-2"
            aria-label="Primary"
        >
            {navLinks.map((link) => {
                if (link.mega === "services") {
                    return (
                        <FlyoutMenu
                            key={link.name}
                            label={link.name}
                            triggerClassName={linkClass(link.href)}
                            groups={serviceMenu}
                            itemNoun="services"
                            footer={{
                                label: "View all services",
                                href: "/services",
                            }}
                            groupFooter={{
                                label: "Our service & team",
                                href: SERVICES_BASE_PATH,
                            }}
                        />
                    );
                }

                if (link.mega === "industries") {
                    return (
                        <FlyoutMenu
                            key={link.name}
                            label={link.name}
                            triggerClassName={linkClass(link.href)}
                            groups={industryMenu}
                            itemNoun="industries"
                            footer={{
                                label: "View all industries",
                                href: INDUSTRIES_BASE_PATH,
                            }}
                            groupFooter={{
                                label: "Book a free call",
                                href: `${siteConfig.contactPath}/#book-a-call`,
                            }}
                        />
                    );
                }

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        scroll={true}
                        className={linkClass(link.href)}
                    >
                        {link.name}
                    </Link>
                );
            })}
        </nav>
    );
}
