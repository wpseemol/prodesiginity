/**
 * components/team/SocialLinks.tsx
 * ---------------------------------------------------------------------------
 * A staff member's social accounts with real brand marks. lucide-react v1
 * dropped brand icons, so the glyphs are inline SVG (simple-icons paths).
 *
 * Variants, so each profile style can present links in its own voice:
 *   "icons"    — round brand-coloured buttons (hero rows)
 *   "pills"    — icon + network name
 *   "tiles"    — full-width rows with the handle, for the Connect card
 *   "terminal" — monospace `→ handle` lines for the developer layout
 */

import { ArrowUpRight, Globe } from "lucide-react";

import type { SocialNetwork, TeamMember } from "@/data/teamData";
import { cn } from "@/lib/utils";

type Meta = {
    label: string;
    /** Solid brand fill. */
    solid: string;
    /** Brand colour on hover for neutral buttons. */
    hover: string;
    /** Brand-tinted text. */
    text: string;
};

export const SOCIAL_META: Record<SocialNetwork, Meta> = {
    facebook: {
        label: "Facebook",
        solid: "bg-[#1877F2] text-white",
        hover: "hover:border-[#1877F2]/50 hover:bg-[#1877F2] hover:text-white",
        text: "text-[#1877F2]",
    },
    instagram: {
        label: "Instagram",
        solid: "bg-linear-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white",
        hover: "hover:border-[#DD2A7B]/50 hover:bg-linear-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white",
        text: "text-[#DD2A7B]",
    },
    linkedin: {
        label: "LinkedIn",
        solid: "bg-[#0A66C2] text-white",
        hover: "hover:border-[#0A66C2]/50 hover:bg-[#0A66C2] hover:text-white",
        text: "text-[#0A66C2] dark:text-[#4A9BE8]",
    },
    behance: {
        label: "Behance",
        solid: "bg-[#1769FF] text-white",
        hover: "hover:border-[#1769FF]/50 hover:bg-[#1769FF] hover:text-white",
        text: "text-[#1769FF]",
    },
    dribbble: {
        label: "Dribbble",
        solid: "bg-[#EA4C89] text-white",
        hover: "hover:border-[#EA4C89]/50 hover:bg-[#EA4C89] hover:text-white",
        text: "text-[#EA4C89]",
    },
    artstation: {
        label: "ArtStation",
        solid: "bg-[#13AFF0] text-white",
        hover: "hover:border-[#13AFF0]/50 hover:bg-[#13AFF0] hover:text-white",
        text: "text-[#13AFF0]",
    },
    x: {
        label: "X",
        solid: "bg-black text-white dark:bg-white dark:text-black",
        hover: "hover:border-slate-900/50 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black",
        text: "text-slate-900 dark:text-white",
    },
    github: {
        label: "GitHub",
        solid: "bg-[#181717] text-white dark:bg-white dark:text-[#181717]",
        hover: "hover:border-slate-900/50 hover:bg-[#181717] hover:text-white dark:hover:bg-white dark:hover:text-[#181717]",
        text: "text-[#181717] dark:text-white",
    },
    youtube: {
        label: "YouTube",
        solid: "bg-[#FF0000] text-white",
        hover: "hover:border-[#FF0000]/50 hover:bg-[#FF0000] hover:text-white",
        text: "text-[#FF0000]",
    },
    website: {
        label: "Website",
        solid: "bg-linear-to-br from-brand-violet to-brand-blue text-white",
        hover: "hover:border-primary/50 hover:bg-primary hover:text-white",
        text: "text-primary dark:text-dark-primary",
    },
};

const ORDER = Object.keys(SOCIAL_META) as SocialNetwork[];

export function SocialIcon({
    network,
    className,
}: {
    network: SocialNetwork;
    className?: string;
}) {
    const common = { className, viewBox: "0 0 24 24", "aria-hidden": true } as const;

    switch (network) {
        case "facebook":
            return (
                <svg {...common} fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            );
        case "instagram":
            return (
                <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4.2" />
                    <circle cx="17.6" cy="6.4" r="0.6" fill="currentColor" />
                </svg>
            );
        case "linkedin":
            return (
                <svg {...common} fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            );
        case "behance":
            return (
                <svg {...common} fill="currentColor">
                    <path d="M8.2 11.3c.9-.4 1.4-1.2 1.4-2.3 0-2.2-1.6-2.9-3.6-2.9H0v12h6.2c2.2 0 4.2-1 4.2-3.5 0-1.5-.7-2.7-2.2-3.3zM2.8 8.2h2.6c1 0 1.9.3 1.9 1.4 0 1.1-.7 1.5-1.7 1.5H2.8V8.2zm2.9 7.8H2.8v-3.3h3c1.2 0 2 .5 2 1.7 0 1.3-.9 1.6-2.1 1.6zM21.6 7.3h-5.9V5.9h5.9v1.4zM24 13.5c0-2.6-1.5-4.7-4.2-4.7-2.6 0-4.4 2-4.4 4.6 0 2.7 1.7 4.6 4.4 4.6 2 0 3.4-.9 4-2.9h-2c-.2.7-1.1 1.1-1.9 1.1-1.5 0-2.3-.9-2.3-2.4H24v-.3zm-6.4-1.1c.1-1.2.9-2 2.1-2 1.3 0 1.9.8 2 2h-4.1z" />
                </svg>
            );
        case "dribbble":
            return (
                <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
                    <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
                    <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
                </svg>
            );
        case "artstation":
            return (
                <svg {...common} fill="currentColor">
                    <path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 0 0-2.142-1.289H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zm-11.129-3.462L7.428 4.858l-5.444 9.428h10.887z" />
                </svg>
            );
        case "x":
            return (
                <svg {...common} fill="currentColor">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
            );
        case "github":
            return (
                <svg {...common} fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
            );
        case "youtube":
            return (
                <svg {...common} fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            );
        case "website":
            return <Globe className={className} aria-hidden="true" />;
    }
}

