/**
 * data/blog/index.ts
 * ---------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH FOR THE BLOG.
 *
 * Read by:
 *   - /blog                  (listing, filters, featured slot)
 *   - /blog/[slug]           (one static page per post)
 *   - sitemap.ts             (route list)
 *   - lib/seo.ts             (Article + Blog JSON-LD)
 *
 * ---------------------------------------------------------------------------
 * ADDING A POST — the whole procedure
 * ---------------------------------------------------------------------------
 *   1. Create `posts/<slug>.json` (copy the closest existing one).
 *   2. Import it below and add it to RAW_POSTS.
 * That is it. The listing page, the filter chips, the related rail, the
 * sitemap and the structured data all pick it up with no further edits.
 *
 * The import list is written by hand on purpose. `output: "export"` builds a
 * static site, so there is no filesystem at request time, and a bundler cannot
 * glob a directory into a module without extra tooling. Two lines per post is
 * a cheaper price than that tooling.
 *
 * ---------------------------------------------------------------------------
 * WHY THE `as unknown as BlogPost` CAST
 * ---------------------------------------------------------------------------
 * TypeScript widens every string in an imported JSON file to `string`, so a
 * block written as `{ "type": "heading" }` infers as `{ type: string }` and
 * will not narrow to the BlogBlock union. The cast is the standard escape
 * hatch. It means a malformed post is not caught by the compiler — which is
 * why `assertPost()` below checks the parts that actually break a render, and
 * throws at BUILD time rather than shipping a broken page.
 */

import type { BlogAccent, BlogAccentName, BlogPost } from "./types";

import post3dRenderingVsPhotography from "./posts/3d-product-rendering-vs-product-photography.json";
import postShopifyProductPage from "./posts/shopify-product-page-conversion-checklist.json";
import postAmazonListingImages from "./posts/amazon-listing-images-that-convert.json";
import postPackagingDigitalShelf from "./posts/packaging-design-that-sells-on-a-digital-shelf.json";
import postAnimationBrief from "./posts/product-animation-brief-that-works.json";

export type { BlogAccent, BlogAccentName, BlogBlock, BlogPost } from "./types";

/* -------------------------------------------------------------------------
   Accent presets

   These live here rather than in the JSON because Tailwind v4 scans SOURCE
   files for class names and does not reliably scan `.json`. A class string
   written in a post file would be dropped from the compiled stylesheet and
   the colour would silently vanish in production. A post stores a KEY; the
   classes stay in TypeScript. Same reasoning as ACCENTS in servicesData.ts.
   ------------------------------------------------------------------------- */

export const BLOG_ACCENTS: Record<BlogAccentName, BlogAccent> = {
    violet: {
        iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
        iconColor: "text-brand-violet dark:text-dark-brand-violet",
        hoverBorder:
            "hover:border-brand-violet/40 dark:hover:border-dark-brand-violet/40",
        wash: "from-brand-violet/18 via-primary/12 to-brand-blue/15",
        poster: "from-brand-violet/25 via-primary/15 to-brand-blue/20 dark:from-dark-brand-violet/30 dark:via-primary/20 dark:to-dark-brand-blue/25",
        pillText: "text-brand-violet dark:text-dark-brand-violet",
        pillBg: "bg-brand-violet/10 border-brand-violet/25",
    },
    blue: {
        iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
        iconColor: "text-brand-blue dark:text-dark-brand-blue",
        hoverBorder:
            "hover:border-brand-blue/40 dark:hover:border-dark-brand-blue/40",
        wash: "from-brand-blue/18 via-primary/12 to-cyan-400/15",
        poster: "from-brand-blue/25 via-primary/15 to-cyan-400/20 dark:from-dark-brand-blue/30 dark:via-primary/20 dark:to-cyan-400/25",
        pillText: "text-brand-blue dark:text-dark-brand-blue",
        pillBg: "bg-brand-blue/10 border-brand-blue/25",
    },
    indigo: {
        iconBg: "bg-primary/10 dark:bg-dark-primary/15",
        iconColor: "text-primary dark:text-dark-primary",
        hoverBorder: "hover:border-primary/40 dark:hover:border-dark-primary/40",
        wash: "from-primary/18 via-brand-violet/12 to-brand-blue/15",
        poster: "from-primary/25 via-brand-violet/15 to-brand-blue/20 dark:from-dark-primary/30 dark:via-dark-brand-violet/20 dark:to-dark-brand-blue/25",
        pillText: "text-primary dark:text-dark-primary",
        pillBg: "bg-primary/10 border-primary/25",
    },
    emerald: {
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        hoverBorder: "hover:border-emerald-500/40",
        wash: "from-emerald-500/18 via-primary/10 to-brand-blue/15",
        poster: "from-emerald-500/25 via-primary/12 to-brand-blue/20 dark:from-emerald-500/30 dark:via-primary/18 dark:to-dark-brand-blue/25",
        pillText: "text-emerald-600 dark:text-emerald-400",
        pillBg: "bg-emerald-500/10 border-emerald-500/25",
    },
    orange: {
        iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
        iconColor: "text-brand-orange dark:text-dark-brand-orange",
        hoverBorder:
            "hover:border-brand-orange/40 dark:hover:border-dark-brand-orange/40",
        wash: "from-brand-orange/18 via-primary/10 to-brand-violet/15",
        poster: "from-brand-orange/25 via-primary/12 to-brand-violet/20 dark:from-dark-brand-orange/30 dark:via-primary/18 dark:to-dark-brand-violet/25",
        pillText: "text-brand-orange dark:text-dark-brand-orange",
        pillBg: "bg-brand-orange/10 border-brand-orange/25",
    },
};

