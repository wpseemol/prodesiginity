import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    Info,
    Mail,
    ShieldCheck,
    TriangleAlert,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import type { LegalBlock, LegalDocument } from "@/data/legal/types";
import {
    estimateReadingTime,
    formatLegalDate,
    resolveTokens,
} from "@/lib/legal";
import { cn } from "@/lib/utils";
import LegalToc from "./LegalToc";

/**
 * app/_components/legal/LegalDocumentView.tsx
 * ---------------------------------------------------------------------------
 * Renders any LegalDocument. Both /privacy-policy and /terms use
 * this, so adding a Cookie Policy or DPA later is a data file plus a 12-line
 * page — no new layout work, and no chance of the two pages drifting apart.
 *
 * Server component: the whole document is in the initial HTML, which matters
 * for the AI crawlers that don't run JavaScript. Only the contents rail is
 * client-side.
 */

/* -------------------------------------------------------------------------- */
/* Inline text                                                                */
/* -------------------------------------------------------------------------- */

const INLINE_PATTERN = /([\w.+-]+@[\w-]+\.[\w.]+|https?:\/\/[^\s)]+)/g;

/** Resolves {{tokens}} and turns emails and URLs into real links. */
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
                            className="font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-2 transition-colors hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:decoration-indigo-500/50 dark:hover:text-indigo-300"
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
/* Blocks                                                                     */
/* -------------------------------------------------------------------------- */

