"use client";

/**
 * components/blog/PostShare.tsx
 * ---------------------------------------------------------------------------
 * Share row for an article.
 *
 * The URL is passed in from the server rather than read from `window`, so the
 * markup is identical on both sides of hydration and the share targets are
 * absolute canonical URLs — not whatever host the page happens to be served
 * from (a preview domain, say).
 *
 * `navigator.clipboard` needs a secure context, so the copy button falls back
 * to the native share sheet where available and simply reports failure rather
 * than pretending it worked.
 */

import { useState } from "react";
import { Check, Copy, Link2, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface PostShareProps {
    url: string;
    title: string;
}

export default function PostShare({ url, title }: PostShareProps) {
    const [copied, setCopied] = useState(false);

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    /**
     * Generic glyphs rather than brand marks: lucide-react dropped its brand
     * icons in v1, so `Linkedin` and `Twitter` no longer exist in the version
     * this project installs. The accessible name on each link carries the
     * destination, so nothing is lost but the logo.
     */
    const targets = [
        {
            name: "Share on LinkedIn",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            icon: Link2,
        },
        {
            name: "Share on X",
            href: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            icon: Share2,
        },
    ];

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard blocked (insecure context, or the user declined).
            // Offer the OS share sheet instead of silently doing nothing.
            if (navigator.share) {
                await navigator.share({ title, url }).catch(() => {});
            }
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Share
            </span>

            {targets.map((target) => (
                <a
                    key={target.name}
                    href={target.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={target.name}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-color bg-card-bg text-slate-500 transition-all hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-dark-border-color dark:bg-dark-card-bg dark:text-slate-400 dark:hover:text-dark-primary"
                >
                    <target.icon className="h-4 w-4" aria-hidden="true" />
                </a>
            ))}

            <button
                type="button"
                onClick={copy}
                aria-label={copied ? "Link copied" : "Copy link to this article"}
                className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    copied
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border-color bg-card-bg text-slate-500 hover:border-primary/40 hover:text-primary dark:border-dark-border-color dark:bg-dark-card-bg dark:text-slate-400 dark:hover:text-dark-primary",
                )}
            >
                {copied ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy link"}
            </button>
        </div>
    );
}
