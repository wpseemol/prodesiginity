"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import ServiceIcon from "@/components/ServiceIcon";
import { serviceHref } from "@/data/servicesData";
import {
    servicesInGroup,
    visibleGroups,
    type ServicesCatalog,
} from "@/lib/services-catalog";
import { useServicesCatalog } from "@/lib/useServicesCatalog";

export default function ServicesByGroupGrid({
    initialCatalog,
}: {
    initialCatalog: ServicesCatalog;
}) {
    const catalog = useServicesCatalog(initialCatalog);

    return (
        <div className="mt-12 space-y-12">
            {visibleGroups(catalog).map((group) => (
                <div key={group.slug}>
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary dark:text-dark-primary flex items-center justify-center shrink-0">
                            <ServiceIcon name={group.icon} className="w-5 h-5" />
                        </span>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                {group.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {group.blurb}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {servicesInGroup(catalog, group.slug).map((service) => (
                            <Link
                                key={service.slug}
                                href={serviceHref(service.slug)}
                                className={`group p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color ${service.accent.hoverBorder} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col`}
                            >
                                <div
                                    className={`w-11 h-11 rounded-xl ${service.accent.iconBg} ${service.accent.iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                                >
                                    <ServiceIcon
                                        name={service.icon}
                                        className="w-5 h-5"
                                    />
                                </div>
                                <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug flex items-start gap-1">
                                    {service.title}
                                    <ArrowUpRight
                                        className="w-3.5 h-3.5 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-hidden="true"
                                    />
                                </h4>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                                    {service.summary}
                                </p>
                                <span className="mt-4 text-[11px] font-bold uppercase tracking-widest text-primary dark:text-dark-primary">
                                    {service.timeline}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
