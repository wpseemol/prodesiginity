/**
 * data/blog/types.ts
 * ---------------------------------------------------------------------------
 * THE CONTENT MODEL FOR EVERY BLOG POST.
 *
 * Each post lives in its own JSON file under `data/blog/posts/`. One post =
 * one file, so two people can write two articles without ever touching the
 * same file, and adding an article is a pull request that contains no code.
 *
 * Why JSON and not MDX:
 *  - A writer never has to think about JSX, imports or build errors.
 *  - The same structured body feeds the page, the reading time, the table of
 *    contents AND the Article/FAQPage JSON-LD, so the machine-readable copy
 *    can never drift from what a human sees.
 *  - `resolveJsonModule` means the files are imported at build time, which is
 *    required here: the site ships with `output: "export"`, so there is no
 *    server to read a file at request time.
 *
 * IMPORTANT — no Tailwind classes in JSON.
 * Tailwind v4 scans source files for class names; it does not reliably scan
 * `.json`. So a post stores an accent KEY ("violet", "blue", ...) and the
 * actual class strings live in `data/blog/index.ts`, exactly like the ACCENTS
 * preset in `data/servicesData.ts`. Put a class name in a JSON file and it
 * will be silently dropped from the stylesheet in production.
 *
 * Any string field supports {{tokens}} from config/site.ts — e.g. "{{brand}}"
 * or "Email {{email}}" — resolved by lib/legal.ts:resolveTokens().
 */

import type { ServiceIconName } from "@/data/servicesData";

/** Keys into BLOG_ACCENTS in data/blog/index.ts. */
export type BlogAccentName =
    | "violet"
    | "blue"
    | "indigo"
    | "emerald"
    | "orange";

export interface BlogAccent {
    /** Icon tile background. */
    iconBg: string;
    /** Icon glyph colour. */
    iconColor: string;
    /** Border colour applied on card hover. */
    hoverBorder: string;
    /** Gradient wash behind the article hero. */
    wash: string;
    /** Gradient used for the generated cover art when `cover` is empty. */
    poster: string;
    /** Text colour for the category pill. */
    pillText: string;
    /** Background + border for the category pill. */
    pillBg: string;
}

/* -------------------------------------------------------------------------
   Body blocks
   ------------------------------------------------------------------------- */

/**
 * A post body is a flat array of blocks. Flat — not nested sections — because
 * the table of contents is built by filtering for `heading` blocks, and a flat
 * list keeps a writer from having to reason about nesting depth.
 *
 * Every `heading` needs a stable `id`: it becomes the URL anchor, so changing
 * one breaks any link somebody has already shared.
 */
export type BlogBlock =
    /** Renders an <h2> and becomes one entry in the table of contents. */
    | { type: "heading"; id: string; text: string }
    /** Renders an <h3>. Does not appear in the table of contents. */
    | { type: "subheading"; text: string }
    | { type: "paragraph"; text: string }
    | { type: "list"; items: string[]; ordered?: boolean }
    /** Numbered cards — use for a process, not for a plain list. */
    | { type: "steps"; items: { title: string; body: string }[] }
    | { type: "quote"; text: string; attribution?: string }
    | {
          type: "callout";
          tone?: "info" | "warning" | "success";
          title?: string;
          text: string;
      }
    | { type: "table"; caption?: string; head: string[]; rows: string[][] }
    /**
     * `src` is a path under /public. A missing file renders a labelled
     * placeholder rather than a blank gap — see SmartImage.
     */
    | { type: "image"; src: string; alt: string; caption?: string }
    | { type: "stats"; items: { value: string; label: string }[] }
    | { type: "divider" };

/* -------------------------------------------------------------------------
   Post
   ------------------------------------------------------------------------- */

export interface BlogAuthor {
    name: string;
    /** Job title, shown under the name in the byline. */
    role: string;
    /** Path under /public. Falls back to initials when missing or broken. */
    photo?: string;
}

export interface BlogFaq {
    q: string;
    a: string;
}

export interface BlogPost {
    /** URL segment → /blog/<slug>. Changing one is a redirect-worthy event. */
    slug: string;
    /** Nav label, card title AND the single <h1> on the article page. */
    title: string;
    /** Card copy and the lede under the H1. Aim for 25–40 words. */
    excerpt: string;
    /** Free text. The filter chips on /blog are derived from these. */
    category: string;
    accent: BlogAccentName;
    icon: ServiceIconName;
    /**
     * Path under /public, e.g. "/assets/images/blog/my-post.jpg" (1200x630).
     * Leave it out and the card draws branded gradient cover art instead —
     * that is a supported state, not a broken one.
     */
    cover?: string;
    coverAlt?: string;
    /** ISO date (YYYY-MM-DD). Drives sort order and datePublished. */
    publishedAt: string;
    /** ISO date. Drives "Updated" and dateModified. */
    updatedAt?: string;
    /** At most one post should carry this — it gets the wide hero slot. */
    featured?: boolean;
    author: BlogAuthor;
    tags: string[];
    /** Minutes. Omit and it is estimated from the body at 220 wpm. */
    readingTime?: number;
    /** The 3–5 sentences an AI assistant is most likely to quote. */
    keyTakeaways: string[];
    body: BlogBlock[];
    /** Rendered as an accordion and emitted as FAQPage JSON-LD. */
    faqs?: BlogFaq[];
    /** Slugs from data/servicesData.ts — rendered as "related services". */
    relatedServices?: string[];
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
}
