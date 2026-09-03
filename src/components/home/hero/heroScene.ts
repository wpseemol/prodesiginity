import * as THREE from "three";

import {
    FRONT_OF,
    HERO_CHANNELS,
    HERO_SIDES,
    type HeroSide,
} from "./heroData";

/**
 * The WebGL half of the hero, kept deliberately free of React.
 *
 * `createHeroScene` builds the box, the orbit ring, the dust and the contact
 * shadow, then owns its own animation loop. React only calls in through the
 * handle it returns: `applyTheme` on a theme flip, `playIntro` once GSAP is
 * ready, and `dispose` on unmount.
 */

const HALF = Math.PI / 2;
const FLOOR_Y = -2.18;

/**
 * Light-intensity gain.
 *
 * The palette intensities below were tuned against three.js' legacy lighting
 * mode, where the renderer quietly multiplied every light by PI to cancel the
 * 1/PI in the Lambert BRDF. r155 dropped that multiplier and r165 removed the
 * `useLegacyLights` escape hatch altogether, so on three 0.180 the same numbers
 * land ~3.14x too dim: a #FFFFFF face was resolving to a flat mid-grey, which
 * made the box read as "dark" in *both* themes.
 *
 * Reapplying PI restores exactly the brightness these values were written for.
 * Dial it down if you ever want the faces to sit softer than pure white.
 */
const LIGHT_GAIN = Math.PI;

/** Auto-tour timings, in milliseconds. */
const TOUR = { dwell: 1250, resume: 2400 };

interface Palette {
    face: string;
    faceAlt: string;
    text: string;
    soft: string;
    rule: string;
    violet: string;
    edge: number;
    edgeOp: number;
    ring: number;
    ringOp: number;
    dust: number;
    dustOp: number;
    hemi: number;
    ground: number;
    hemiI: number;
    keyI: number;
    rimI: number;
    shadow: number;
    blob: number;
    blobOp: number;
    blobAdd: boolean;
}

/**
 * Mirrors the CSS custom properties in hero.module.css. The two are kept in
 * step by hand: canvas pixels cannot read CSS variables.
 */
const PALETTE: Record<"light" | "dark", Palette> = {
    light: {
        face: "#FFFFFF",
        faceAlt: "#F4F5FC",
        text: "#0F1121",
        soft: "#8A90AA",
        rule: "#E7E9F5",
        violet: "#5B4FE9",
        edge: 0x5b4fe9,
        edgeOp: 0.26,
        ring: 0x5b4fe9,
        ringOp: 0.34,
        dust: 0x6b5ff0,
        dustOp: 0.5,
        hemi: 0xffffff,
        ground: 0xd9dcf5,
        hemiI: 0.85,
        keyI: 1.05,
        rimI: 0.75,
        shadow: 0.2,
        blob: 0x1c1f45,
        blobOp: 0.3,
        blobAdd: false,
    },
    dark: {
        face: "#171933",
        faceAlt: "#101227",
        text: "#F2F3FF",
        soft: "#8E95BC",
        rule: "#2E3155",
        violet: "#8A7BFF",
        edge: 0x8a7bff,
        edgeOp: 0.42,
        ring: 0x8a7bff,
        ringOp: 0.45,
        dust: 0x9f93ff,
        dustOp: 0.62,
        hemi: 0x9aa2d8,
        ground: 0x0a0b18,
        hemiI: 0.55,
        keyI: 0.85,
        rimI: 1.25,
        shadow: 0.38,
        blob: 0x6a5be0,
        blobOp: 0.34,
        blobAdd: true,
    },
};

export interface HeroSceneOptions {
    canvas: HTMLCanvasElement;
    holder: HTMLElement;
    theme: "light" | "dark";
    /** Resolved CSS font stack, so canvas text matches the rest of the site. */
    fontFamily: string;
    reducedMotion: boolean;
    /** Optional logo drawn on the lid; falls back to a drawn wordmark. */
    logoSrc?: string;
    logoSrcDark?: string;
    /** Fires when the face pointing at the camera changes. */
    onFaceChange?: (side: HeroSide) => void;
    /** Fires the first time the visitor drags or arrow-keys the box. */
    onFirstInteract?: () => void;
}

