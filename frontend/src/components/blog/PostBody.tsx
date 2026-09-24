/**
 * components/blog/PostBody.tsx
 * ---------------------------------------------------------------------------
 * Turns a post's `body` array into the article.
 *
 * Server component on purpose: the whole article is in the initial HTML
 * response, which is what several AI crawlers need since they do not execute
 * JavaScript. Only the contents rail and the share row are client-side.
 *
 * Adding a new block type is a two-step change — add it to the union in
 * data/blog/types.ts, then add a `case` here. TypeScript will point at this
 * file until you do, because the switch is exhaustive.
 */

import { Fragment } from "react";
import { CircleCheck, Info, Quote, TriangleAlert } from "lucide-react";

import SmartImage from "@/components/home/portfolio/SmartImage";
import type { BlogBlock } from "@/data/blog/types";
import { resolveTokens } from "@/lib/blog";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Inline text                                                                */
/* -------------------------------------------------------------------------- */

const INLINE_PATTERN = /([\w.+-]+@[\w-]+\.[\w.]+|https?:\/\/[^\s)]+)/g;

/**
 * Resolves {{tokens}} and turns bare emails and URLs into real links, so a
 * writer never has to type markup into a JSON string.
 */
function InlineText({ children }: { children: string }) {
    const text = resolveTokens(children);
    const parts = text.split(INLINE_PATTERN);

    return (
        <>
            {parts.map((part, i) => {
                if (!part) return null;

                const isEmail = /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part);
                const isUrl = /^https?:\/\//.test(part);

                if (isEmail || isUrl) {
                    return (
                        <a
                            key={i}
                            href={isEmail ? `mailto:${part}` : part}
                            className="font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary-hover dark:text-dark-primary dark:decoration-dark-primary/40"
                            {...(isUrl && {
                                target: "_blank",
                                rel: "noopener noreferrer",
                            })}
                        >
                            {part}
                        </a>
                    );
                }

                return <Fragment key={i}>{part}</Fragment>;
            })}
        </>
    );
}

/* -------------------------------------------------------------------------- */
/* Callout tones                                                              */
/* -------------------------------------------------------------------------- */

const CALLOUT_TONES = {
    info: {
        icon: Info,
        wrapper:
            "border-primary/25 bg-primary/5 dark:border-dark-primary/25 dark:bg-dark-primary/5",
        icon_color: "text-primary dark:text-dark-primary",
    },
    warning: {
        icon: TriangleAlert,
        wrapper:
            "border-brand-orange/30 bg-brand-orange/5 dark:border-dark-brand-orange/30 dark:bg-dark-brand-orange/5",
        icon_color: "text-brand-orange dark:text-dark-brand-orange",
    },
    success: {
        icon: CircleCheck,
        wrapper: "border-emerald-500/30 bg-emerald-500/5",
        icon_color: "text-emerald-600 dark:text-emerald-400",
    },
} as const;

/* -------------------------------------------------------------------------- */
/* Blocks                                                                     */
/* -------------------------------------------------------------------------- */

