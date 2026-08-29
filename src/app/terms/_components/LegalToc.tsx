"use client";

import { useEffect, useState } from "react";
import { ListTree, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
    id: string;
    title: string;
}

/**
 * app/_components/legal/LegalToc.tsx
 * ---------------------------------------------------------------------------
 * Sticky contents list with scroll spy.
 *
 * Sticky on lg and up; a collapsed <details> on mobile so a 6,000-word policy
 * doesn't open with a full screen of navigation. Uses native disclosure rather
 * than custom state so it works before hydration and with a keyboard.
 */
export default function LegalToc({ items }: { items: TocItem[] }) {
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
            // Focus the band just below the sticky header.
            { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
        );

        const nodes = items
            .map((item) => document.getElementById(item.id))
            .filter((node): node is HTMLElement => node !== null);

        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [items]);

    const list = (
        <nav aria-label="Document sections">
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
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                                    isActive
                                        ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100",
                                )}
                            >
                                <span
                                    className={cn(
                                        "w-5 shrink-0 pt-px text-right font-mono text-[11px] tabular-nums",
                                        isActive
                                            ? "text-indigo-500 dark:text-indigo-400"
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
            <details className=" lg:hidden group rounded-2xl border border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-white">
                    <ListTree className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    Jump to a section
                    <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400">
                        {items.length}
                    </span>
                </summary>
                <div className="border-t border-slate-200 p-2 dark:border-slate-800">
                    {list}
                </div>
            </details>

            {/* Desktop: sticky rail */}
            <aside className="hidden lg:block">
                <div className="sticky top-24 self-start">
                    <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                        Contents
                    </p>

                    <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
                        {list}
                    </div>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400"
                    >
                        <Printer className="h-3.5 w-3.5" />
                        Print or save as PDF
                    </button>
                </div>
            </aside>
        </>
    );
}