/** "@handle" from a profile URL; the hostname for websites. */
export function socialHandle(network: SocialNetwork, url: string): string {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, "");
        if (network === "website") return host;
        const last = parsed.pathname.split("/").filter(Boolean).pop();
        if (!last || last.includes(".")) return host;
        return `@${decodeURIComponent(last).replace(/^@/, "")}`;
    } catch {
        return url;
    }
}

export function socialEntries(socials: TeamMember["socials"]) {
    return ORDER.filter((network) => socials?.[network]).map((network) => ({
        network,
        url: socials![network]!,
        meta: SOCIAL_META[network],
    }));
}

interface SocialLinksProps {
    socials: TeamMember["socials"];
    /** Used in accessible names: "Asif on Behance". */
    ownerName: string;
    variant?: "icons" | "pills" | "tiles" | "terminal";
    /** "icons" only: brand fill instead of a neutral button. */
    solid?: boolean;
    size?: "sm" | "md";
    className?: string;
}

export default function SocialLinks({
    socials,
    ownerName,
    variant = "icons",
    solid = false,
    size = "md",
    className,
}: SocialLinksProps) {
    const entries = socialEntries(socials);
    if (entries.length === 0) return null;

    if (variant === "terminal") {
        return (
            <ul className={cn("space-y-1 font-mono text-sm", className)}>
                {entries.map(({ network, url, meta }) => (
                    <li key={network}>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer me"
                            aria-label={`${ownerName} on ${meta.label}`}
                            className="group inline-flex items-center gap-2 text-emerald-300/90 transition-colors hover:text-white"
                        >
                            <span className="text-emerald-500">→</span>
                            <SocialIcon network={network} className="h-3.5 w-3.5" />
                            <span className="text-slate-500">{meta.label.toLowerCase()}:</span>
                            <span className="underline-offset-4 group-hover:underline">
                                {socialHandle(network, url)}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        );
    }

    if (variant === "tiles") {
        return (
            <ul className={cn("grid gap-2", className)}>
                {entries.map(({ network, url, meta }) => (
                    <li key={network}>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer me"
                            aria-label={`${ownerName} on ${meta.label}`}
                            className="group flex items-center gap-3 rounded-2xl border border-border-color bg-white/60 p-2.5 pr-3 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-dark-border-color dark:bg-slate-900/40"
                        >
                            <span
                                className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm",
                                    meta.solid,
                                )}
                            >
                                <SocialIcon network={network} className="h-[18px] w-[18px]" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-slate-900 dark:text-white">
                                    {meta.label}
                                </span>
                                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                                    {socialHandle(network, url)}
                                </span>
                            </span>
                            <ArrowUpRight
                                className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-900 dark:group-hover:text-white"
                                aria-hidden="true"
                            />
                        </a>
                    </li>
                ))}
            </ul>
        );
    }

    if (variant === "pills") {
        return (
            <ul className={cn("flex flex-wrap gap-2", className)}>
                {entries.map(({ network, url, meta }) => (
                    <li key={network}>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer me"
                            aria-label={`${ownerName} on ${meta.label}`}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-full border border-border-color bg-white/70 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-dark-border-color dark:bg-slate-900/60 dark:text-slate-200",
                                meta.hover,
                            )}
                        >
                            <SocialIcon network={network} className="h-3.5 w-3.5" />
                            {meta.label}
                        </a>
                    </li>
                ))}
            </ul>
        );
    }

    const box = size === "sm" ? "h-8 w-8 rounded-lg" : "h-11 w-11 rounded-xl";
    const glyph = size === "sm" ? "h-3.5 w-3.5" : "h-[18px] w-[18px]";

    return (
        <ul className={cn("flex flex-wrap items-center gap-2", className)}>
            {entries.map(({ network, url, meta }) => (
                <li key={network}>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        aria-label={`${ownerName} on ${meta.label}`}
                        title={meta.label}
                        className={cn(
                            "inline-flex items-center justify-center transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            box,
                            solid
                                ? cn(meta.solid, "shadow-md hover:shadow-lg")
                                : cn(
                                      "border border-border-color bg-white/70 text-slate-600 dark:border-dark-border-color dark:bg-slate-900/60 dark:text-slate-300",
                                      meta.hover,
                                  ),
                        )}
                    >
                        <SocialIcon network={network} className={glyph} />
                    </a>
                </li>
            ))}
        </ul>
    );
}
