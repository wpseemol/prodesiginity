/**
 * Blog data — what the dashboard's Blog page manages, merged with the
 * hand-written posts in data/blog/posts/*.json.
 *
 * Reads `GET /api/blog` and maps it onto the same `BlogPost` shape the static
 * posts use, so every component renders both without knowing the difference.
 * A dashboard post with the same slug as a static one replaces it. When the
 * API is unreachable (offline build, outage) the static posts are used alone.
 *
 * Safe to import from server and client components.
 */

import { apiBaseUrl } from "@/config/api";
import { BLOG_ACCENTS, POSTS as STATIC_POSTS } from "@/data/blog";
import type { BlogAccentName, BlogBlock, BlogPost } from "@/data/blog/types";
import type { ServiceIconName } from "@/data/servicesData";

export interface BlogCategoryInfo {
    name: string;
    slug: string;
    icon?: string;
    image?: string;
}

export interface BlogData {
    posts: BlogPost[];
    categories: BlogCategoryInfo[];
}

type Json = Record<string, unknown>;

const str = (value: unknown): string => (typeof value === "string" ? value : "");
const optStr = (value: unknown): string | undefined => str(value) || undefined;
const strList = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.length > 0) : [];
const obj = (value: unknown): Json => (value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : {});
const objList = (value: unknown): Json[] =>
    Array.isArray(value) ? value.filter((v): v is Json => !!v && typeof v === "object") : [];

/** `2026-10-04T08:00:00.000Z` → `2026-10-04` (what formatPostDate expects). */
const isoDay = (value: unknown): string => {
    const s = str(value);
    return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : "";
};

/** Only block shapes the renderer knows are kept; anything else is dropped. */
function toBlock(raw: Json): BlogBlock | null {
    switch (raw.type) {
        case "heading":
            return str(raw.text) ? { type: "heading", id: str(raw.id) || "section", text: str(raw.text) } : null;
        case "subheading":
        case "paragraph":
            return str(raw.text) ? { type: raw.type, text: str(raw.text) } : null;
        case "list": {
            const items = strList(raw.items);
            return items.length ? { type: "list", items, ordered: raw.ordered === true } : null;
        }
        case "steps": {
            const items = objList(raw.items).map((i) => ({ title: str(i.title), body: str(i.body) }));
            return items.length ? { type: "steps", items } : null;
        }
        case "quote":
            return str(raw.text) ? { type: "quote", text: str(raw.text), attribution: optStr(raw.attribution) } : null;
        case "callout": {
            const tone = raw.tone === "warning" || raw.tone === "success" ? raw.tone : "info";
            return str(raw.text) ? { type: "callout", tone, title: optStr(raw.title), text: str(raw.text) } : null;
        }
        case "table": {
            const head = strList(raw.head);
            const rows = Array.isArray(raw.rows) ? raw.rows.map((r) => (Array.isArray(r) ? r.map(str) : [])) : [];
            return head.length ? { type: "table", caption: optStr(raw.caption), head, rows } : null;
        }
        case "image":
            return str(raw.src)
                ? { type: "image", src: str(raw.src), alt: str(raw.alt), caption: optStr(raw.caption) }
                : null;
        case "video":
            return str(raw.src)
                ? { type: "video", src: str(raw.src), title: optStr(raw.title), caption: optStr(raw.caption) }
                : null;
        case "stats": {
            const items = objList(raw.items).map((i) => ({ value: str(i.value), label: str(i.label) }));
            return items.length ? { type: "stats", items } : null;
        }
        case "divider":
            return { type: "divider" };
        default:
            return null;
    }
}

function toPost(raw: Json): BlogPost | null {
    const slug = str(raw.slug);
    const title = str(raw.title);
    const publishedAt = isoDay(raw.publishedAt);
    if (!slug || !title || !publishedAt) return null;

    const category = obj(raw.category);
    const author = obj(raw.author);
    const seo = obj(raw.seo);
    const tags = strList(raw.tags);
    const excerpt = str(raw.excerpt);
    const accent = (BLOG_ACCENTS as Record<string, unknown>)[str(raw.accent)]
        ? (str(raw.accent) as BlogAccentName)
        : "indigo";
    const keywords = strList(seo.keywords);
    const body = objList(raw.body)
        .map(toBlock)
        .filter((b): b is BlogBlock => b !== null);

    return {
        slug,
        title,
        excerpt,
        category: str(category.name) || "Articles",
        categorySlug: optStr(category.slug),
        categoryIcon: optStr(category.icon),
        accent,
        icon: (str(raw.icon) || str(category.icon) || "FileText") as ServiceIconName,
        cover: optStr(raw.coverImage) ?? optStr(category.imageUrl),
        coverAlt: optStr(raw.coverAlt) ?? title,
        video: optStr(raw.videoUrl),
        publishedAt,
        updatedAt: isoDay(raw.updatedAt) || undefined,
        featured: raw.featured === true,
        author: {
            name: str(author.name) || "ProDesignity Team",
            role: str(author.role) || "Editorial",
            photo: optStr(author.photo),
        },
        tags,
        keyTakeaways: strList(raw.keyTakeaways),
        body: body.length > 0 ? body : [{ type: "paragraph", text: excerpt }],
        faqs: objList(raw.faqs)
            .map((f) => ({ q: str(f.q), a: str(f.a) }))
            .filter((f) => f.q && f.a),
        relatedServices: strList(raw.relatedServices),
        seo: {
            title: str(seo.title) || title,
            description: str(seo.description) || excerpt,
            keywords: keywords.length > 0 ? keywords : tags,
        },
    };
}

