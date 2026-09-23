/**
 * /blog/[slug]
 * ---------------------------------------------------------------------------
 * One page per article, generated from data/blog/posts/*.json.
 *
 * `generateStaticParams` emits every slug at build time, which is what makes
 * these routes work under `output: "export"` — there is no server to resolve
 * an unknown slug later, so `dynamicParams` is off and anything not in the
 * list 404s at the CDN. Same contract as the service detail pages.
 *
 * SEO shape of the page:
 *   - exactly ONE <h1>, and it is the article title
 *   - <h2> for each body heading, <h3> inside them
 *   - BlogPosting + BreadcrumbList + FAQPage JSON-LD
 *   - a canonical URL, per-article title/description, and article OG dates
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowRight,
    ArrowUpRight,
    Calendar,
    ChevronRight,
    Clock,
    Lightbulb,
} from "lucide-react";

import AuthorByline from "@/components/blog/AuthorByline";
import PostBody from "@/components/blog/PostBody";
import PostCover from "@/components/blog/PostCover";
import PostShare from "@/components/blog/PostShare";
import PostToc from "@/components/blog/PostToc";
import BlogCard from "@/components/blog/BlogCard";
import JsonLd from "@/components/home/JsonLd";
import ServiceIcon from "@/components/ServiceIcon";
import { absoluteUrl, siteConfig } from "@/config/site";
import {
    BLOG_BASE_PATH,
    POST_SLUGS,
    blogHref,
    getAccent,
    getPost,
    getRelatedPosts,
} from "@/data/blog";
import { getService, serviceHref } from "@/data/servicesData";
import {
    formatPostDate,
    postToc,
    readingTime,
    resolveTokens,
    wordCount,
} from "@/lib/blog";
import {
    articleSchema,
    breadcrumbSchema,
    buildMetadata,
    faqSchema,
    graph,
} from "@/lib/seo";
import { cn } from "@/lib/utils";

import type { Metadata } from "next";

type Params = { slug: string };

/** Every slug is known at build time — nothing is rendered on demand. */
export function generateStaticParams(): Params[] {
    return POST_SLUGS.map((slug) => ({ slug }));
}

