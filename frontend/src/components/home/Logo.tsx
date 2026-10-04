"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";

const noopSubscribe = () => () => {};

export default function Logo() {
    const { theme } = useTheme();
    // false during the static/SSR render, true once hydrated (theme is only known on the client).
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

    if (!mounted) {
        return <div className="h-10 w-[160px]" />;
    }

    return (
        <Link href="/" className="flex items-center group select-none">
            <div className="relative h-10 w-[160px] transition-transform duration-200 group-hover:scale-105">
                <AnimatePresence mode="wait">
                    {theme === "dark" ? (
                        <motion.div
                            key="dark-logo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src="/assets/logo/prodesignity-logo-dark.png"
                                width={125}
                                height={40}
                                alt="ProDesignity Logo"
                                className="h-full w-auto object-contain"
                                priority
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="light-logo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src="/assets/logo/prodesignity-logo-light.svg"
                                width={125}
                                height={40}
                                alt="ProDesignity Logo"
                                className="h-full w-auto object-contain"
                                priority
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Link>
    );
}
