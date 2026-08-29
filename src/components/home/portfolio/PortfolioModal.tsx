"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { X, Wrench, Building2 } from "lucide-react";
import { ACCENTS } from "./portfolioTheme";
import { SectionHeading, ChipRow } from "./shared";
import { VideoMedia, VideoBody } from "./PlayerViews";
import {
    WebDevMedia,
    WebDevBody,
    ShopifyMedia,
    ShopifyBody,
    WebAppMedia,
    WebAppBody,
} from "./LiveViews";
import {
    PackagingMedia,
    PackagingBody,
    AmazonMedia,
    AmazonBody,
    Product3DMedia,
    Product3DBody,
    MarketingMedia,
    MarketingBody,
} from "./GalleryViews";
import { SeoMedia, SeoBody } from "./ReportViews";
import type { PortfolioItem } from "@/data/portfolioData";

/* Nine disciplines, nine media panels, nine bodies. The shell below is the
   only thing they share — header, title block, tools, close behaviour. */

function Media({ item }: { item: PortfolioItem }) {
    switch (item.kind) {
        case "video":
            return <VideoMedia item={item} />;
        case "webdev":
            return <WebDevMedia item={item} />;
        case "shopify":
            return <ShopifyMedia item={item} />;
        case "webapp":
            return <WebAppMedia item={item} />;
        case "packaging":
            return <PackagingMedia item={item} />;
        case "amazon":
            return <AmazonMedia item={item} />;
        case "product3d":
            return <Product3DMedia item={item} />;
        case "marketing":
            return <MarketingMedia item={item} />;
        case "seo":
            return <SeoMedia item={item} />;
        default:
            return null;
    }
}

function Body({ item }: { item: PortfolioItem }) {
    switch (item.kind) {
        case "video":
            return <VideoBody item={item} />;
        case "webdev":
            return <WebDevBody item={item} />;
        case "shopify":
            return <ShopifyBody item={item} />;
        case "webapp":
            return <WebAppBody item={item} />;
        case "packaging":
            return <PackagingBody item={item} />;
        case "amazon":
            return <AmazonBody item={item} />;
        case "product3d":
            return <Product3DBody item={item} />;
        case "marketing":
            return <MarketingBody item={item} />;
        case "seo":
            return <SeoBody item={item} />;
        default:
            return null;
    }
}

interface PortfolioModalProps {
    item: PortfolioItem | null;
    onClose: () => void;
}

export default function PortfolioModal({ item, onClose }: PortfolioModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const modalBoxRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (item) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", onKeyDown);
            closeBtnRef.current?.focus();
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [item, onClose]);

    useGSAP(
        () => {
            if (!item || !backdropRef.current || !modalBoxRef.current) return;

            const tl = gsap.timeline();

            tl.fromTo(
                backdropRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: "power2.out" },
            ).fromTo(
                modalBoxRef.current,
                { opacity: 0, scale: 0.9, y: 36 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.45,
                    ease: "back.out(1.4)",
                },
                "-=0.15",
            );

            if (contentRef.current) {
                tl.fromTo(
                    contentRef.current.children,
                    { opacity: 0, y: 15 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.35,
                        stagger: 0.05,
                        ease: "power2.out",
                    },
                    "-=0.2",
                );
            }
        },
        { dependencies: [item], scope: containerRef },
    );

    const handleClose = () => {
        if (!modalBoxRef.current || !backdropRef.current) return onClose();

        gsap.timeline({ onComplete: onClose })
            .to(modalBoxRef.current, {
                opacity: 0,
                scale: 0.92,
                y: 24,
                duration: 0.25,
                ease: "power3.in",
            })
            .to(
                backdropRef.current,
                { opacity: 0, duration: 0.2, ease: "power2.in" },
                "-=0.1",
            );
    };

    if (!item) return null;

    const accent = ACCENTS[item.accent];

    return (
        <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8"
        >
            <div
                ref={backdropRef}
                onClick={handleClose}
                className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />

            <div
                ref={modalBoxRef}
                className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0c101c] rounded-3xl border border-border-color dark:border-dark-border-color shadow-2xl z-10 flex flex-col overflow-x-hidden overflow-y-auto"
            >
                {/* Accent edge, matching the card that opened it */}
                <span
                    className={`sticky top-0 z-40 block h-1 shrink-0 bg-linear-to-r ${accent.edge}`}
                />

                <div className="sticky top-1 z-30 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-[#0c101c]/90 backdrop-blur-xl border-b border-border-color dark:border-dark-border-color">
                    <span className="flex items-center gap-2 min-w-0">
                        <span
                            className={`w-2 h-2 rounded-full ${accent.solid} animate-pulse motion-reduce:animate-none shrink-0`}
                        />
                        <span
                            className={`text-xs font-bold uppercase tracking-widest ${accent.text} truncate`}
                        >
                            {item.category}
                        </span>
                    </span>

                    <button
                        ref={closeBtnRef}
                        type="button"
                        onClick={handleClose}
                        aria-label="Close"
                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Media — one of nine */}
                <Media item={item} />

                {/* Body */}
                <div ref={contentRef} className="p-6 sm:p-8 lg:p-10 space-y-8">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`px-3 py-1 rounded-md ${accent.soft} border ${accent.text} text-[11px] font-black tracking-wider uppercase`}
                            >
                                {item.badge}
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                                <Building2 className="w-3 h-3" />
                                {item.industry}
                            </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug text-balance">
                            {item.title}
                        </h3>

                        <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400">
                            {item.subtitle}
                        </p>
                    </div>

                    <Body item={item} />

                    {/* Tools — the one thing every discipline shares */}
                    <div className="space-y-2.5">
                        <SectionHeading icon={Wrench}>
                            Tools used
                        </SectionHeading>
                        <ChipRow items={item.tools} />
                    </div>
                </div>
            </div>
        </div>
    );
}
