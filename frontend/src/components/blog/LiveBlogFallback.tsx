"use client";

import {
    useEffect,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";

import BlogPostView from "@/components/blog/BlogPostView";
import { BLOG_BASE_PATH } from "@/data/blog";
import type { BlogPost } from "@/data/blog/types";
import { resolveTokens } from "@/lib/blog";
import {
    fetchBlogFromApi,
    fetchLivePost,
    mergeBlogData,
    relatedPostsFor,
} from "@/lib/blog-api";

const POST_PATH = new RegExp(`^${BLOG_BASE_PATH}/([a-z0-9-]{1,160})/?$`);

const subscribe = () => () => {};

/** On the static 404 page the router pathname is the not-found route. */
function requestedPostSlug(): string | null {
    const match = window.location.pathname.match(POST_PATH);
    return match ? match[1] : null;
}

type Lookup = { slug: string; post: BlogPost | null; related: BlogPost[] };

/**
 * The static host serves 404.html for any URL it has no file for, including
 * articles published in the dashboard after the last build. This looks the
 * slug up in the live API and renders the article; anything else shows
 * `children`.
 */
export default function LiveBlogFallback({ children }: { children: ReactNode }) {
    const slug = useSyncExternalStore(subscribe, requestedPostSlug, () => null);
    const [lookup, setLookup] = useState<Lookup | null>(null);

    useEffect(() => {
        if (!slug) return;
        let active = true;

        void Promise.all([fetchLivePost(slug), fetchBlogFromApi()]).then(([post, live]) => {
            if (!active) return;
            const related = post ? relatedPostsFor(mergeBlogData(live).posts, post) : [];
            if (post) {
                document.title = resolveTokens(post.seo.title);
                document
                    .querySelector('meta[name="description"]')
                    ?.setAttribute("content", resolveTokens(post.seo.description));
            }
            setLookup({ slug, post, related });
        });

        return () => {
            active = false;
        };
    }, [slug]);

    if (!slug) return <>{children}</>;

    if (lookup?.slug !== slug) {
        return (
            <div
                className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-[#070B14]"
                aria-busy="true"
            >
                <span className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
        );
    }

    if (lookup.post) return <BlogPostView post={lookup.post} related={lookup.related} />;

    return <>{children}</>;
}
