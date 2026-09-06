"use client";

/**
 * Mobile navigation.
 *
 * The desktop flyout has no sane touch equivalent, so the same data renders as
 * a two-level accordion instead: tap a group to expand its services. Labels and
 * hrefs come from `data/servicesData.ts`, exactly like DesktopNav — the two
 * menus cannot drift apart.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";

import ServiceIcon from "@/components/ServiceIcon";
import { SERVICE_MENU, SERVICES_BASE_PATH } from "@/data/servicesData";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/components/home/nav/DesktopNav";

export default function MobileMenu({ navLinks }: { navLinks: NavLink[] }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [openGroup, setOpenGroup] = useState<string | null>(null);
    const [servicesOpen, setServicesOpen] = useState(false);

    /**
     * Soft navigation leaves this component mounted, so the drawer has to be
     * closed explicitly when the URL changes. Done by comparing the path
     * during render rather than in an effect: an effect would paint the open
     * drawer over the new page for one frame first.
     */
    const [lastPath, setLastPath] = useState(pathname);
    if (lastPath !== pathname) {
        setLastPath(pathname);
        setIsOpen(false);
    }

    // A drawer that scrolls the page underneath it feels broken on a phone.
    useEffect(() => {
        if (!isOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isOpen]);

    const close = () => setIsOpen(false);

    return (
        <div className="flex items-center md:hidden">
            <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={isOpen}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card-bg transition-colors"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <Menu className="w-6 h-6" />
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-20 left-0 w-full max-h-[calc(100dvh-5rem)] overflow-y-auto bg-card-bg dark:bg-dark-card-bg backdrop-blur-xl border-b border-border-color dark:border-dark-border-color px-6 py-6 space-y-4 shadow-2xl z-50"
                    >
                        <nav className="flex flex-col space-y-1">
                            {navLinks.map((link) => {
                                if (!link.mega) {
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={close}
                                            className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-dark-primary hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all"
                                        >
                                            {link.name}
                                        </Link>
                                    );
                                }

                                return (
                                    <div key={link.name} className="space-y-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setServicesOpen((v) => !v)
                                            }
                                            aria-expanded={servicesOpen}
                                            className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all"
                                        >
                                            {link.name}
                                            <ChevronDown
                                                className={cn(
                                                    "w-4 h-4 transition-transform",
                                                    servicesOpen &&
                                                        "rotate-180",
                                                )}
                                                aria-hidden="true"
                                            />
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {servicesOpen && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.22,
                                                    }}
                                                    className="overflow-hidden pl-2 border-l border-border-color dark:border-dark-border-color ml-4 space-y-1"
                                                >
                                                    {SERVICE_MENU.map(
                                                        (group) => {
                                                            const expanded =
                                                                openGroup ===
                                                                group.slug;
                                                            return (
                                                                <div
                                                                    key={
                                                                        group.slug
                                                                    }
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        aria-expanded={
                                                                            expanded
                                                                        }
                                                                        onClick={() =>
                                                                            setOpenGroup(
                                                                                expanded
                                                                                    ? null
                                                                                    : group.slug,
                                                                            )
                                                                        }
                                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                                                                    >
                                                                        <span className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-dark-primary/15 text-primary dark:text-dark-primary flex items-center justify-center shrink-0">
                                                                            <ServiceIcon
                                                                                name={
                                                                                    group.icon
                                                                                }
                                                                                className="w-3.5 h-3.5"
                                                                            />
                                                                        </span>
                                                                        <span className="flex-1 text-left">
                                                                            {
                                                                                group.title
                                                                            }
                                                                        </span>
                                                                        <ChevronDown
                                                                            className={cn(
                                                                                "w-3.5 h-3.5 transition-transform",
                                                                                expanded &&
                                                                                    "rotate-180",
                                                                            )}
                                                                            aria-hidden="true"
                                                                        />
                                                                    </button>

                                                                    <AnimatePresence
                                                                        initial={
                                                                            false
                                                                        }
                                                                    >
                                                                        {expanded && (
                                                                            <motion.ul
                                                                                initial={{
                                                                                    height: 0,
                                                                                    opacity: 0,
                                                                                }}
                                                                                animate={{
                                                                                    height: "auto",
                                                                                    opacity: 1,
                                                                                }}
                                                                                exit={{
                                                                                    height: 0,
                                                                                    opacity: 0,
                                                                                }}
                                                                                transition={{
                                                                                    duration: 0.2,
                                                                                }}
                                                                                className="overflow-hidden ml-10 space-y-0.5"
                                                                            >
                                                                                {group.items.map(
                                                                                    (
                                                                                        item,
                                                                                    ) => (
                                                                                        <li
                                                                                            key={
                                                                                                item.slug
                                                                                            }
                                                                                        >
                                                                                            <Link
                                                                                                href={
                                                                                                    item.href
                                                                                                }
                                                                                                onClick={
                                                                                                    close
                                                                                                }
                                                                                                className="block px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-dark-primary hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                                                                                            >
                                                                                                {
                                                                                                    item.title
                                                                                                }
                                                                                            </Link>
                                                                                        </li>
                                                                                    ),
                                                                                )}
                                                                            </motion.ul>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            );
                                                        },
                                                    )}

                                                    <Link
                                                        href={
                                                            SERVICES_BASE_PATH
                                                        }
                                                        onClick={close}
                                                        className="block px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-primary dark:text-dark-primary hover:bg-primary/10 transition-colors"
                                                    >
                                                        Our service &amp; team
                                                    </Link>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </nav>

                        <div className="pt-2">
                            <Link
                                href="/contact/#book-a-call"
                                onClick={close}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue shadow-md transition-all"
                            >
                                <span>Get Started</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
