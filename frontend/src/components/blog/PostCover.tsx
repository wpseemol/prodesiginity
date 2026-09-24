/**
 * components/blog/PostCover.tsx
 * ---------------------------------------------------------------------------
 * The visual at the top of a card and at the top of an article.
 *
 * A post's `cover` is optional, and that is deliberate. Waiting on artwork is
 * the usual reason a written article sits unpublished for a fortnight, so a
 * post without one draws generated cover art instead: the accent gradient, the
 * studio grid motif and the post's service icon. It reads as a designed state
 * rather than a missing asset, and dropping a real file into the JSON later
 * upgrades it with no code change.
 *
 * When a cover IS supplied it goes through SmartImage, so a wrong path shows a
 * labelled placeholder instead of a silent blank box (see GEMINI.md).
 */

import ServiceIcon from "@/components/ServiceIcon";
import SmartImage from "@/components/home/portfolio/SmartImage";
import { getAccent } from "@/data/blog";
import type { BlogPost } from "@/data/blog/types";
import { cn } from "@/lib/utils";

interface PostCoverProps {
    post: BlogPost;
    /** `priority` on the article hero and the featured card only. */
    priority?: boolean;
    /** Icon size scales with the slot the cover sits in. */
    size?: "card" | "feature" | "hero";
    className?: string;
}

const ICON_SIZE: Record<NonNullable<PostCoverProps["size"]>, string> = {
    card: "w-10 h-10",
    feature: "w-14 h-14",
    hero: "w-16 h-16",
};

export default function PostCover({
    post,
    priority = false,
    size = "card",
    className,
}: PostCoverProps) {
    const accent = getAccent(post.accent);

    if (post.cover) {
        return (
            <div className={cn("relative overflow-hidden", className)}>
                <SmartImage
                    src={post.cover}
                    alt={post.coverAlt ?? post.title}
                    fallbackLabel={post.category}
                    fill
                    priority={priority}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                    className="object-cover"
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "relative overflow-hidden bg-slate-50 dark:bg-[#0A0F1C]",
                className,
            )}
            aria-hidden="true"
        >
            {/* Accent wash */}
            <div
                className={cn(
                    "absolute inset-0 bg-linear-to-br",
                    accent.poster,
                )}
            />

            {/* The same 36px grid used across the site, so generated covers
                sit in the same visual family as the portfolio sections. */}
            <div
                className="absolute inset-0 opacity-[0.45] dark:opacity-[0.18]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(99, 102, 241, 0.24) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(99, 102, 241, 0.24) 1px, transparent 1px)
                    `,
                    backgroundSize: "36px 36px",
                    maskImage:
                        "radial-gradient(ellipse 80% 80% at 50% 50%, #000 55%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 80% 80% at 50% 50%, #000 55%, transparent 100%)",
                }}
            />

            {/* Soft core glow behind the glyph */}
            <div className="absolute left-1/2 top-1/2 h-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl dark:bg-white/5" />

            <div className="relative flex h-full items-center justify-center">
                <span
                    className={cn(
                        "flex items-center justify-center rounded-2xl border border-white/50 bg-white/70 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/5",
                        size === "card"
                            ? "h-20 w-20"
                            : size === "feature"
                              ? "h-24 w-24"
                              : "h-28 w-28",
                    )}
                >
                    <ServiceIcon
                        name={post.icon}
                        className={cn(ICON_SIZE[size], accent.iconColor)}
                    />
                </span>
            </div>

            {/* Blend into the surface below, matching PortfolioBackground */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-white/70 to-transparent dark:from-[#070B14]/70" />
        </div>
    );
}
