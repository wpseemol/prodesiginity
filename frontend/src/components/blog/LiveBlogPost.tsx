"use client";

import { useEffect, useState } from "react";

import BlogPostView from "@/components/blog/BlogPostView";
import NotFoundView from "@/components/ui/NotFoundView";
import { BLOG_BASE_PATH } from "@/data/blog";
import type { BlogPost } from "@/data/blog/types";
import { resolveTokens } from "@/lib/blog";
import {
    fetchBlogFromApi,
    findPost,
    mergeBlogData,
    relatedPostsFor,
    type BlogData,
} from "@/lib/blog-api";
import { findService, type ServicesCatalog } from "@/lib/services-catalog";
import { useServicesCatalog } from "@/lib/useServicesCatalog";

/**
 * Renders the article baked into the static export, then swaps in the live
 * API version so dashboard edits (and unpublishing) show up without a rebuild.
 */
export default function LiveBlogPost({
    initialPost,
    initialRelated,
    initialCatalog,
}: {
    initialPost: BlogPost;
    initialRelated: BlogPost[];
    initialCatalog: ServicesCatalog;
}) {
    const slug = initialPost.slug;
    const catalog = useServicesCatalog(initialCatalog);
    const [live, setLive] = useState<BlogData | null>(null);

    useEffect(() => {
        let active = true;
        void fetchBlogFromApi().then((data) => {
            if (active && data) setLive(mergeBlogData(data));
        });
        return () => {
            active = false;
        };
    }, []);

    const livePost = live ? findPost(live.posts, slug) : undefined;

    useEffect(() => {
        if (!livePost) return;
        document.title = resolveTokens(livePost.seo.title);
        document
            .querySelector('meta[name="description"]')
            ?.setAttribute("content", resolveTokens(livePost.seo.description));
    }, [livePost]);

    if (live && !livePost) {
        return (
            <NotFoundView
                title="This article is no longer available"
                message="It may have been unpublished or moved."
                action={{ href: BLOG_BASE_PATH, label: "Browse all articles" }}
            />
        );
    }

    // Hand-written posts only carry a name; keep the byline link the server matched.
    const post =
        livePost && !livePost.author.slug && livePost.author.name === initialPost.author.name
            ? { ...livePost, author: { ...livePost.author, slug: initialPost.author.slug } }
            : (livePost ?? initialPost);

    const services = (post.relatedServices ?? [])
        .map((serviceSlug) => findService(catalog, serviceSlug))
        .filter((service) => service !== undefined);

    return (
        <BlogPostView
            post={post}
            related={live ? relatedPostsFor(live.posts, post) : initialRelated}
            services={services}
        />
    );
}
