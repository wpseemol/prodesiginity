"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import styles from "./hero.module.css";
import { useHeroScene } from "./useHeroScene";
import { HERO_HEADLINE_LINES, HERO_STATS } from "./heroData";

/**
 * Homepage hero: headline copy on the left, an interactive WebGL box on the
 * right whose four faces each carry a service, plus a proof strip underneath.
 *
 * The section renders fully visible in the server HTML and GSAP hides it again
 * in a layout effect before first paint. That ordering matters: if the intro
 * ever fails to run — no GSAP, a thrown error, JS disabled — the copy is still
 * on the page and still indexable, rather than stuck at opacity 0.
 */

// Anchors on the homepage. `#pricing` is PricingSection; the second points at
// the recent-projects heading. Swap these if the section ids ever move.
const PRIMARY_HREF = "/#pricing";
const SECONDARY_HREF = "/#recent-projects-heading";

function Star() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.4l7-.9z" />
        </svg>
    );
}

export default function HeroSection() {
    const rootRef = useRef<HTMLElement | null>(null);
    const hintRef = useRef<HTMLSpanElement | null>(null);

    // Called before useGSAP so the scene is live when the timeline is built.
    const { stageRef, canvasRef, sceneRef, face, hintHidden } = useHeroScene();

    // The hint stays mounted and fades: unmounting it mid-intro would leave
    // GSAP tweening a detached node, and the disappearance would be abrupt.
    useEffect(() => {
        const hint = hintRef.current;
        if (!hint || !hintHidden) return;
        hint.setAttribute("aria-hidden", "true");
        hint.style.pointerEvents = "none";
        gsap.to(hint, { opacity: 0, y: -8, duration: 0.4 });
    }, [hintHidden]);

    useGSAP(
        () => {
            const root = rootRef.current;
            if (!root) return;

            const scene = sceneRef.current;

            // Queried off the section rather than with gsap.utils.toArray:
            // useGSAP's scope only narrows selector *strings* handed to gsap
            // methods, so a bare toArray would reach into the whole document.
            const q = (sel: string) =>
                Array.from(root.querySelectorAll<HTMLElement>(sel));

            const lines = q(`.${styles.line} > span`);
            const reveals = q("[data-reveal]");
            const chrome = q("[data-chrome]");
            const counters = q("[data-count]");
            const grid = root.querySelector<HTMLElement>(`.${styles.bgGrid}`);

            const countUp = (el: HTMLElement) => {
                const target = parseFloat(el.dataset.count ?? "0");
                const dec = (el.dataset.count ?? "").includes(".") ? 1 : 0;
                const pre = el.dataset.prefix ?? "";
                const suf = el.dataset.suffix ?? "";
                const o = { v: 0 };
                return gsap.to(o, {
                    v: target,
                    duration: 1.5,
                    ease: "power2.out",
                    onUpdate() {
                        el.textContent = pre + o.v.toFixed(dec) + suf;
                    },
                });
            };

            const mm = gsap.matchMedia();

            mm.add(
                {
                    motion: "(prefers-reduced-motion: no-preference)",
                    still: "(prefers-reduced-motion: reduce)",
                },
                (ctx) => {
                    // Nothing to animate: the markup already shows final values.
                    if (!ctx.conditions?.motion) {
                        scene?.startTour();
                        return;
                    }

                    gsap.set(lines, { yPercent: 118 });
                    gsap.set([...reveals, ...chrome], { opacity: 0, y: 18 });
                    if (grid) gsap.set(grid, { opacity: 0 });

                    const tl = gsap.timeline({
                        defaults: { ease: "power3.out" },
                        delay: 0.15,
                        onComplete: () => scene?.startTour(),
                    });

                    if (grid) {
                        tl.to(grid, { opacity: 0.85, duration: 1.2 }, 0);
                    }

                    tl.to(
                        lines,
                        { yPercent: 0, duration: 1.05, stagger: 0.09 },
                        0.1,
                    )
                        .to(
                            reveals,
                            { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 },
                            0.55,
                        )
                        .to(
                            chrome,
                            { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
                            1.1,
                        );

                    if (scene) {
                        tl.from(
                            scene.group.scale,
                            {
                                x: 0.72,
                                y: 0.72,
                                z: 0.72,
                                duration: 1.5,
                                ease: "expo.out",
                            },
                            0.15,
                        )
                            .fromTo(
                                scene.spin,
                                { y: -1.15 },
                                {
                                    y: 0,
                                    duration: 1.7,
                                    ease: "expo.out",
                                    // Keep the spring's target with the tween so
                                    // the two models never fight on hand-off.
                                    onUpdate() {
                                        scene.spin.targetY = scene.spin.y;
                                    },
                                },
                                0.15,
                            )
                            .from(
                                scene.ring.scale,
                                {
                                    x: 0.45,
                                    y: 0.45,
                                    z: 0.45,
                                    duration: 1.4,
                                    ease: "expo.out",
                                },
                                0.5,
                            )
                            .from(
                                scene.dust.material as { opacity: number },
                                { opacity: 0, duration: 1.2 },
                                0.6,
                            );
                    }

                    counters.forEach((el) => tl.add(countUp(el), 0.95));
                },
            );

            return () => mm.revert();
        },
        { scope: rootRef },
    );

    return (
        <section ref={rootRef} className={`${styles.hero} font-sans`}>
            <div className={styles.bg} aria-hidden="true">
                <div className={styles.bgGrid} />
                <div className={styles.bgGlow} />
                <div className={`${styles.bgGlow} ${styles.bgGlow2}`} />
            </div>

            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <div className={styles.inner}>
                    <div className={styles.copy}>
                        <span className={styles.pill} data-reveal>
                            <span
                                className={styles.pillStars}
                                aria-hidden="true"
                            >
                                <Star />
                                <Star />
                                <Star />
                                <Star />
                                <Star />
                            </span>
                            Rated <b>4.8</b> by 300+ store owners
                        </span>

                        <h1 className={styles.headline}>
                            {HERO_HEADLINE_LINES.map((line) => (
                                <span className={styles.line} key={line}>
                                    <span>{line}</span>
                                </span>
                            ))}
                        </h1>

                        <p className={styles.lede} data-reveal>
                            Listings, creative, ads and SEO across Amazon,
                            Shopify, Meta, Google and TikTok — handled by one
                            team on a single monthly retainer, so you can stay
                            on the product.
                        </p>

                        <div className={styles.actions} data-reveal>
                            <Link
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                href={PRIMARY_HREF}
                            >
                                Get Started
                            </Link>
                            <Link
                                className={`${styles.btn} ${styles.btnGhost}`}
                                href={SECONDARY_HREF}
                            >
                                See our work
                            </Link>
                        </div>
                    </div>

                    <div className={styles.stage} ref={stageRef}>
                        <canvas
                            ref={canvasRef}
                            tabIndex={0}
                            role="img"
                            aria-label="A 3D carton with one service printed on each side. It turns on its own; drag it or use the arrow keys to control it."
                        />

                        {/* <span className={styles.hint} data-chrome ref={hintRef}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M8.5 6v9m0 0l-3-3m3 3l3-3" />
                                <path d="M4 18.5h16" />
                            </svg>
                            Drag the box to steer it
                        </span> */}

                        <div
                            className={styles.readout}
                            data-chrome
                            aria-live="polite"
                        >
                            <span className={styles.readoutDot}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M4 12.5l5 5L20 6.5" />
                                </svg>
                            </span>
                            {/* Keyed so React remounts the text and the CSS
                                fade replays on every quarter turn. */}
                            <span
                                key={face.slot}
                                className={styles.readoutSwap}
                            >
                                <span className={styles.readoutName}>
                                    {face.name}
                                </span>
                                <span className={styles.readoutNote}>
                                    {face.note}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.proof}>
                    {HERO_STATS.map((stat) => (
                        <div
                            className={styles.proofItem}
                            data-reveal
                            key={stat.label}
                        >
                            <div
                                className={styles.proofNum}
                                data-count={stat.value}
                                data-prefix={stat.prefix}
                                data-suffix={stat.suffix}
                            >
                                {`${stat.prefix ?? ""}${stat.value}${stat.suffix ?? ""}`}
                            </div>
                            <div className={styles.proofLabel}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