/** A slug outside the list is a 404, not a runtime render. */
export const dynamicParams = false;

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = getPost(slug);

    if (!post) {
        return { title: "Article not found", robots: { index: false } };
    }

    return {
        ...buildMetadata({
            title: resolveTokens(post.seo.title),
            description: resolveTokens(post.seo.description),
            path: blogHref(post.slug),
            image: post.cover ?? siteConfig.ogImage,
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt ?? post.publishedAt,
        }),
        keywords: post.seo.keywords,
        authors: [{ name: post.author.name }],
    };
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { slug } = await params;
    const post = getPost(slug);

    if (!post) notFound();

    const accent = getAccent(post.accent);
    const path = blogHref(post.slug);
    const url = absoluteUrl(path);
    const toc = postToc(post);
    const minutes = readingTime(post);
    const related = getRelatedPosts(post.slug);

    // Unknown service slugs are dropped rather than rendered as dead links,
    // so a typo in a post file cannot ship a 404 into the related rail.
    const services = (post.relatedServices ?? [])
        .map((serviceSlug) => getService(serviceSlug))
        .filter((service) => service !== undefined);

    const schema = graph(
        articleSchema({
            title: resolveTokens(post.title),
            description: resolveTokens(post.seo.description),
            path,
            image: post.cover ?? siteConfig.ogImage,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            author: { name: post.author.name, role: post.author.role },
            keywords: post.seo.keywords,
            section: post.category,
            wordCount: wordCount(post),
        }),
        breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Journal", path: BLOG_BASE_PATH },
            { name: resolveTokens(post.title), path },
        ]),
        ...(post.faqs && post.faqs.length > 0
            ? [
                  faqSchema(
                      post.faqs.map((faq) => ({
                          question: faq.q,
                          answer: faq.a,
                      })),
                  ),
              ]
            : []),
    );

    return (
        <div className="relative overflow-hidden bg-white font-sans text-slate-900 transition-colors duration-300 dark:bg-[#070B14] dark:text-slate-100">
            <JsonLd data={schema} />

            {/* ---------------------------------------------------------------
                Hero — carries the single H1
                --------------------------------------------------------------- */}
            <section className="relative px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
                <div
                    className={cn(
                        "pointer-events-none absolute left-1/2 top-0 h-128 w-208 -translate-x-1/2 rounded-full bg-linear-to-tr opacity-70 blur-3xl",
                        accent.wash,
                    )}
                    aria-hidden="true"
                />

                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-8 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400"
                    >
                        <Link
                            href="/"
                            className="transition-colors hover:text-primary"
                        >
                            Home
                        </Link>
                        <ChevronRight className="h-3 w-3" aria-hidden="true" />
                        <Link
                            href={BLOG_BASE_PATH}
                            className="transition-colors hover:text-primary"
                        >
                            Journal
                        </Link>
                        <ChevronRight className="h-3 w-3" aria-hidden="true" />
                        <span
                            className="font-semibold text-primary dark:text-dark-primary"
                            aria-current="page"
                        >
                            {post.category}
                        </span>
                    </nav>

                    <div className="max-w-3xl">
                        <span
                            className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest",
                                accent.pillBg,
                                accent.pillText,
                            )}
                        >
                            <ServiceIcon
                                name={post.icon}
                                className="h-3.5 w-3.5"
                            />
                            {post.category}
                        </span>

                        {/* THE H1 — one per page, and it is the article title */}
                        <h1 className="mt-5 text-3xl font-black leading-[1.12] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
                            {resolveTokens(post.title)}
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                            {resolveTokens(post.excerpt)}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-border-color pt-6 dark:border-dark-border-color">
                            <AuthorByline author={post.author} />

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    <time dateTime={post.publishedAt}>
                                        {formatPostDate(post.publishedAt)}
                                    </time>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    {minutes} min read
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------------
                Cover
                --------------------------------------------------------------- */}
            <section className="relative px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <PostCover
                        post={post}
                        priority
                        size="hero"
                        className="aspect-16/9 max-h-[28rem] w-full rounded-3xl border border-border-color shadow-xl sm:aspect-21/9 dark:border-dark-border-color"
                    />
                </div>
            </section>

            {/* ---------------------------------------------------------------
                Contents rail + article
                --------------------------------------------------------------- */}
            <section className="relative px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
                <div className="container mx-auto grid grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
                    {/* Contents */}
                    <aside className="lg:col-span-3">
                        <div className="lg:sticky lg:top-28">
                            <PostToc items={toc} />
                        </div>
                    </aside>

                    {/* Article */}
                    <div className="lg:col-span-9 lg:max-w-3xl">
                        {/* Key takeaways — the answer-first summary, and the
                            block an AI assistant is most likely to quote. */}
                        {post.keyTakeaways.length > 0 && (
                            <div className="mb-10 rounded-3xl border border-border-color bg-card-bg p-6 shadow-sm sm:p-8 dark:border-dark-border-color dark:bg-dark-card-bg">
                                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                                    <Lightbulb
                                        className="h-4 w-4 text-primary dark:text-dark-primary"
                                        aria-hidden="true"
                                    />
                                    The short version
                                </h2>
                                <ul className="mt-5 space-y-3.5">
                                    {post.keyTakeaways.map((item) => (
                                        <li
                                            key={item.slice(0, 40)}
                                            className="relative pl-6 text-[15px] leading-7 text-slate-600 dark:text-slate-300"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="absolute left-0 top-[0.7rem] h-1.5 w-1.5 rounded-full bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue"
                                            />
                                            {resolveTokens(item)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <PostBody blocks={post.body} />

                        {/* FAQ — matches the FAQPage JSON-LD above */}
                        {post.faqs && post.faqs.length > 0 && (
                            <div className="mt-14">
                                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                    Common questions
                                </h2>

                                <div className="mt-8 space-y-3">
                                    {post.faqs.map((faq) => (
                                        <details
                                            key={faq.q}
                                            className="group rounded-2xl border border-border-color bg-card-bg p-5 shadow-sm transition-shadow open:shadow-md sm:p-6 dark:border-dark-border-color dark:bg-dark-card-bg"
                                        >
                                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                                                <h3 className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                                                    {resolveTokens(faq.q)}
                                                </h3>
                                                <span
                                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform group-open:rotate-90 dark:bg-slate-800"
                                                    aria-hidden="true"
                                                >
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </span>
                                            </summary>
                                            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                                {resolveTokens(faq.a)}
                                            </p>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags + share + author */}
                        <div className="mt-14 space-y-8 border-t border-border-color pt-8 dark:border-dark-border-color">
                            <div className="flex flex-wrap items-center justify-between gap-5">
                                <ul className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <li
                                            key={tag}
                                            className="rounded-lg border border-border-color bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-dark-border-color dark:bg-slate-800/70 dark:text-slate-300"
                                        >
                                            {tag}
                                        </li>
                                    ))}
                                </ul>

                                <PostShare
                                    url={url}
                                    title={resolveTokens(post.title)}
                                />
                            </div>

                            <AuthorByline author={post.author} variant="card" />

                            {post.updatedAt &&
                                post.updatedAt !== post.publishedAt && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        Last updated{" "}
                                        <time dateTime={post.updatedAt}>
                                            {formatPostDate(post.updatedAt)}
                                        </time>
                                    </p>
                                )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------------
                Related services
                --------------------------------------------------------------- */}
            {services.length > 0 && (
                <section className="relative border-y border-border-color bg-slate-50/60 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 dark:border-dark-border-color dark:bg-[#0A0F1C]">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                            The services behind this article
                        </h2>

                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {services.map((service) => (
                                <Link
                                    key={service.slug}
                                    href={serviceHref(service.slug)}
                                    className={cn(
                                        "group rounded-2xl border border-border-color bg-card-bg p-5 shadow-sm transition-all hover:shadow-lg dark:border-dark-border-color dark:bg-dark-card-bg",
                                        service.accent.hoverBorder,
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "mb-3 flex h-10 w-10 items-center justify-center rounded-xl",
                                            service.accent.iconBg,
                                            service.accent.iconColor,
                                        )}
                                    >
                                        <ServiceIcon
                                            name={service.icon}
                                            className="h-5 w-5"
                                        />
                                    </div>
                                    <h3 className="flex items-center gap-1 text-sm font-black text-slate-900 dark:text-white">
                                        {service.title}
                                        <ArrowUpRight
                                            className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                                            aria-hidden="true"
                                        />
                                    </h3>
                                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                                        {service.summary}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------------------------------------------------------
                Related posts + CTA
                --------------------------------------------------------------- */}
            <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                            Keep reading
                        </h2>
                        <Link
                            href={BLOG_BASE_PATH}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-primary-hover dark:text-dark-primary"
                        >
                            All articles
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {related.map((item) => (
                            <BlogCard key={item.slug} post={item} />
                        ))}
                    </div>

                    <div className="mt-14 rounded-3xl border border-border-color bg-linear-to-br from-card-bg to-slate-100 p-8 text-center shadow-2xl sm:p-10 dark:border-dark-border-color dark:from-[#0B101E] dark:to-[#070A12]">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                            Want this applied to your product?
                        </h2>
                        <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 dark:text-slate-400">
                            Pick a slot on the calendar and we will walk through
                            scope, timeline and cost on a 30-minute call.
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
