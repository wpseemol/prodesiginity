"use client";

/**
 * components/blog/PostToc.tsx
 * ---------------------------------------------------------------------------
 * Contents rail with scroll spy. Sticky from lg up; a native <details> on
 * mobile so a long article does not open with a screen of navigation.
 *
 * Native disclosure rather than custom state, so it works before hydration and
 * with a keyboard for free.
 *
 * The useEffect here is not state synchronisation — it subscribes to a browser
 * API (IntersectionObserver), which is exactly what effects are for. Same
 * approach as LegalToc, deliberately, so the two behave identically.
 */

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";

import type { TocItem } from "@/lib/blog";
import { cn } from "@/lib/utils";

export default function PostToc({ items }: { items: TocItem[] }) {
    const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    );

                if (visible[0]) setActiveId(visible[0].target.id);
            },
            // Watch the band just below the sticky header.
            { rootMargin: "-112px 0px -70% 0px", threshold: 0 },
        );

        const nodes = items
            .map((item) => document.getElementById(item.id))
            .filter((node): node is HTMLElement => node !== null);

        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [items]);

    if (items.length === 0) return null;

    const list = (
        <nav aria-label="Article contents">
            <ol className="space-y-0.5">
                {items.map((item, index) => {
                    const isActive = activeId === item.id;

                    return (
                        <li key={item.id}>
                            <a
                                href={`#${item.id}`}
                                aria-current={isActive ? "location" : undefined}
                                className={cn(
                                    "group flex gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    isActive
                                        ? "bg-primary/10 font-semibold text-primary dark:text-dark-primary"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100",
                                )}
                            >
                                <span
                                    className={cn(
                                        "w-5 shrink-0 pt-px text-right font-mono text-[11px] tabular-nums",
                                        isActive
                                            ? "text-primary dark:text-dark-primary"
                                            : "text-slate-400 dark:text-slate-600",
                                    )}
                                >
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="leading-snug">
                                    {item.title}
                                </span>
                            </a>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );

    return (
        <>
            {/* Mobile: collapsed by default */}
            <details className="group rounded-2xl border border-border-color bg-card-bg backdrop-blur lg:hidden dark:border-dark-border-color dark:bg-dark-card-bg">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden dark:text-white">
                    <ListTree
                        className="h-4 w-4 text-primary dark:text-dark-primary"
                        aria-hidden="true"
                    />
                    Jump to a section
                    <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400">
                        {items.length}
                    </span>
                </summary>
                <div className="border-t border-border-color p-2 dark:border-dark-border-color">
                    {list}
                </div>
            </details>

            {/* Desktop: sticky rail */}
            <div className="hidden lg:block">
                <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    Contents
                </p>
                <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                    {list}
                </div>
            </div>
        </>
    );
}
