"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

import { createHeroScene, type HeroSceneHandle } from "./heroScene";
import { HERO_SIDES, type HeroSide } from "./heroData";

/** useLayoutEffect warns during SSR; fall back to useEffect on the server. */
const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Owns the lifecycle of the WebGL hero: builds it, keeps its palette in step
 * with next-themes, repaints its canvas text when the webfont lands, and tears
 * the whole thing down on unmount.
 *
 * Built in a layout effect on purpose. Call this hook *before* the component's
 * useGSAP so the scene exists by the time the intro timeline is assembled, and
 * the box can be tweened in alongside the copy rather than a beat behind it.
 */
export function useHeroScene() {
    const stageRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const sceneRef = useRef<HeroSceneHandle | null>(null);

    const { resolvedTheme } = useTheme();
    const [face, setFace] = useState<HeroSide>(HERO_SIDES[0]);
    const [hintHidden, setHintHidden] = useState(false);

    useIsomorphicLayoutEffect(() => {
        const canvas = canvasRef.current;
        const stage = stageRef.current;
        if (!canvas || !stage) return;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        // Read the theme off the DOM rather than from next-themes: its inline
        // script has already set the class before hydration, whereas
        // `resolvedTheme` is still undefined on the first client render.
        const theme = document.documentElement.classList.contains("dark")
            ? "dark"
            : "light";

        // Whatever font the site actually resolves to, the canvas uses the same
        // one — no hardcoded family to drift out of sync with layout.tsx.
        const fontFamily =
            getComputedStyle(stage).fontFamily ||
            "ui-sans-serif, system-ui, Arial, sans-serif";

        let scene: HeroSceneHandle | null = null;
        try {
            scene = createHeroScene({
                canvas,
                holder: stage,
                theme,
                fontFamily,
                reducedMotion,
                onFaceChange: setFace,
                onFirstInteract: () => setHintHidden(true),
            });
        } catch (err) {
            // A dead GPU or a blocked context must not take the copy with it.
            console.warn("hero 3D stage unavailable:", err);
        }

        sceneRef.current = scene;

        // Canvas text is rasterised, so it has to be redrawn once the real
        // webfont replaces the fallback it was first painted with.
        if (scene && document.fonts?.ready) {
            document.fonts.ready.then(() => sceneRef.current?.repaint());
        }

        return () => {
            scene?.dispose();
            sceneRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!resolvedTheme) return;
        sceneRef.current?.applyTheme(
            resolvedTheme === "light" ? "light" : "dark",
        );
    }, [resolvedTheme]);

    return { stageRef, canvasRef, sceneRef, face, hintHidden };
}
