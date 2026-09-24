"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Soft page-switch animation for App Router navigations.
 * Layout stays mounted; only the page body fades/slides in on pathname change.
 */
export default function PageTransition({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const container = useRef<HTMLDivElement>(null);
    const isFirstPaint = useRef(true);

    useEffect(() => {
        const el = container.current;
        if (!el) return;

        const reduceMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Jump to top on every route change (instant — animation handles polish).
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });

        // First paint: show content immediately (avoid opacity-0 flash / SEO blank).
        if (isFirstPaint.current) {
            isFirstPaint.current = false;
            gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
            return;
        }

        if (reduceMotion) {
            gsap.set(el, { opacity: 1, y: 0 });
            return;
        }

        const ctx = gsap.context(() => {
            gsap.fromTo(
                el,
                { opacity: 0, y: 18 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.55,
                    ease: "power3.out",
                    clearProps: "transform",
                },
            );
        }, el);

        return () => {
            ctx.revert();
        };
    }, [pathname]);

    return (
        <div ref={container} className="w-full" data-page={pathname}>
            {children}
        </div>
    );
}