function Block({ block }: { block: BlogBlock }) {
    switch (block.type) {
        /**
         * scroll-mt clears the sticky header when an anchor is jumped to —
         * without it the heading lands underneath the nav bar.
         */
        case "heading":
            return (
                <h2
                    id={block.id}
                    className="scroll-mt-28 pt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white"
                >
                    <InlineText>{block.text}</InlineText>
                </h2>
            );

        case "subheading":
            return (
                <h3 className="pt-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    <InlineText>{block.text}</InlineText>
                </h3>
            );

        case "paragraph":
            return (
                <p className="text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8 dark:text-slate-300">
                    <InlineText>{block.text}</InlineText>
                </p>
            );

        case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
                <ListTag
                    className={cn(
                        "space-y-3 text-[15px] leading-7 text-slate-600 sm:text-base dark:text-slate-300",
                        block.ordered ? "list-decimal pl-5" : "pl-0",
                    )}
                >
                    {block.items.map((item, i) => (
                        <li
                            key={i}
                            className={cn(
                                block.ordered
                                    ? "pl-1 marker:font-black marker:text-primary dark:marker:text-dark-primary"
                                    : "relative pl-6",
                            )}
                        >
                            {!block.ordered && (
                                <span
                                    aria-hidden="true"
                                    className="absolute left-0 top-[0.7rem] h-1.5 w-1.5 rounded-full bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue"
                                />
                            )}
                            <InlineText>{item}</InlineText>
                        </li>
                    ))}
                </ListTag>
            );
        }

        /**
         * Numbered because the content genuinely is a sequence — a process or
         * an ordered set of frames. Do not use this block for a plain list;
         * `list` exists for that.
         */
        case "steps":
            return (
                <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {block.items.map((item, i) => (
                        <li
                            key={item.title}
                            className="rounded-2xl border border-border-color bg-card-bg p-6 shadow-sm transition-colors hover:border-primary/40 dark:border-dark-border-color dark:bg-dark-card-bg"
                        >
                            <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary dark:text-dark-primary">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                <InlineText>{item.title}</InlineText>
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                <InlineText>{item.body}</InlineText>
                            </p>
                        </li>
                    ))}
                </ol>
            );

        case "quote":
            return (
                <figure className="relative overflow-hidden rounded-3xl border border-border-color bg-linear-to-br from-card-bg to-slate-100 p-7 shadow-sm sm:p-9 dark:border-dark-border-color dark:from-[#0B101E] dark:to-[#070A12]">
                    <Quote
                        className="absolute right-6 top-6 h-10 w-10 text-primary/10 dark:text-dark-primary/10"
                        aria-hidden="true"
                    />
                    <blockquote className="relative text-lg font-semibold leading-relaxed text-slate-800 sm:text-xl dark:text-slate-100">
                        <InlineText>{block.text}</InlineText>
                    </blockquote>
                    {block.attribution && (
                        <figcaption className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            <InlineText>{block.attribution}</InlineText>
                        </figcaption>
                    )}
                </figure>
            );

        case "callout": {
            const tone = CALLOUT_TONES[block.tone ?? "info"];
            const Icon = tone.icon;

            return (
                <aside
                    className={cn(
                        "flex gap-4 rounded-2xl border p-5 sm:p-6",
                        tone.wrapper,
                    )}
                >
                    <Icon
                        className={cn("mt-0.5 h-5 w-5 shrink-0", tone.icon_color)}
                        aria-hidden="true"
                    />
                    <div>
                        {block.title && (
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                                <InlineText>{block.title}</InlineText>
                            </p>
                        )}
                        <p
                            className={cn(
                                "text-[15px] leading-7 text-slate-600 dark:text-slate-300",
                                block.title && "mt-1.5",
                            )}
                        >
                            <InlineText>{block.text}</InlineText>
                        </p>
                    </div>
                </aside>
            );
        }

        case "table":
            return (
                <figure className="overflow-hidden rounded-2xl border border-border-color dark:border-dark-border-color">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            {block.caption && (
                                <caption className="sr-only">
                                    {resolveTokens(block.caption)}
                                </caption>
                            )}
                            <thead className="bg-slate-50 dark:bg-[#0A0F1C]">
                                <tr>
                                    {block.head.map((cell, i) => (
                                        <th
                                            key={i}
                                            scope="col"
                                            className="whitespace-nowrap px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
                                        >
                                            {resolveTokens(cell)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color dark:divide-dark-border-color">
                                {block.rows.map((row, i) => (
                                    <tr
                                        key={i}
                                        className="align-top bg-card-bg dark:bg-dark-card-bg"
                                    >
                                        {row.map((cell, j) => (
                                            <td
                                                key={j}
                                                className={cn(
                                                    "px-4 py-3.5 leading-6",
                                                    j === 0
                                                        ? "font-semibold text-slate-900 dark:text-slate-100"
                                                        : "text-slate-600 dark:text-slate-300",
                                                )}
                                            >
                                                <InlineText>{cell}</InlineText>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </figure>
            );

        case "image":
            return (
                <figure>
                    <div className="relative aspect-16/9 overflow-hidden rounded-2xl border border-border-color dark:border-dark-border-color">
                        <SmartImage
                            src={block.src}
                            alt={block.alt}
                            fallbackLabel={block.caption ?? block.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, 760px"
                            className="object-cover"
                        />
                    </div>
                    {block.caption && (
                        <figcaption className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                            <InlineText>{block.caption}</InlineText>
                        </figcaption>
                    )}
                </figure>
            );

        case "stats":
            return (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {block.items.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-2xl border border-border-color bg-card-bg p-6 text-center shadow-sm dark:border-dark-border-color dark:bg-dark-card-bg"
                        >
                            <dt className="sr-only">{item.label}</dt>
                            <dd>
                                <span className="block bg-linear-to-r from-brand-violet to-brand-blue bg-clip-text text-3xl font-black tracking-tight text-transparent dark:from-dark-brand-violet dark:to-dark-brand-blue">
                                    {item.value}
                                </span>
                                <span className="mt-2 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                    <InlineText>{item.label}</InlineText>
                                </span>
                            </dd>
                        </div>
                    ))}
                </dl>
            );

        case "divider":
            return (
                <hr className="border-border-color dark:border-dark-border-color" />
            );
    }
}

export default function PostBody({ blocks }: { blocks: BlogBlock[] }) {
    return (
        <div className="space-y-6 sm:space-y-7">
            {blocks.map((block, i) => (
                <Block key={i} block={block} />
            ))}
        </div>
    );
}
