"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

interface NavLink {
    name: string;
    href: string;
}

export default function MobileMenu({ navLinks }: { navLinks: NavLink[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex items-center md:hidden">
            <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation menu"
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
                        className="absolute top-20 left-0 w-full bg-card-bg dark:bg-dark-card-bg backdrop-blur-xl border-b border-border-color dark:border-dark-border-color px-6 py-6 space-y-4 shadow-2xl z-50"
                    >
                        <nav className="flex flex-col space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-dark-primary hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                        <div className="pt-2">
                            <Link
                                href="/contact"
                                onClick={() => setIsOpen(false)}
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
