/**
 * /blog/[slug]
 * ---------------------------------------------------------------------------
 * One page per article: dashboard posts (GET /api/blog) merged with the
 * hand-written posts in data/blog/posts/*.json — see lib/blog-api.ts.
 *
 * `generateStaticParams` emits every slug at build time, which is what makes
 * these routes work under `output: "export"`. Posts published after the last
 * build are rendered client-side by LiveBlogFallback (from the 404 page) until
 * the next build makes them static and fully indexable. Built articles re-read
 * the API on load (LiveBlogPost), so dashboard edits show without a rebuild.
 *
 * SEO: canonical URL, per-article title/description, og:type=article with
 * author / section / tags / dates, Twitter large card, and BlogPosting +
 * VideoObject + BreadcrumbList + FAQPage JSON-LD (in BlogPostView).
 */

import { notFound } from "next/navigation";

import LiveBlogPost from "@/components/blog/LiveBlogPost";
import { siteConfig } from "@/config/site";
import { blogCanonicalPath } from "@/data/blog";
import { resolveTokens } from "@/lib/blog";
import { findPost, getBlogData, relatedPostsFor } from "@/lib/blog-api";
import { buildMetadata } from "@/lib/seo";
import { getServicesCatalog } from "@/lib/services-catalog";
import { findStaffByName, getTeamData, staffSlug } from "@/lib/team-api";

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
    const [{ posts }, catalog, team] = await Promise.all([
        getBlogData(),
        getServicesCatalog(),
        getTeamData(),
    ]);
    const found = findPost(posts, slug);

    if (!found) notFound();

    // Hand-written posts only carry a name; match it to a profile for the byline link.
    const authorMember = found.author.slug ? undefined : findStaffByName(team, found.author.name);
    const post = authorMember
        ? { ...found, author: { ...found.author, slug: staffSlug(authorMember) } }
        : found;

    return (
        <LiveBlogPost
            initialPost={post}
            initialRelated={relatedPostsFor(posts, post)}
            initialCatalog={catalog}
        />
    );
}