export interface HeroSceneHandle {
    /** Shared rotation model — GSAP tweens `spin.y` during the intro. */
    spin: { y: number; x: number; targetY: number; vel: number; sv: number };
    group: THREE.Group;
    ring: THREE.Group;
    dust: THREE.Points;
    applyTheme: (theme: "light" | "dark") => void;
    /** Repaints canvas textures once webfonts have actually loaded. */
    repaint: () => void;
    /** Releases the auto-tour; call when the intro timeline finishes. */
    startTour: () => void;
    dispose: () => void;
}

/** sRGB tagging that works across three.js releases old and new. */
function tagColorSpace(texture: THREE.Texture) {
    const t = texture as unknown as Record<string, unknown>;
    const three = THREE as unknown as Record<string, unknown>;
    if ("colorSpace" in t) t.colorSpace = three.SRGBColorSpace ?? "srgb";
    else if ("encoding" in t) t.encoding = three.sRGBEncoding;
}

/** Greedy word wrap for canvas text; returns the y of the last line drawn. */
function wrapText(
    g: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    max: number,
    lineHeight: number,
): number {
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (g.measureText(test).width > max && line) {
            g.fillText(line, x, y);
            y += lineHeight;
            line = word;
        } else {
            line = test;
        }
    }
    g.fillText(line, x, y);
    return y;
}

