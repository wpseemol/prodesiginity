"use client";

/**
 * Desktop navigation with a two-level Services flyout.
 *
 * Level 1 lists the service GROUPS (Web Design, SEO & Marketing, ...).
 * Level 2 lists the SERVICES inside the hovered group, in a panel that opens
 * to the right — the cascading pattern from the reference screenshots.
 *
 * Every label comes from `data/servicesData.ts`. Nothing is hardcoded here, so
 * adding a service to that file adds it to this menu.
 *
 * Interaction notes:
 *  - Hover opens, but a short close delay keeps the menu alive while the
 *    pointer crosses the gap between the trigger and the panel.
 *  - Everything is reachable by keyboard: Enter/Space toggles, ArrowDown moves
 *    into the panel, ArrowRight opens a group, Escape closes and restores
 *    focus to the trigger.
 *  - The panel closes on route change, which matters because Next does a soft
 *    navigation and the component never unmounts.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react";

import ServiceIcon from "@/components/ServiceIcon";
import {
    SERVICE_MENU,
    SERVICES_BASE_PATH,
    type ServiceGroupSlug,
} from "@/data/servicesData";
import { cn } from "@/lib/utils";

export interface NavLink {
    name: string;
    href: string;
    /** When true this entry renders the cascading services flyout. */
    mega?: boolean;
}

const CLOSE_DELAY = 140;

export default function DesktopNav({ navLinks }: { navLinks: NavLink[] }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [activeGroup, setActiveGroup] = useState<ServiceGroupSlug>(
        SERVICE_MENU[0].slug,
    );

    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const cancelClose = useCallback(() => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    }, []);

    const scheduleClose = useCallback(() => {
        cancelClose();
        closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
    }, [cancelClose]);

    /**
     * Soft navigation keeps this component mounted, so the panel has to be
     * closed explicitly when the URL changes. Compared during render rather
     * than in an effect, which would leave the menu open over the new page for
     * a frame.
     */
    const [lastPath, setLastPath] = useState(pathname);
    if (lastPath !== pathname) {
        setLastPath(pathname);
        setOpen(false);
    }

    useEffect(() => () => cancelClose(), [cancelClose]);

    // Click anywhere outside the trigger or panel closes the menu.
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    const linkClass = (href: string) =>
        cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            "text-slate-600 dark:text-slate-300",
            "hover:text-primary dark:hover:text-white/70",
            "hover:bg-slate-100/70 dark:hover:bg-slate-800/50",
            isActive(href) && "text-primary dark:text-white bg-slate-100/70 dark:bg-slate-800/50",
        );

    const activeItems =
        SERVICE_MENU.find((group) => group.slug === activeGroup)?.items ?? [];

    return (
        <nav
            className="hidden md:flex items-center space-x-1 lg:space-x-2"
            aria-label="Primary"
        >
            {navLinks.map((link) => {
                if (!link.mega) {
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
                }

                return (
                    <div
                        key={link.name}
                        ref={wrapperRef}
                        className="relative"
                        onMouseEnter={() => {
                            cancelClose();
                            setOpen(true);
                        }}
                        onMouseLeave={scheduleClose}
                    >
                        <button
                            ref={triggerRef}
                            type="button"
                            aria-expanded={open}
                            aria-haspopup="true"
                            onClick={() => setOpen((value) => !value)}
                            onKeyDown={(event) => {
                                if (event.key === "ArrowDown") {
                                    event.preventDefault();
                                    setOpen(true);
                                }
                            }}
                            className={cn(
                                linkClass(link.href),
                                "inline-flex items-center gap-1.5",
                                open && "text-primary dark:text-white bg-slate-100/70 dark:bg-slate-800/50",
                            )}
                        >
                            {link.name}
                            <ChevronDown
                                className={cn(
                                    "w-3.5 h-3.5 transition-transform duration-200",
                                    open && "rotate-180",
                                )}
                                aria-hidden="true"
                            />
                        </button>

                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.16 }}
                                    // pt-2 is a deliberate transparent bridge:
                                    // without it the pointer leaves the trigger
                                    // before it reaches the panel.
                                    className="absolute left-0 top-full pt-2 flex items-start z-50"
                                >
                                    {/* ---- Level 1: groups ---- */}
                                    <div
                                        className="w-64 p-2 rounded-2xl bg-white/95 dark:bg-[#0d1220]/95 backdrop-blur-xl border border-border-color dark:border-dark-border-color shadow-2xl shadow-slate-900/10 dark:shadow-black/50"
                                        role="menu"
                                    >
                                        {SERVICE_MENU.map((group) => {
                                            const selected =
                                                group.slug === activeGroup;
                                            return (
                                                <button
                                                    key={group.slug}
                                                    type="button"
                                                    role="menuitem"
                                                    onMouseEnter={() =>
                                                        setActiveGroup(
                                                            group.slug,
                                                        )
                                                    }
                                                    onFocus={() =>
                                                        setActiveGroup(
                                                            group.slug,
                                                        )
                                                    }
                                                    onKeyDown={(event) => {
                                                        if (
                                                            event.key ===
                                                            "ArrowRight"
                                                        ) {
                                                            event.preventDefault();
                                                            setActiveGroup(
                                                                group.slug,
                                                            );
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-colors",
                                                        selected
                                                            ? "bg-slate-100 dark:bg-slate-800/70"
                                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/40",
                                                    )}
                                                >
                                                    <span className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-dark-primary/15 text-primary dark:text-dark-primary flex items-center justify-center shrink-0">
                                                        <ServiceIcon
                                                            name={group.icon}
                                                            className="w-4 h-4"
                                                        />
                                                    </span>
                                                    <span className="flex-1 min-w-0">
                                                        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                                                            {group.title}
                                                        </span>
                                                        <span className="block text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                                            {group.items.length}{" "}
                                                            services
                                                        </span>
                                                    </span>
                                                    <ChevronRight
                                                        className="w-4 h-4 text-slate-400 shrink-0"
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            );
                                        })}

                                        <Link
                                            href="/services"
                                            className="mt-1 flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-primary dark:text-dark-primary hover:bg-primary/10 transition-colors"
                                        >
                                            View all services
                                            <ArrowRight
                                                className="w-3.5 h-3.5"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                    </div>

                                    {/* ---- Level 2: services in the hovered group ---- */}
                                    <motion.div
                                        key={activeGroup}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.16 }}
                                        className="ml-2 w-72 p-2 mt-6 rounded-2xl bg-white/95 dark:bg-[#0d1220]/95 backdrop-blur-xl border border-border-color dark:border-dark-border-color shadow-2xl shadow-slate-900/10 dark:shadow-black/50"
                                        role="menu"
                                    >
                                        {activeItems.map((item) => (
                                            <Link
                                                key={item.slug}
                                                href={item.href}
                                                role="menuitem"
                                                className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                {item.title}
                                            </Link>
                                        ))}

                                        <Link
                                            href={SERVICES_BASE_PATH}
                                            className="mt-1 flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-primary dark:text-dark-primary hover:bg-primary/10 transition-colors"
                                        >
                                            Our service &amp; team
                                            <ArrowRight
                                                className="w-3.5 h-3.5"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </nav>
    );
}
