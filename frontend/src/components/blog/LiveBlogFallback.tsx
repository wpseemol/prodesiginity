"use client";

import { useEffect, type ReactNode } from "react";

import BlogPostView from "@/components/blog/BlogPostView";
import LoadErrorView from "@/components/ui/LoadErrorView";
import NotFoundView from "@/components/ui/NotFoundView";
import PageLoader from "@/components/ui/PageLoader";
import { BLOG_BASE_PATH } from "@/data/blog";
import type { BlogPost } from "@/data/blog/types";
import { resolveTokens } from "@/lib/blog";
import {
    fetchBlogFromApi,
    fetchLivePost,
    mergeBlogData,
    relatedPostsFor,
} from "@/lib/blog-api";
import { LIVE_ROUTES } from "@/lib/live-routes";
import { useLiveLookup, type LiveLookup } from "@/lib/useLiveLookup";

type Found = { post: BlogPost; related: BlogPost[] };

async function loadPost(slug: string): Promise<LiveLookup<Found>> {
    const [post, live] = await Promise.all([
        fetchLivePost(slug),
        fetchBlogFromApi(),
    ]);
    if (post) {
        return {
            status: "found",
            data: { post, related: relatedPostsFor(mergeBlogData(live).posts, post) },
        };
    }
    return live ? { status: "missing" } : { status: "error" };
}

/**
 * The static host serves 404.html for any URL it has no file for, including
 * articles published in the dashboard after the last build. This looks the
 * slug up in the live API and renders the article; anything else shows
 * `children`.
 */
export default function LiveBlogFallback({ children }: { children: ReactNode }) {
    const { slug, lookup, retry } = useLiveLookup(LIVE_ROUTES.blog, loadPost);

    useEffect(() => {
        if (lookup?.status !== "found") return;
        const { post } = lookup.data;
        document.title = resolveTokens(post.seo.title);
        document
            .querySelector('meta[name="description"]')
            ?.setAttribute("content", resolveTokens(post.seo.description));
    }, [lookup]);

    if (!slug) return <>{children}</>;
    if (!lookup) return <PageLoader label="Loading article" />;

    if (lookup.status === "error") {
        return (
            <LoadErrorView
                onRetry={retry}
                backHref={BLOG_BASE_PATH}
                backLabel="Browse all articles"
            />
        );
    }

    if (lookup.status === "missing") {
        return (
            <NotFoundView
                title="Article not found"
                message="This article does not exist or has been unpublished."
                action={{ href: BLOG_BASE_PATH, label: "Browse all articles" }}
            />
        );
    }

    return <BlogPostView post={lookup.data.post} related={lookup.data.related} />;
}
