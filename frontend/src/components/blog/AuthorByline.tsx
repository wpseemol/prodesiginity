/**
 * components/blog/AuthorByline.tsx
 * ---------------------------------------------------------------------------
 * Who wrote it. Two variants:
 *
 *   "inline" — the meta row under the H1
 *   "card"   — the block at the foot of the article
 *
 * Photos come from /public/assets/images/team/ and are the same files the
 * homepage team slider uses, so an author's picture is never maintained twice.
 * A missing file degrades to initials rather than a broken avatar.
 *
 * When the author has a team profile (`author.slug`), the name links to it.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import SmartImage from "@/components/home/portfolio/SmartImage";
import { mediaUrl } from "@/config/api";
import type { BlogAuthor } from "@/data/blog/types";
import { authorInitials } from "@/lib/blog";
import { staffHref } from "@/lib/team-api";
import { cn } from "@/lib/utils";

interface AuthorBylineProps {
    author: BlogAuthor;
    variant?: "inline" | "card";
    className?: string;
}

function Avatar({ author, size }: { author: BlogAuthor; size: number }) {
    const initials = authorInitials(author.name);

    return (
        <span
            className="relative shrink-0 overflow-hidden rounded-full border border-border-color bg-linear-to-br from-brand-violet/20 to-brand-blue/20 dark:border-dark-border-color dark:from-dark-brand-violet/25 dark:to-dark-brand-blue/25"
            style={{ width: size, height: size }}
        >
            {author.photo ? (
                <SmartImage
                    src={mediaUrl(author.photo) ?? ""}
                    alt={author.name}
                    fallbackLabel={initials}
                    fill
                    sizes={`${size}px`}
                    className="object-cover"
                />
            ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-black text-primary dark:text-dark-primary">
                    {initials}
                </span>
            )}
        </span>
    );
}

function AuthorName({ author }: { author: BlogAuthor }) {
    if (!author.slug) return <>{author.name}</>;
    return (
        <Link
            href={staffHref(author.slug)}
            rel="author"
            className="transition-colors hover:text-primary dark:hover:text-dark-primary"
        >
            {author.name}
        </Link>
    );
}

export default function AuthorByline({
    author,
    variant = "inline",
    className,
}: AuthorBylineProps) {
    if (variant === "card") {
        return (
            <div
                className={cn(
                    "flex items-start gap-4 rounded-3xl border border-border-color bg-card-bg p-6 shadow-sm dark:border-dark-border-color dark:bg-dark-card-bg",
                    className,
                )}
            >
                <Avatar author={author} size={56} />
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Written by
                    </p>
                    <p className="mt-1 text-base font-black text-slate-900 dark:text-white">
                        <AuthorName author={author} />
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {author.role}
                    </p>
                </div>
                {author.slug ? (
                    <Link
                        href={staffHref(author.slug)}
                        className="hidden shrink-0 items-center gap-1.5 self-center rounded-xl border border-border-color px-3.5 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-primary/40 hover:text-primary sm:inline-flex dark:border-dark-border-color dark:text-slate-300 dark:hover:text-dark-primary"
                    >
                        View profile
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                ) : null}
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <Avatar author={author} size={40} />
            <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                    <AuthorName author={author} />
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {author.role}
                </p>
            </div>
        </div>
    );
}
