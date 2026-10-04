"use client";

/**
 * Two-level desktop flyout shared by the Services and Industries menus.
 *
 * Level 1 lists the GROUPS; level 2 lists the items inside the hovered group,
 * in a panel that opens to the right.
 *
 * Interaction notes:
 *  - Hover opens, but a short close delay keeps the menu alive while the
 *    pointer crosses the gap between the trigger and the panel.
 *  - Everything is reachable by keyboard: Enter/Space toggles, ArrowDown opens,
 *    ArrowRight opens a group, Escape closes and restores focus to the trigger.
 *  - The panel closes on route change, which matters because Next does a soft
 *    navigation and the component never unmounts.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";

import ServiceIcon from "@/components/ServiceIcon";
import { cn } from "@/lib/utils";

export interface FlyoutItem {
    slug: string;
    title: string;
    href: string;
}

export interface FlyoutGroup {
    slug: string;
    title: string;
    icon: string;
    items: FlyoutItem[];
}

export interface FlyoutLink {
    label: string;
    href: string;
}

const CLOSE_DELAY = 140;

export default function FlyoutMenu({
    label,
    triggerClassName,
    groups,
    itemNoun,
    footer,
    groupFooter,
}: {
    label: string;
    triggerClassName: string;
    groups: FlyoutGroup[];
    /** Plural noun for the "4 services" count under each group. */
    itemNoun: string;
    /** Link at the bottom of the group list. */
    footer: FlyoutLink;
    /** Link at the bottom of the item panel. */
    groupFooter: FlyoutLink;
}) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [hoveredGroup, setHoveredGroup] = useState(groups[0]?.slug ?? "");
    const activeGroup = groups.some((group) => group.slug === hoveredGroup)
        ? hoveredGroup
        : (groups[0]?.slug ?? "");

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
     * Compared during render rather than in an effect, which would leave the
     * menu open over the new page for a frame.
     */
    const [lastPath, setLastPath] = useState(pathname);
    if (lastPath !== pathname) {
        setLastPath(pathname);
        setOpen(false);
    }

    useEffect(() => () => cancelClose(), [cancelClose]);

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

    return (
        <div
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
                    triggerClassName,
                    "inline-flex items-center gap-1.5",
                    open &&
                        "text-primary dark:text-white bg-slate-100/70 dark:bg-slate-800/50",
                )}
            >
                {label}
                <ChevronDown
                    className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        open && "rotate-180 relative",
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
                        className="absolute left-0 top-full pt-2 flex items-start z-50"
                    >
                        {/* ---- Level 1: groups ---- */}
                        <div
                            className="relative w-64 p-2 rounded-2xl bg-white/95 dark:bg-[#0d1220]/95 backdrop-blur-xl border border-border-color dark:border-dark-border-color shadow-2xl shadow-slate-900/10 dark:shadow-black/50"
                            role="menu"
                        >
                            {groups.map((group) => {
                                const selected = group.slug === activeGroup;
                                return (
                                    <div key={group.slug} className="relative">
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onMouseEnter={() =>
                                                setHoveredGroup(group.slug)
                                            }
                                            onFocus={() =>
                                                setHoveredGroup(group.slug)
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === "ArrowRight") {
                                                    event.preventDefault();
                                                    setHoveredGroup(group.slug);
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
                                                    {itemNoun}
                                                </span>
                                            </span>
                                            <ChevronRight
                                                className="w-4 h-4 text-slate-400 shrink-0"
                                                aria-hidden="true"
                                            />
                                        </button>

                                        {/* ---- Level 2: items in the hovered group ---- */}
                                        {selected && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -8 }}
                                                transition={{ duration: 0.16 }}
                                                className="absolute left-[calc(100%+0.5rem)] top-0 w-72 p-2 rounded-2xl bg-white/95 dark:bg-[#0d1220]/95 backdrop-blur-xl border border-border-color dark:border-dark-border-color shadow-2xl shadow-slate-900/10 dark:shadow-black/50"
                                                role="menu"
                                            >
                                                <div className="space-y-0.5">
                                                    {group.items.map((item) => (
                                                        <Link
                                                            key={item.slug}
                                                            href={item.href}
                                                            role="menuitem"
                                                            aria-current={
                                                                pathname.startsWith(
                                                                    item.href,
                                                                )
                                                                    ? "page"
                                                                    : undefined
                                                            }
                                                            className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors aria-[current=page]:text-primary dark:aria-[current=page]:text-white"
                                                        >
                                                            {item.title}
                                                        </Link>
                                                    ))}
                                                </div>

                                                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                                                    <Link
                                                        href={groupFooter.href}
                                                        className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-primary dark:text-dark-primary hover:bg-primary/10 transition-colors"
                                                    >
                                                        {groupFooter.label}
                                                        <ArrowRight
                                                            className="w-3.5 h-3.5"
                                                            aria-hidden="true"
                                                        />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}

                            <Link
                                href={footer.href}
                                className="mt-1 flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-primary dark:text-dark-primary hover:bg-primary/10 transition-colors"
                            >
                                {footer.label}
                                <ArrowRight
                                    className="w-3.5 h-3.5"
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
