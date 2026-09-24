/**
 * lib/blog.ts
 * ---------------------------------------------------------------------------
 * Derived values for blog posts: reading time, dates, table of contents and
 * the plain-text version used by the Article JSON-LD.
 *
 * Everything here is a pure function of a BlogPost, so a post file stays the
 * only thing anyone edits. Nothing is stored twice.
 *
 * Token resolution ({{brand}}, {{email}}, ...) reuses lib/legal.ts rather than
 * defining a second token table — one table, one place to add a token.
 */

import { resolveTokens } from "@/lib/legal";
import type { BlogBlock, BlogPost } from "@/data/blog/types";

export { resolveTokens };

/** Words per minute. Deliberately conservative for technical copy. */
const WORDS_PER_MINUTE = 220;

/** Flattens one block to the text a reader would actually read. */
function blockText(block: BlogBlock): string {
    switch (block.type) {
        case "heading":
        case "subheading":
            return block.text;
        case "paragraph":
            return block.text;
        case "list":
            return block.items.join(" ");
        case "steps":
            return block.items
                .map((item) => `${item.title} ${item.body}`)
                .join(" ");
        case "quote":
            return `${block.text} ${block.attribution ?? ""}`;
        case "callout":
            return `${block.title ?? ""} ${block.text}`;
        case "table":
            return [...block.head, ...block.rows.flat()].join(" ");
        case "image":
            return block.caption ?? "";
        case "stats":
            return block.items
                .map((item) => `${item.value} ${item.label}`)
                .join(" ");
        case "divider":
            return "";
    }
}

/** The whole post as one string. Used for reading time and for JSON-LD. */
export function postPlainText(post: BlogPost): string {
    return [
        post.title,
        post.excerpt,
        ...post.keyTakeaways,
        ...post.body.map(blockText),
        ...(post.faqs?.flatMap((faq) => [faq.q, faq.a]) ?? []),
    ]
        .map(resolveTokens)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
}

/** Minutes to read. Uses the post's own value when it sets one. */
export function readingTime(post: BlogPost): number {
    if (post.readingTime && post.readingTime > 0) return post.readingTime;

    const words = postPlainText(post).split(" ").filter(Boolean).length;
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Rough word count, shown alongside reading time on the article header. */
export function wordCount(post: BlogPost): number {
    return postPlainText(post).split(" ").filter(Boolean).length;
}

/**
 * Stable date formatting. Fixed locale and UTC so the server and the client
 * render the identical string — a locale-dependent date is a classic
 * hydration mismatch.
 */
export function formatPostDate(isoDate: string): string {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** Short form for cards, where the full date is too much furniture. */
export function formatPostDateShort(isoDate: string): string {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${isoDate}T00:00:00Z`));
}

export interface TocItem {
    id: string;
    title: string;
}

/**
 * The table of contents is derived from the body rather than authored
 * separately, which is the only way to guarantee it cannot fall out of sync
 * with the headings it links to.
 */
export function postToc(post: BlogPost): TocItem[] {
    return post.body
        .filter((block): block is Extract<BlogBlock, { type: "heading" }> =>
            Boolean(block.type === "heading"),
        )
        .map((block) => ({ id: block.id, title: resolveTokens(block.text) }));
}

/** Initials for the byline when an author has no photo, or it fails to load. */
export function authorInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}
