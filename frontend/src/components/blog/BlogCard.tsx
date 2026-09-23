/**
 * components/blog/BlogCard.tsx
 * ---------------------------------------------------------------------------
 * One post, in a grid. Two variants share the component so the featured slot
 * can never drift away from the cards beneath it:
 *
 *   "grid"     — the default 3-up card
 *   "featured" — the wide hero card at the top of /blog
 *
 * The whole card is one <Link>. A card with several links inside it means a
 * keyboard user tabs through three targets to reach one article, and it makes
 * the hit area on mobile ambiguous — so the category and meta are plain text.
 */

import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

import PostCover from "@/components/blog/PostCover";
import { blogHref, getAccent } from "@/data/blog";
import type { BlogPost } from "@/data/blog/types";
import { formatPostDateShort, readingTime, resolveTokens } from "@/lib/blog";
import { cn } from "@/lib/utils";

interface BlogCardProps {
    post: BlogPost;
    variant?: "grid" | "featured";
}

export default function BlogCard({ post, variant = "grid" }: BlogCardProps) {
    const accent = getAccent(post.accent);
    const minutes = readingTime(post);
    const isFeatured = variant === "featured";

    return (
        <article className={cn(isFeatured && "col-span-full")}>
            <Link
                href={blogHref(post.slug)}
                className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-3xl border border-border-color bg-card-bg shadow-sm transition-all",
                    "hover:shadow-xl dark:border-dark-border-color dark:bg-dark-card-bg",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#070B14]",
                    accent.hoverBorder,
                    isFeatured && "lg:flex-row",
                )}
            >
                <PostCover
                    post={post}
                    priority={isFeatured}
                    size={isFeatured ? "feature" : "card"}
                    className={cn(
                        "shrink-0",
                        isFeatured
                            ? "h-56 sm:h-72 lg:h-auto lg:w-[46%]"
                            : "h-44 sm:h-48",
                    )}
                />

                <div
                    className={cn(
                        "flex flex-1 flex-col p-6",
                        isFeatured && "sm:p-8 lg:p-10 lg:justify-center",
                    )}
                >
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span
                            className={cn(
                                "rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest",
                                accent.pillBg,
                                accent.pillText,
                            )}
                        >
                            {post.category}
                        </span>

                        {isFeatured && (
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary dark:text-dark-primary">
                                Latest
                            </span>
                        )}
                    </div>

                    <h3
                        className={cn(
                            "font-black leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-primary dark:text-white dark:group-hover:text-dark-primary",
                            isFeatured
                                ? "text-2xl sm:text-3xl lg:text-4xl lg:leading-[1.15]"
                                : "text-lg",
                        )}
                    >
                        {resolveTokens(post.title)}
                    </h3>

                    <p
                        className={cn(
                            "mt-3 leading-relaxed text-slate-600 dark:text-slate-400",
                            isFeatured
                                ? "text-sm sm:text-base"
                                : "text-sm line-clamp-3",
                        )}
                    >
                        {resolveTokens(post.excerpt)}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {post.author.name}
                        </span>
                        <span
                            className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"
                            aria-hidden="true"
                        />
                        <time dateTime={post.publishedAt}>
                            {formatPostDateShort(post.publishedAt)}
                        </time>
                        <span
                            className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"
                            aria-hidden="true"
                        />
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            {minutes} min read
                        </span>
                    </div>

                    <span
                        className={cn(
                            "mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary dark:text-dark-primary",
                            !isFeatured && "mt-auto pt-5",
                        )}
                    >
                        Read the article
                        <ArrowUpRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            aria-hidden="true"
                        />
                    </span>
                </div>
            </Link>
        </article>
    );
}
