"use client";

/**
 * components/blog/PostToc.tsx
 * ---------------------------------------------------------------------------
 * Contents rail with scroll spy. A sticky card from lg up (the sticky wrapper
 * lives in BlogPostView); a native <details> on mobile so a long article does
 * not open with a screen of navigation.
 *
 * Native disclosure rather than custom state, so it works before hydration and
 * with a keyboard for free.
 *
 * The effects here are not state synchronisation — they subscribe to browser
 * APIs (IntersectionObserver, scroll), which is exactly what effects are for.
 * Same scroll-spy approach as LegalToc, deliberately, so the two behave
 * identically.
 */

import { useEffect, useState } from "react";
import { ArrowUp, Clock, ListTree } from "lucide-react";

import type { TocItem } from "@/lib/blog";
import { cn } from "@/lib/utils";

/** Matches the `top-28` sticky offset in BlogPostView. */
const STICKY_OFFSET = 112;

interface PostTocProps {
    items: TocItem[];
    minutes?: number;
}

export default function PostToc({ items, minutes }: PostTocProps) {
    const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
    const [progress, setProgress] = useState(0);

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
            { rootMargin: `-${STICKY_OFFSET}px 0px -70% 0px`, threshold: 0 },
        );

        const nodes = items
            .map((item) => document.getElementById(item.id))
            .filter((node): node is HTMLElement => node !== null);

        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [items]);

    useEffect(() => {
        const body = document.getElementById("article-body");
        if (!body) return;

        let frame = 0;
        const measure = () => {
            frame = 0;
            const rect = body.getBoundingClientRect();
            const travel = rect.height - window.innerHeight + STICKY_OFFSET;
            const done = travel > 0 ? (STICKY_OFFSET - rect.top) / travel : 1;
            setProgress(Math.min(1, Math.max(0, done)));
        };
        const onScroll = () => {
            if (!frame) frame = window.requestAnimationFrame(measure);
        };

        measure();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (frame) window.cancelAnimationFrame(frame);
        };
    }, []);

    if (items.length === 0) return null;

    const activeIndex = Math.max(
        items.findIndex((item) => item.id === activeId),
        0,
    );
    const percent = Math.round(progress * 100);

    const list = (
        <nav aria-label="Article contents">
            <ol className="relative space-y-0.5">
                {items.map((item, index) => {
                    const isActive = activeId === item.id;
                    const isPast = index < activeIndex;

                    return (
                        <li key={item.id} className="relative">
                            <a
                                href={`#${item.id}`}
                                aria-current={isActive ? "location" : undefined}
                                className={cn(
                                    "group relative flex gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    isActive
                                        ? "bg-linear-to-r from-primary/15 to-primary/5 font-semibold text-primary dark:from-dark-primary/20 dark:to-dark-primary/5 dark:text-dark-primary"
                                        : isPast
                                          ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
                                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100",
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-linear-to-b from-brand-violet to-brand-blue transition-opacity duration-200 dark:from-dark-brand-violet dark:to-dark-brand-blue",
                                        isActive ? "opacity-100" : "opacity-0",
                                    )}
                                />
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

            {/* Desktop: sticky card */}
            <div className="relative hidden overflow-hidden rounded-3xl border border-border-color bg-card-bg/80 shadow-lg shadow-slate-900/5 backdrop-blur-xl lg:block dark:border-dark-border-color dark:bg-dark-card-bg/80 dark:shadow-black/30">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-3xl"
                />

                <div className="relative flex items-center justify-between gap-3 px-5 pb-3 pt-5">
                    <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-900 dark:text-white">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-brand-violet to-brand-blue text-white shadow-md shadow-primary/30 dark:from-dark-brand-violet dark:to-dark-brand-blue">
                            <ListTree className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        Contents
                    </p>
                    <span className="font-mono text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                        {String(activeIndex + 1).padStart(2, "0")}/
                        {String(items.length).padStart(2, "0")}
                    </span>
                </div>

                <div
                    className="relative mx-5 h-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800"
                    role="progressbar"
                    aria-label="Reading progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                >
                    <div
                        className="h-full rounded-full bg-linear-to-r from-brand-violet to-brand-blue transition-[width] duration-150 ease-out dark:from-dark-brand-violet dark:to-dark-brand-blue"
                        style={{ width: `${percent}%` }}
                    />
                </div>

                <div className="relative max-h-[calc(100vh-20rem)] overflow-y-auto px-2 py-3">
                    {list}
                </div>

                <div className="relative flex items-center justify-between gap-3 border-t border-border-color px-5 py-3 text-[11px] font-semibold text-slate-500 dark:border-dark-border-color dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {minutes ? `${minutes} min read · ` : ""}
                        <span className="tabular-nums">{percent}%</span>
                    </span>
                    <a
                        href="#top"
                        onClick={(e) => {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-slate-800/60 dark:hover:text-dark-primary"
                    >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                        Top
                    </a>
                </div>
            </div>
        </>
    );
}
