/**
 * /blog
 * ---------------------------------------------------------------------------
 * The article index, generated from data/blog/posts/*.json.
 *
 * Server component: every post title, excerpt and link is in the initial HTML,
 * so a crawler that does not execute JavaScript still sees the full index.
 * Only the filter chips and the search field hydrate (BlogListing).
 *
 * SEO shape of the page:
 *   - exactly ONE <h1>
 *   - Blog + BreadcrumbList JSON-LD listing every post
 *   - a canonical URL and its own title/description
 */

import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";

import BlogListing from "@/components/blog/BlogListing";
import { HeaderPill } from "@/components/HeaderPill";
import JsonLd from "@/components/home/JsonLd";
import PortfolioBackground from "@/components/home/portfolio/PortfolioBackground";
import {
    BLOG_BASE_PATH,
    BLOG_CATEGORIES,
    FEATURED_POST,
    POSTS,
    blogHref,
} from "@/data/blog";
import { blogSchema, breadcrumbSchema, buildMetadata, graph } from "@/lib/seo";

import type { Metadata } from "next";

const TITLE = "Journal";
const DESCRIPTION =
    "Practical notes on 3D product visualization, packaging design, Shopify and marketplace creative — written by the people doing the work.";

export const metadata: Metadata = {
    ...buildMetadata({
        title: TITLE,
        description: DESCRIPTION,
        path: BLOG_BASE_PATH,
    }),
    keywords: [
        "3d product rendering blog",
        "ecommerce design articles",
        "packaging design guide",
        "shopify conversion tips",
        "product animation guide",
    ],
};

export default function BlogIndexPage() {
    const schema = graph(
        blogSchema(
            POSTS.map((post) => ({
                title: post.title,
                path: blogHref(post.slug),
                datePublished: post.publishedAt,
            })),
        ),
        breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: TITLE, path: BLOG_BASE_PATH },
        ]),
    );

    return (
        <div className="relative overflow-hidden bg-white font-sans text-slate-900 transition-colors duration-300 dark:bg-[#070B14] dark:text-slate-100">
            <JsonLd data={schema} />

            {/* ---------------------------------------------------------------
                Hero — carries the single H1
                --------------------------------------------------------------- */}
            <section className="relative border-b border-border-color pb-16 pt-24 sm:pb-20 sm:pt-32 dark:border-dark-border-color">
                <PortfolioBackground />

                <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <HeaderPill
                        text="The ProDesignity Journal"
                        className="mb-6 sm:mb-8"
                        icon={
                            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                        }
                    />

                    <h1 className="text-4xl font-black leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
                        What we have learned <br />
                        <span className="bg-linear-to-r from-primary via-brand-violet to-cyan-500 bg-clip-text text-transparent dark:from-primary dark:via-dark-primary dark:to-cyan-400">
                            shipping product creative
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
                        {DESCRIPTION}
                    </p>

                    <p className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        {POSTS.length} articles · {BLOG_CATEGORIES.length}{" "}
                        topics
                    </p>
                </div>
            </section>

            {/* ---------------------------------------------------------------
                Filters + grid
                --------------------------------------------------------------- */}
            <section className="relative px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <BlogListing
                        posts={POSTS}
                        categories={BLOG_CATEGORIES}
                        featured={FEATURED_POST}
                    />
                </div>
            </section>

            {/* ---------------------------------------------------------------
                CTA
                --------------------------------------------------------------- */}
            <section className="relative border-t border-border-color px-4 py-16 sm:px-6 sm:py-20 lg:px-8 dark:border-dark-border-color">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-border-color bg-linear-to-br from-card-bg to-slate-100 p-8 text-center shadow-2xl sm:p-10 dark:border-dark-border-color dark:from-[#0B101E] dark:to-[#070A12]">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                            Got a project that needs this thinking applied?
                        </h2>
                        <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 dark:text-slate-400">
                            Book a 30-minute call and we will walk through
                            scope, timeline and cost. No pitch deck.
                        </p>
                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-violet to-brand-blue px-7 py-3.5 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90 dark:from-dark-brand-violet dark:to-dark-brand-blue"
                            >
                                Book your free call
                                <ArrowRight
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                            </Link>
                            <Link
                                href="/services"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-color bg-slate-100 px-7 py-3.5 font-bold text-slate-700 transition-all hover:border-primary/40 dark:border-dark-border-color dark:bg-slate-800/70 dark:text-slate-200"
                            >
                                Browse our services
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
