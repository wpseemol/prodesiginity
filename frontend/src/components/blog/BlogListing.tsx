"use client";

/**
 * components/blog/BlogListing.tsx
 * ---------------------------------------------------------------------------
 * The filterable grid on /blog.
 *
 * Client component because the filters are interactive, but the posts arrive
 * as props from the server page — nothing is fetched here, and the full list
 * is in the initial HTML. That matters: a crawler that does not run JavaScript
 * still sees every article title and link.
 *
 * There is no useEffect. The visible list is derived from the two pieces of
 * state during render, which is the pattern GEMINI.md asks for — an effect
 * that "syncs" filtered results into another state variable would give a
 * render with stale results and buy nothing.
 */

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import BlogCard from "@/components/blog/BlogCard";
import type { BlogPost } from "@/data/blog/types";
import { resolveTokens } from "@/lib/blog";
import { cn } from "@/lib/utils";

const ALL = "All";

interface BlogListingProps {
    posts: BlogPost[];
    categories: string[];
    /** Given the wide slot, but only while the list is unfiltered. */
    featured: BlogPost;
}

/** Everything a search should match, lowercased once per post. */
function haystack(post: BlogPost): string {
    return resolveTokens(
        [post.title, post.excerpt, post.category, ...post.tags].join(" "),
    ).toLowerCase();
}

export default function BlogListing({
    posts,
    categories,
    featured,
}: BlogListingProps) {
    const [category, setCategory] = useState<string>(ALL);
    const [query, setQuery] = useState("");

    const trimmed = query.trim().toLowerCase();
    const isBrowsing = category === ALL && trimmed === "";

    const index = useMemo(
        () => posts.map((post) => ({ post, text: haystack(post) })),
        [posts],
    );

    const matches = index
        .filter(({ post }) => category === ALL || post.category === category)
        .filter(({ text }) => trimmed === "" || text.includes(trimmed))
        .map(({ post }) => post);

    // The featured post gets the wide card at the top, so it is removed from
    // the grid below to avoid showing the same article twice.
    const gridPosts = isBrowsing
        ? matches.filter((post) => post.slug !== featured.slug)
        : matches;

    const counts = new Map<string, number>();
    for (const post of posts) {
        counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    }

    return (
        <div>
            {/* -----------------------------------------------------------
                Controls
                ----------------------------------------------------------- */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Filter articles by category"
                >
                    {[ALL, ...categories].map((item) => {
                        const isActive = category === item;
                        const count =
                            item === ALL ? posts.length : (counts.get(item) ?? 0);

                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setCategory(item)}
                                aria-pressed={isActive}
                                className={cn(
                                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#070B14]",
                                    isActive
                                        ? "border-primary/40 bg-primary text-white shadow-lg shadow-primary/25"
                                        : "border-border-color bg-card-bg text-slate-600 hover:border-primary/40 hover:text-primary dark:border-dark-border-color dark:bg-dark-card-bg dark:text-slate-300 dark:hover:text-dark-primary",
                                )}
                            >
                                {item}
                                <span
                                    className={cn(
                                        "text-[11px] tabular-nums",
                                        isActive
                                            ? "text-white/70"
                                            : "text-slate-400 dark:text-slate-500",
                                    )}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="relative lg:w-72">
                    <Search
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search articles"
                        aria-label="Search articles"
                        className={cn(
                            "w-full rounded-2xl border border-border-color bg-card-bg py-3 pl-11 pr-10 text-sm text-slate-800 shadow-sm transition-colors",
                            "placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                            "dark:border-dark-border-color dark:bg-dark-card-bg dark:text-slate-100 dark:placeholder:text-slate-500",
                        )}
                    />
                    {query !== "" && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* -----------------------------------------------------------
                Results
                ----------------------------------------------------------- */}
            <div className="mt-10">
                {matches.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border-color bg-card-bg px-6 py-16 text-center dark:border-dark-border-color dark:bg-dark-card-bg">
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                            No articles match that yet
                        </p>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                            Try a different keyword, or browse everything we
                            have published.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setCategory(ALL);
                                setQuery("");
                            }}
                            className="mt-6 inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            Show all articles
                        </button>
                    </div>
                ) : (
                    <>
                        {isBrowsing && (
                            <div className="mb-6">
                                <BlogCard post={featured} variant="featured" />
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {gridPosts.map((post) => (
                                <BlogCard key={post.slug} post={post} />
                            ))}
                        </div>

                        {!isBrowsing && (
                            <p
                                className="mt-8 text-sm text-slate-500 dark:text-slate-400"
                                aria-live="polite"
                            >
                                {matches.length}{" "}
                                {matches.length === 1 ? "article" : "articles"}
                                {category !== ALL && ` in ${category}`}
                                {trimmed !== "" && ` matching “${query.trim()}”`}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