function Block({ block }: { block: LegalBlock }) {
    switch (block.type) {
        case "paragraph":
            return (
                <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                    <InlineText>{block.text}</InlineText>
                </p>
            );

        case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
                <ListTag
                    className={cn(
                        "space-y-2.5 text-[15px] leading-7 text-slate-600 dark:text-slate-300",
                        block.ordered ? "list-decimal pl-5" : "pl-0",
                    )}
                >
                    {block.items.map((item, i) => (
                        <li
                            key={i}
                            className={cn(
                                block.ordered
                                    ? "pl-1 marker:font-semibold marker:text-indigo-500 dark:marker:text-indigo-400"
                                    : "relative pl-6",
                            )}
                        >
                            {!block.ordered && (
                                <span
                                    aria-hidden
                                    className="absolute left-0 top-[0.7rem] h-1.5 w-1.5 rounded-full bg-linear-to-r from-violet-500 to-indigo-500"
                                />
                            )}
                            <InlineText>{item}</InlineText>
                        </li>
                    ))}
                </ListTag>
            );
        }

        case "definitions":
            return (
                <dl className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                    {block.items.map((item, i) => (
                        <div
                            key={i}
                            className="grid gap-1 bg-white/60 p-4 sm:grid-cols-[minmax(9rem,11rem)_1fr] sm:gap-5 dark:bg-slate-900/40"
                        >
                            <dt className="text-sm font-semibold text-slate-900 dark:text-white">
                                <InlineText>{item.term}</InlineText>
                            </dt>
                            <dd className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                                <InlineText>{item.description}</InlineText>
                            </dd>
                        </div>
                    ))}
                </dl>
            );

        case "table":
            return (
                <figure className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            {block.caption && (
                                <caption className="sr-only">
                                    {resolveTokens(block.caption)}
                                </caption>
                            )}
                            <thead className="bg-slate-50 dark:bg-slate-900/70">
                                <tr>
                                    {block.head.map((cell, i) => (
                                        <th
                                            key={i}
                                            scope="col"
                                            className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
                                        >
                                            {resolveTokens(cell)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {block.rows.map((row, i) => (
                                    <tr
                                        key={i}
                                        className="bg-white/60 align-top dark:bg-slate-900/30"
                                    >
                                        {row.map((cell, j) => (
                                            <td
                                                key={j}
                                                className={cn(
                                                    "px-4 py-3 leading-6",
                                                    j === 0
                                                        ? "font-medium text-slate-900 dark:text-slate-100"
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

        case "callout": {
            const isWarning = block.tone === "warning";
            const Icon = isWarning ? TriangleAlert : Info;

            return (
                <aside
                    className={cn(
                        "flex gap-3 rounded-xl border p-4",
                        isWarning
                            ? "border-orange-200 bg-orange-50/70 dark:border-orange-500/25 dark:bg-orange-500/5"
                            : "border-indigo-200 bg-indigo-50/70 dark:border-indigo-500/25 dark:bg-indigo-500/5",
                    )}
                >
                    <Icon
                        className={cn(
                            "mt-0.5 h-4.5 w-4.5 shrink-0",
                            isWarning
                                ? "text-orange-500 dark:text-orange-400"
                                : "text-indigo-500 dark:text-indigo-400",
                        )}
                    />
                    <div className="space-y-1">
                        {block.title && (
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                <InlineText>{block.title}</InlineText>
                            </p>
                        )}
                        <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                            <InlineText>{block.text}</InlineText>
                        </p>
                    </div>
                </aside>
            );
        }
    }
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

function MetaChip({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                {label}
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {value}
            </span>
        </div>
    );
}

export default function LegalDocumentView({ doc }: { doc: LegalDocument }) {
    const toc = doc.sections.map(({ id, title }) => ({ id, title }));
    const minutes = estimateReadingTime(doc);

    return (
        <main className="relative  bg-white font-sans transition-colors duration-300 dark:bg-[#090D16]">
            {/* Ambient brand glow, matching the rest of the site */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-40 left-1/2 h-75 w-75 -translate-x-1/2 rounded-full bg-linear-to-tr from-violet-600/15 via-indigo-600/15 to-blue-500/15 blur-3xl sm:h-137.5 sm:w-137.5 dark:from-violet-600/25 dark:via-indigo-600/20 dark:to-blue-500/20
                
                "
            />

            <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pt-24">
                {/* ---------------------------------------------- Header */}
                <header className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700/70 dark:bg-slate-800/90 dark:text-slate-200">
                        <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
                        <span>{doc.eyebrow}</span>
                    </div>

                    <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                        {doc.title.split(" ").slice(0, -1).join(" ")}{" "}
                        <span className="bg-linear-to-r from-violet-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-400 dark:to-blue-400">
                            {doc.title.split(" ").slice(-1)}
                        </span>
                    </h1>

                    <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                        <InlineText>{doc.description}</InlineText>
                    </p>

                    <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 rounded-2xl border border-slate-200 bg-white/70 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
                        <MetaChip label="Version" value={doc.version} />
                        <MetaChip
                            label="Effective"
                            value={
                                <time dateTime={doc.effectiveDate}>
                                    {formatLegalDate(doc.effectiveDate)}
                                </time>
                            }
                        />
                        <MetaChip
                            label="Last updated"
                            value={
                                <time dateTime={doc.lastUpdated}>
                                    {formatLegalDate(doc.lastUpdated)}
                                </time>
                            }
                        />
                        <MetaChip label="Read time" value={`${minutes} min`} />
                    </div>
                </header>

                {/* ---------------------------------------------- Body */}
                <div className="mt-14 grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14 relative">
                    <aside className="lg:pt-1 lg:sticky lg:top-28 lg:self-start">
                        <LegalToc items={toc} />
                    </aside>

                    <article className="min-w-0 max-w-3xl">
                        {doc.intro.length > 0 && (
                            <div className="space-y-4 border-b border-slate-200 pb-10 dark:border-slate-800">
                                {doc.intro.map((paragraph, i) => (
                                    <p
                                        key={i}
                                        className="text-[15px] leading-7 text-slate-600 dark:text-slate-300"
                                    >
                                        <InlineText>{paragraph}</InlineText>
                                    </p>
                                ))}
                            </div>
                        )}

                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {doc.sections.map((section, index) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-28 py-10"
                                    aria-labelledby={`${section.id}-heading`}
                                >
                                    <p className="font-mono text-xs font-semibold tabular-nums text-indigo-500 dark:text-indigo-400">
                                        {String(index + 1).padStart(2, "0")}
                                    </p>

                                    <h2
                                        id={`${section.id}-heading`}
                                        className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
                                    >
                                        {resolveTokens(section.title)}
                                    </h2>

                                    {/*
                                      The "In short" rail is the one deliberate
                                      flourish on the page. It gives a reader the
                                      plain-language answer before the clause, and
                                      it is the passage an AI assistant quotes when
                                      someone asks about this policy.
                                    */}
                                    {section.summary && (
                                        <p className="mt-4 border-l-2 border-indigo-400 pl-4 text-[15px] font-medium leading-7 text-slate-800 dark:border-indigo-500 dark:text-slate-100">
                                            <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-500 dark:text-indigo-400">
                                                In short
                                            </span>
                                            <InlineText>
                                                {section.summary}
                                            </InlineText>
                                        </p>
                                    )}

                                    <div className="mt-5 space-y-5">
                                        {section.blocks.map((block, i) => (
                                            <Block key={i} block={block} />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>

                        {/* ------------------------------------------ FAQ */}
                        {doc.faq && doc.faq.length > 0 && (
                            <section
                                id="faq"
                                className="scroll-mt-28 border-t border-slate-200 pt-10 dark:border-slate-800"
                            >
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                                    Common questions
                                </h2>

                                <div className="mt-6 space-y-3">
                                    {doc.faq.map((item, i) => (
                                        <details
                                            key={i}
                                            className="group rounded-xl border border-slate-200 bg-white/60 open:bg-white dark:border-slate-800 dark:bg-slate-900/30 dark:open:bg-slate-900/60"
                                        >
                                            <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3.5 text-[15px] font-semibold text-slate-900 [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-white">
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 transition-transform group-open:scale-150 dark:bg-indigo-400" />
                                                <InlineText>
                                                    {item.question}
                                                </InlineText>
                                            </summary>
                                            <p className="px-4 pb-4 pl-10 text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                                                <InlineText>
                                                    {item.answer}
                                                </InlineText>
                                            </p>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* -------------------------------------- Contact */}
                        <div className="mt-12 rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
                            {doc.closing && (
                                <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                                    <InlineText>{doc.closing}</InlineText>
                                </p>
                            )}

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href={`mailto:${siteConfig.email}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#090D16]"
                                >
                                    <Mail className="h-4 w-4" />
                                    Email {siteConfig.email}
                                </a>

                                <Link
                                    href={siteConfig.contactPath}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:text-indigo-400"
                                >
                                    Start a project
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </main>
    );
}