function toCategory(raw: Json): BlogCategoryInfo | null {
    const name = str(raw.name);
    const slug = str(raw.slug);
    if (!name || !slug) return null;
    return { name, slug, icon: optStr(raw.icon), image: optStr(raw.imageUrl) };
}

/* ------------------------------------------------------------------ Fetch */

/** `null` when the API is unreachable or returns something unusable. */
export async function fetchBlogFromApi(init?: RequestInit): Promise<BlogData | null> {
    try {
        const res = await fetch(`${apiBaseUrl}/blog`, {
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
            ...init,
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { posts?: unknown; categories?: unknown };
        return {
            posts: objList(data.posts)
                .map(toPost)
                .filter((p): p is BlogPost => p !== null),
            categories: objList(data.categories)
                .map(toCategory)
                .filter((c): c is BlogCategoryInfo => c !== null),
        };
    } catch {
        return null;
    }
}

/** One published post, straight from the API (used by the client 404 fallback). */
export async function fetchLivePost(slug: string): Promise<BlogPost | null> {
    try {
        const res = await fetch(`${apiBaseUrl}/blog/${encodeURIComponent(slug)}`, {
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { post?: unknown };
        return toPost(obj(data.post));
    } catch {
        return null;
    }
}

/** Dashboard posts first, then static posts whose slug is not taken. */
export function mergeBlogData(api: BlogData | null): BlogData {
    const apiPosts = api?.posts ?? [];
    const taken = new Set(apiPosts.map((p) => p.slug));
    // A post featured in the dashboard takes the slot over a static one.
    const apiFeatured = apiPosts.some((p) => p.featured);
    const staticPosts = STATIC_POSTS.filter((p) => !taken.has(p.slug)).map((p) =>
        apiFeatured && p.featured ? { ...p, featured: false } : p,
    );
    const posts = [...apiPosts, ...staticPosts].sort((a, b) =>
        b.publishedAt.localeCompare(a.publishedAt),
    );

    const categories: BlogCategoryInfo[] = [...(api?.categories ?? [])];
    const known = new Set(categories.map((c) => c.name));
    for (const post of posts) {
        if (known.has(post.category)) continue;
        known.add(post.category);
        categories.push({ name: post.category, slug: post.categorySlug ?? post.category, icon: post.categoryIcon });
    }

    return {
        posts,
        categories: categories.filter((c) => posts.some((p) => p.category === c.name)),
    };
}

let buildCache: { at: number; promise: Promise<BlogData> } | null = null;

/**
 * Build-time / server loader. Never throws. The result is shared for a few
 * seconds so a static build makes one API call instead of one per page.
 */
export function getBlogData(): Promise<BlogData> {
    if (typeof window === "undefined" && buildCache && Date.now() - buildCache.at < 30_000) {
        return buildCache.promise;
    }
    const promise = fetchBlogFromApi().then(mergeBlogData);
    if (typeof window === "undefined") buildCache = { at: Date.now(), promise };
    return promise;
}

/* ---------------------------------------------------------------- Helpers */

export function findPost(posts: BlogPost[], slug: string): BlogPost | undefined {
    return posts.find((post) => post.slug === slug);
}

/** Same category first, then the newest of anything else. */
export function relatedPostsFor(posts: BlogPost[], post: BlogPost, limit = 3): BlogPost[] {
    const others = posts.filter((p) => p.slug !== post.slug);
    return [
        ...others.filter((p) => p.category === post.category),
        ...others.filter((p) => p.category !== post.category),
    ].slice(0, limit);
}

/** The post given the wide slot on /blog; falls back to the newest. */
export function featuredPostOf(posts: BlogPost[]): BlogPost | undefined {
    return posts.find((post) => post.featured) ?? posts[0];
}