export function createHeroScene(
    options: HeroSceneOptions,
): HeroSceneHandle | null {
    const {
        canvas,
        holder,
        fontFamily,
        reducedMotion,
        logoSrc,
        logoSrcDark,
        onFaceChange,
        onFirstInteract,
    } = options;

    let theme = options.theme;
    const font = (weight: number, size: number) =>
        `${weight} ${size}px ${fontFamily}`;

    /* ------------------------------------------------------------------
       Textures
       ------------------------------------------------------------------ */

    const logoImg: { light: HTMLImageElement | null; dark: HTMLImageElement | null } =
        { light: null, dark: null };

    function faceTexture(side: HeroSide, p: Palette) {
        const c = document.createElement("canvas");
        c.width = c.height = 512;
        const g = c.getContext("2d")!;

        g.fillStyle = p.face;
        g.fillRect(0, 0, 512, 512);

        g.strokeStyle = p.rule;
        g.lineWidth = 3;
        g.strokeRect(38, 38, 436, 436);

        // check badge
        g.fillStyle = p.violet;
        g.beginPath();
        g.arc(90, 120, 26, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = p.face;
        g.lineWidth = 7;
        g.lineCap = "round";
        g.lineJoin = "round";
        g.beginPath();
        g.moveTo(77, 120);
        g.lineTo(87, 131);
        g.lineTo(105, 108);
        g.stroke();

        g.fillStyle = p.text;
        g.font = font(800, 46);
        const endY = wrapText(g, side.name, 70, 212, 372, 54);

        g.fillStyle = p.soft;
        g.font = font(500, 26);
        wrapText(g, side.note, 70, endY + 48, 372, 34);

        g.strokeStyle = p.rule;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(70, 404);
        g.lineTo(442, 404);
        g.stroke();

        g.fillStyle = p.soft;
        g.font = font(600, 24);
        g.fillText("prodesignity", 70, 444);

        const t = new THREE.CanvasTexture(c);
        t.anisotropy = 4;
        tagColorSpace(t);
        return t;
    }

    /** Placeholder wordmark, used until a real logo file is supplied. */
    function drawMark(g: CanvasRenderingContext2D, p: Palette, cx: number, cy: number) {
        const S = 132;
        const r = 38;
        const x = cx - S / 2;
        const y = cy - S / 2 - 34;

        const grad = g.createLinearGradient(x, y, x + S, y + S);
        grad.addColorStop(0, p.violet);
        grad.addColorStop(1, "#9A8DFF");

        g.beginPath();
        g.moveTo(x + r, y);
        g.arcTo(x + S, y, x + S, y + S, r);
        g.arcTo(x + S, y + S, x, y + S, r);
        g.arcTo(x, y + S, x, y, r);
        g.arcTo(x, y, x + S, y, r);
        g.closePath();
        g.fillStyle = grad;
        g.fill();

        g.fillStyle = "#fff";
        g.font = font(800, 78);
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("P", cx, y + S / 2 + 4);

        g.fillStyle = p.text;
        g.font = font(800, 46);
        g.fillText("prodesignity", cx, cy + 92);

        g.textAlign = "start";
        g.textBaseline = "alphabetic";
    }

    /** Top and bottom faces; `flip` makes the underside read the right way up. */
    function logoTexture(p: Palette, flip: boolean) {
        const c = document.createElement("canvas");
        c.width = c.height = 512;
        const g = c.getContext("2d")!;

        g.fillStyle = p.faceAlt;
        g.fillRect(0, 0, 512, 512);
        g.strokeStyle = p.rule;
        g.lineWidth = 3;
        g.strokeRect(38, 38, 436, 436);

        if (flip) {
            g.translate(512, 512);
            g.rotate(Math.PI);
        }

        const img = logoImg[theme === "dark" ? "dark" : "light"];
        if (img && img.width) {
            const maxW = 300;
            const maxH = 180;
            const k = Math.min(maxW / img.width, maxH / img.height);
            const w = img.width * k;
            const h = img.height * k;
            g.drawImage(img, (512 - w) / 2, (512 - h) / 2, w, h);
        } else {
            drawMark(g, p, 256, 256);
        }

        const t = new THREE.CanvasTexture(c);
        t.anisotropy = 4;
        tagColorSpace(t);
        return t;
    }

    /** Soft elliptical falloff: dense core, long tail, nothing at the edge. */
    function blobTexture() {
        const c = document.createElement("canvas");
        c.width = c.height = 256;
        const g = c.getContext("2d")!;
        const grad = g.createRadialGradient(128, 128, 4, 128, 128, 124);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.28, "rgba(255,255,255,.82)");
        grad.addColorStop(0.55, "rgba(255,255,255,.34)");
        grad.addColorStop(0.78, "rgba(255,255,255,.09)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 256, 256);
        const t = new THREE.CanvasTexture(c);
        tagColorSpace(t);
        return t;
    }

    /** A small card drawn to canvas that rides the orbit as a billboard. */
    function chipTexture(text: string, p: Palette) {
        const W = 512;
        const H = 160;
        const r = 62;
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        const g = c.getContext("2d")!;

        g.beginPath();
        g.moveTo(8 + r, 8);
        g.arcTo(W - 8, 8, W - 8, H - 8, r);
        g.arcTo(W - 8, H - 8, 8, H - 8, r);
        g.arcTo(8, H - 8, 8, 8, r);
        g.arcTo(8, 8, W - 8, 8, r);
        g.closePath();
        g.fillStyle = p.face;
        g.fill();
        g.strokeStyle = p.rule;
        g.lineWidth = 4;
        g.stroke();

        g.fillStyle = p.violet;
        g.beginPath();
        g.arc(62, H / 2, 15, 0, Math.PI * 2);
        g.fill();

        g.fillStyle = p.text;
        g.font = font(700, 52);
        g.textBaseline = "middle";
        g.fillText(text, 100, H / 2 + 2);

        const t = new THREE.CanvasTexture(c);
        t.anisotropy = 4;
        tagColorSpace(t);
        return t;
    }

    /* ------------------------------------------------------------------
       Scene
       ------------------------------------------------------------------ */

    let renderer: THREE.WebGLRenderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        });
    } catch {
        // No WebGL context (old browser, blocked GPU): the copy still renders.
        return null;
    }

    const p0 = PALETTE[theme];

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // With LIGHT_GAIN restored, a #FFFFFF face sits slightly above 1.0. Without
    // tone mapping that hard-clips and the lit faces merge into one flat white
    // silhouette. Neutral rolls the highlights off while leaving hue alone, so
    // the box keeps its face-to-face shading and still reads as white paper.
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    {
        const r = renderer as unknown as Record<string, unknown>;
        const three = THREE as unknown as Record<string, unknown>;
        if ("outputColorSpace" in r) r.outputColorSpace = three.SRGBColorSpace;
        else if ("outputEncoding" in r) r.outputEncoding = three.sRGBEncoding;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.5, 8.6);

    const hemi = new THREE.HemisphereLight(
        p0.hemi,
        p0.ground,
        p0.hemiI * LIGHT_GAIN,
    );
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, p0.keyI * LIGHT_GAIN);
    // Kept overhead so the shadow sits under the box, not flung out sideways.
    key.position.set(2.4, 8.6, 3.8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 22;
    key.shadow.camera.left = -4.6;
    key.shadow.camera.right = 4.6;
    key.shadow.camera.top = 4.6;
    key.shadow.camera.bottom = -4.6;
    key.shadow.bias = -0.0012;
    key.shadow.normalBias = 0.02;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x8b7bff, p0.rimI * LIGHT_GAIN);
    rim.position.set(-6, 2, -4);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    const materials = [0, 1, 2, 3, 4, 5].map(
        () => new THREE.MeshStandardMaterial({ roughness: 0.72, metalness: 0 }),
    );

    function paintBox(p: Palette) {
        HERO_SIDES.forEach((s) => {
            materials[s.slot].map?.dispose();
            materials[s.slot].map = faceTexture(s, p);
            materials[s.slot].needsUpdate = true;
        });
        materials[2].map?.dispose();
        materials[2].map = logoTexture(p, false); // up
        materials[2].needsUpdate = true;
        materials[3].map?.dispose();
        materials[3].map = logoTexture(p, true); // down
        materials[3].needsUpdate = true;
    }

    paintBox(p0);

    const boxGeometry = new THREE.BoxGeometry(2.15, 2.15, 2.15);
    const box = new THREE.Mesh(boxGeometry, materials);
    box.castShadow = true;
    group.add(box);

    const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
        color: p0.edge,
        transparent: true,
        opacity: p0.edgeOp,
    });
    box.add(new THREE.LineSegments(edgesGeometry, edgesMaterial));

    // Orbit: one rigid ring, chips pinned to it, scale handled by the wrapper.
    const ringWrap = new THREE.Group();
    const ring = new THREE.Group();
    ring.rotation.set(1.16, 0, 0.34);

    const torusGeometry = new THREE.TorusGeometry(3.1, 0.009, 8, 160);
    const torusMaterial = new THREE.MeshBasicMaterial({
        color: p0.ring,
        transparent: true,
        opacity: p0.ringOp,
    });
    ring.add(new THREE.Mesh(torusGeometry, torusMaterial));

    const orbiters: THREE.Sprite[] = [];
    const R = 3.1;
    HERO_CHANNELS.forEach((label, i) => {
        const a = (i / HERO_CHANNELS.length) * Math.PI * 2;
        const chip = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: chipTexture(label, p0),
                transparent: true,
                depthWrite: false,
            }),
        );
        chip.userData.label = label;
        chip.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
        chip.scale.set(1.34, 0.42, 1);
        chip.center.set(0.5, 0.5);
        ring.add(chip);
        orbiters.push(chip);
    });

    ringWrap.add(ring);
    group.add(ringWrap);

    // Dust
    const DUST_COUNT = 130;
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
        const r = 3.3 + Math.random() * 2.4;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        dustPositions[i * 3] = r * Math.sin(ph) * Math.cos(th);
        dustPositions[i * 3 + 1] = r * Math.cos(ph) * 0.55;
        dustPositions[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(dustPositions, 3),
    );
    const dustMaterial = new THREE.PointsMaterial({
        size: 0.045,
        color: p0.dust,
        transparent: true,
        opacity: p0.dustOp,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    group.add(dust);

    // The cast shadow: the defined core.
    const floorGeometry = new THREE.PlaneGeometry(14, 14);
    const floorMaterial = new THREE.ShadowMaterial({ opacity: p0.shadow });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -HALF;
    floor.position.y = FLOOR_Y;
    floor.receiveShadow = true;
    scene.add(floor);

    // The contact blob: the soft penumbra that breathes with the box.
    const blobGeometry = new THREE.PlaneGeometry(1, 1);
    const blobMap = blobTexture();
    const blobMaterial = new THREE.MeshBasicMaterial({
        map: blobMap,
        transparent: true,
        opacity: p0.blobOp,
        color: p0.blob,
        depthWrite: false,
        blending: p0.blobAdd ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const blob = new THREE.Mesh(blobGeometry, blobMaterial);
    blob.rotation.x = -HALF;
    blob.position.set(-0.34, FLOOR_Y + 0.012, 0.26);
    blob.renderOrder = -1;
    scene.add(blob);

    /* ------------------------------------------------------------------
       Theme
       ------------------------------------------------------------------ */

    function paintChips(p: Palette) {
        orbiters.forEach((o) => {
            o.material.map?.dispose();
            o.material.map = chipTexture(o.userData.label as string, p);
            o.material.needsUpdate = true;
        });
    }

    function applyTheme(next: "light" | "dark") {
        theme = next;
        const p = PALETTE[next];
        paintBox(p);
        paintChips(p);
        edgesMaterial.color.setHex(p.edge);
        edgesMaterial.opacity = p.edgeOp;
        torusMaterial.color.setHex(p.ring);
        torusMaterial.opacity = p.ringOp;
        dustMaterial.color.setHex(p.dust);
        dustMaterial.opacity = p.dustOp;
        hemi.color.setHex(p.hemi);
        hemi.groundColor.setHex(p.ground);
        hemi.intensity = p.hemiI * LIGHT_GAIN;
        key.intensity = p.keyI * LIGHT_GAIN;
        rim.intensity = p.rimI * LIGHT_GAIN;
        floorMaterial.opacity = p.shadow;
        blobMaterial.color.setHex(p.blob);
        blobMaterial.opacity = p.blobOp;
        blobMaterial.blending = p.blobAdd
            ? THREE.AdditiveBlending
            : THREE.NormalBlending;
        blobMaterial.needsUpdate = true;
        if (reducedMotion) renderer.render(scene, camera);
    }

    function loadLogo(which: "light" | "dark", src?: string) {
        if (!src) return;
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => {
            logoImg[which] = im;
            paintBox(PALETTE[theme]);
        };
        im.onerror = () => console.warn("hero logo failed to load:", src);
        im.src = src;
    }
    loadLogo("light", logoSrc);
    loadLogo("dark", logoSrcDark || logoSrc);

    /* ------------------------------------------------------------------
       Sizing
       ------------------------------------------------------------------ */

    function resize() {
        const w = holder.clientWidth;
        const h = holder.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Wider lens and a step back on narrow screens so the box never crops.
        camera.fov = w < 480 ? 46 : w < 768 ? 41 : 34;
        camera.position.z = w < 480 ? 9.4 : w < 768 ? 9.0 : 8.6;
        camera.updateProjectionMatrix();

        // The orbit tucks in on small screens so the chips never sail off
        // canvas, and drops to a bare ring where the type would be unreadable.
        ringWrap.scale.setScalar(w < 560 ? 0.74 : w < 900 ? 0.86 : 1);
        orbiters.forEach((o) => {
            o.visible = w >= 560;
        });
    }

    /* ------------------------------------------------------------------
       Motion model — auto tour, drag, throw, snap
       ------------------------------------------------------------------ */

    const spin = { y: 0, x: 0, targetY: 0, vel: 0, sv: 0 };
    const par = { x: 0, y: 0, tx: 0, ty: 0 };

    let dragging = false;
    let hovering = false;
    let introDone = false;
    let hoverLift = 0;
    let nextTurnAt = performance.now() + 2100;
    let resumeAt = 0;
    let lastX = 0;
    let lastY = 0;
    let lastFace = -1;
    let interacted = false;

    const snapTo = (v: number) => Math.round(v / HALF) * HALF;
    const pauseTour = (ms?: number) => {
        resumeAt = performance.now() + (ms ?? TOUR.resume);
    };
    const markInteracted = () => {
        if (interacted) return;
        interacted = true;
        onFirstInteract?.();
    };

    const ac = new AbortController();
    const on = <K extends keyof HTMLElementEventMap>(
        el: HTMLElement | Window,
        type: K | string,
        fn: (e: never) => void,
    ) =>
        el.addEventListener(type, fn as EventListener, { signal: ac.signal });

    on(holder, "pointermove", (e: PointerEvent) => {
        const r = holder.getBoundingClientRect();
        par.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        par.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    on(holder, "pointerleave", () => {
        par.tx = 0;
        par.ty = 0;
    });

    // Hovering holds the current face still long enough to be read.
    on(canvas, "pointerenter", (e: PointerEvent) => {
        if (e.pointerType === "mouse") hovering = true;
    });
    on(canvas, "pointerleave", () => {
        hovering = false;
        pauseTour(1200);
    });

    on(canvas, "pointerdown", (e: PointerEvent) => {
        dragging = true;
        markInteracted();
        pauseTour();
        lastX = e.clientX;
        lastY = e.clientY;
        spin.vel = 0;
        spin.sv = 0;
        canvas.classList.add("is-dragging");
        try {
            canvas.setPointerCapture(e.pointerId);
        } catch {
            /* pointer capture is a nicety, not a requirement */
        }
    });

    on(canvas, "pointermove", (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        spin.vel = dx * 0.006;
        spin.y += spin.vel;
        spin.targetY = spin.y;
        spin.x = Math.max(-0.45, Math.min(0.45, spin.x + dy * 0.004));
        pauseTour();
    });

    const release = () => {
        if (!dragging) return;
        dragging = false;
        canvas.classList.remove("is-dragging");
        // Throw, then settle square on a face.
        spin.targetY = snapTo(spin.y + spin.vel * 16);
        // Hand the throw's momentum to the spring.
        spin.sv = spin.vel * 34;
        spin.vel = 0;
        pauseTour();
    };
    on(canvas, "pointerup", release);
    on(canvas, "pointercancel", release);

    on(canvas, "keydown", (e: KeyboardEvent) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        markInteracted();
        pauseTour();
        spin.targetY =
            snapTo(spin.targetY) + (e.key === "ArrowRight" ? HALF : -HALF);
        spin.sv *= 0.3;
    });

    function updateReadout() {
        let k = Math.round(spin.y / HALF) % 4;
        if (k < 0) k += 4;
        const slot = FRONT_OF[k];
        if (slot === lastFace) return;
        lastFace = slot;
        const side = HERO_SIDES.find((v) => v.slot === slot);
        if (side) onFaceChange?.(side);
    }

    const clock = new THREE.Clock();
    const worldPos = new THREE.Vector3();

    function tick() {
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.getElapsedTime();
        const now = performance.now();

        if (!reducedMotion) {
            // Auto tour: quarter turn, brief hold on the face, quarter turn.
            // Hovering only slows it — the box is never completely still.
            const dwell = hovering ? TOUR.dwell * 2.1 : TOUR.dwell;
            if (introDone && !dragging && now > resumeAt && now > nextTurnAt) {
                spin.targetY = snapTo(spin.targetY) + HALF;
                nextTurnAt = now + dwell;
            }

            if (!dragging) {
                // Underdamped spring: each turn arrives with a small overshoot
                // and settles, instead of gliding in flat.
                const stiff = 26;
                const damp = 7.4;
                spin.sv += ((spin.targetY - spin.y) * stiff - spin.sv * damp) * dt;
                spin.y += spin.sv * dt;
                spin.x += (0 - spin.x) * (1 - Math.pow(0.0001, dt)) * 0.6;
            }

            par.x += (par.tx - par.x) * 0.06;
            par.y += (par.ty - par.y) * 0.06;
            group.rotation.y = par.x * (dragging ? 0.06 : 0.16);
            // Slow breathing tilt.
            group.rotation.x = par.y * 0.09 + Math.sin(t * 0.52) * 0.022;
            hoverLift +=
                ((hovering ? 1 : 0) - hoverLift) * (1 - Math.pow(0.0001, dt)) * 0.45;
            // Rises to meet the cursor, plus a barely-there drift.
            group.position.y = Math.sin(t * 0.74) * 0.14 + hoverLift * 0.1;
            group.position.x = Math.sin(t * 0.31) * 0.05;

            ring.rotation.z += dt * 0.17; // ~37s a lap
            orbiters.forEach((o) => {
                o.getWorldPosition(worldPos); // dim the ones swinging behind
                o.material.opacity = Math.max(
                    0.24,
                    Math.min(1, 0.3 + ((worldPos.z + 3.2) / 6.4) * 0.82),
                );
            });
            dust.rotation.y -= 0.0006;
        }

        box.rotation.y = spin.y;
        box.rotation.x = spin.x - 0.17; // tipped so the logo lid stays in view

        // The contact shadow follows the silhouette: widest at 45°, spreading
        // and thinning as the box floats up, the way a real penumbra does.
        const p = PALETTE[theme];
        const spread = Math.abs(Math.cos(spin.y)) + Math.abs(Math.sin(spin.y));
        const lift = Math.max(0, Math.min(1, (group.position.y + 0.14) / 0.38));
        const size = 2.15 * spread * 1.82 * (1 + lift * 0.12);
        blob.scale.set(size * 1.05, size * 0.92, 1);
        blobMaterial.opacity = p.blobOp * (1 - lift * 0.28);
        blob.position.x = -0.34 + par.x * 0.22;
        blob.position.z = 0.26 + par.y * 0.12;
        floorMaterial.opacity = p.shadow * (1 - lift * 0.22);

        updateReadout();
        renderer.render(scene, camera);
    }

    resize();
    const ro =
        typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(holder);
    on(window, "resize", resize);
    on(window, "orientationchange", () => setTimeout(resize, 220));

    renderer.render(scene, camera);
    // Runs in every case; reduced motion simply holds the box still.
    renderer.setAnimationLoop(tick);

    /* ------------------------------------------------------------------
       Teardown
       ------------------------------------------------------------------ */

    function dispose() {
        renderer.setAnimationLoop(null);
        ac.abort();
        ro?.disconnect();

        materials.forEach((m) => {
            m.map?.dispose();
            m.dispose();
        });
        orbiters.forEach((o) => {
            o.material.map?.dispose();
            o.material.dispose();
        });

        boxGeometry.dispose();
        edgesGeometry.dispose();
        edgesMaterial.dispose();
        torusGeometry.dispose();
        torusMaterial.dispose();
        dustGeometry.dispose();
        dustMaterial.dispose();
        floorGeometry.dispose();
        floorMaterial.dispose();
        blobGeometry.dispose();
        blobMap.dispose();
        blobMaterial.dispose();

        renderer.dispose();
    }

    return {
        spin,
        group,
        ring,
        dust,
        applyTheme,
        repaint: () => paintBox(PALETTE[theme]),
        startTour: () => {
            introDone = true;
            nextTurnAt = performance.now() + 380;
        },
        dispose,
    };
}