export function getAccent(name: BlogAccentName): BlogAccent {
    return BLOG_ACCENTS[name] ?? BLOG_ACCENTS.indigo;
}

/* -------------------------------------------------------------------------
   Build-time validation

   Cheap checks for the mistakes that actually break a page: a duplicate slug
   (two posts fighting over one route), an accent key with no preset, and a
   heading with no id (which would produce a table-of-contents entry linking
   to nothing). Throwing here fails `pnpm run build` with a readable message,
   which is a much better place to find out than production.
   ------------------------------------------------------------------------- */

function assertPost(post: BlogPost): BlogPost {
    const where = `data/blog/posts/${post.slug}.json`;

    if (!post.slug) {
        throw new Error(`[blog] A post is missing "slug" (${where})`);
    }
    if (!(post.accent in BLOG_ACCENTS)) {
        throw new Error(
            `[blog] "${post.slug}" uses accent "${post.accent}", which is not in BLOG_ACCENTS. ` +
                `Valid keys: ${Object.keys(BLOG_ACCENTS).join(", ")}`,
        );
    }
    if (!Array.isArray(post.body) || post.body.length === 0) {
        throw new Error(`[blog] "${post.slug}" has an empty body`);
    }

    const seen = new Set<string>();
    for (const block of post.body) {
        if (block.type !== "heading") continue;
        if (!block.id) {
            throw new Error(
                `[blog] "${post.slug}" has a heading with no "id": "${block.text}". ` +
                    `Ids become URL anchors, so every heading needs a stable one.`,
            );
        }
        if (seen.has(block.id)) {
            throw new Error(
                `[blog] "${post.slug}" reuses the heading id "${block.id}".`,
            );
        }
        seen.add(block.id);
    }

    return post;
}

/* -------------------------------------------------------------------------
   The posts
   ------------------------------------------------------------------------- */

const RAW_POSTS = [
    post3dRenderingVsPhotography,
    postShopifyProductPage,
    postAmazonListingImages,
    postPackagingDigitalShelf,
    postAnimationBrief,
] as unknown as BlogPost[];

const slugs = new Set<string>();
for (const post of RAW_POSTS) {
    if (slugs.has(post.slug)) {
        throw new Error(`[blog] Duplicate slug "${post.slug}".`);
    }
    slugs.add(post.slug);
}

/** Every post, newest first. This is the order the listing page renders in. */
export const POSTS: BlogPost[] = RAW_POSTS.map(assertPost).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
);

export const BLOG_BASE_PATH = "/blog";

export const POST_SLUGS: string[] = POSTS.map((post) => post.slug);

/** Filter chips on /blog, in the order the categories first appear. */
export const BLOG_CATEGORIES: string[] = Array.from(
    new Set(POSTS.map((post) => post.category)),
);

export function blogHref(slug: string): string {
    return `${BLOG_BASE_PATH}/${slug}`;
}

export function getPost(slug: string): BlogPost | undefined {
    return POSTS.find((post) => post.slug === slug);
}

/**
 * The post given the wide hero slot. Falls back to the newest post so the
 * layout never collapses just because nobody set `featured`.
 */
export const FEATURED_POST: BlogPost =
    POSTS.find((post) => post.featured) ?? POSTS[0];

/**
 * Posts shown at the foot of an article. Same category first, because that is
 * the most useful next read, then topped up with the newest of anything else
 * so the rail is never half empty on a thin category.
 */
export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
    const current = getPost(slug);
    if (!current) return POSTS.slice(0, limit);

    const others = POSTS.filter((post) => post.slug !== slug);
    const sameCategory = others.filter(
        (post) => post.category === current.category,
    );
    const rest = others.filter((post) => post.category !== current.category);

    return [...sameCategory, ...rest].slice(0, limit);
}
