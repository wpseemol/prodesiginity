/**
 * /blog/[slug]
 * ---------------------------------------------------------------------------
 * One page per article: dashboard posts (GET /api/blog) merged with the
 * hand-written posts in data/blog/posts/*.json — see lib/blog-api.ts.
 *
 * `generateStaticParams` emits every slug at build time, which is what makes
 * these routes work under `output: "export"`. Posts published after the last
 * build are rendered client-side by LiveBlogFallback (from the 404 page) until
 * the next build makes them static and fully indexable.
 *
 * SEO: canonical URL, per-article title/description, og:type=article with
 * author / section / tags / dates, Twitter large card, and BlogPosting +
 * VideoObject + BreadcrumbList + FAQPage JSON-LD (in BlogPostView).
 */

import { notFound } from "next/navigation";

import BlogPostView from "@/components/blog/BlogPostView";
import { siteConfig } from "@/config/site";
import { blogCanonicalPath } from "@/data/blog";
import { resolveTokens } from "@/lib/blog";
import { findPost, getBlogData, relatedPostsFor } from "@/lib/blog-api";
import { buildMetadata } from "@/lib/seo";
import { findService, getServicesCatalog } from "@/lib/services-catalog";

import type { Metadata } from "next";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
    const { posts } = await getBlogData();
    return posts.map((post) => ({ slug: post.slug }));
}

/** A slug outside the list is a 404 (then LiveBlogFallback checks the API). */
export const dynamicParams = false;

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { slug } = await params;
    const { posts } = await getBlogData();
    const post = findPost(posts, slug);

    if (!post) {
        return { title: "Article not found", robots: { index: false, follow: true } };
    }

    const title = resolveTokens(post.seo.title);
    const description = resolveTokens(post.seo.description);

    return {
        ...buildMetadata({
            title,
            description,
            path: blogCanonicalPath(post.slug),
            image: post.cover ?? siteConfig.ogImage,
            imageAlt: post.coverAlt ?? title,
            type: "article",
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt ?? post.publishedAt,
            authors: [post.author.name],
            section: post.category,
            tags: post.tags,
        }),
        keywords: post.seo.keywords,
        authors: [{ name: post.author.name }],
        category: post.category,
    };
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { slug } = await params;
    const [{ posts }, catalog] = await Promise.all([getBlogData(), getServicesCatalog()]);
    const post = findPost(posts, slug);

    if (!post) notFound();

    // Unknown service slugs are dropped rather than rendered as dead links.
    const services = (post.relatedServices ?? [])
        .map((serviceSlug) => findService(catalog, serviceSlug))
        .filter((service) => service !== undefined);

    return (
        <BlogPostView
            post={post}
            related={relatedPostsFor(posts, post)}
            services={services}
        />
    );
}
