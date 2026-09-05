/**
 * Everything the hero says, in one place. Edit copy here rather than in the
 * scene or the component — `sides` is read by both the WebGL face textures and
 * the readout under the box, so the two can never drift apart.
 */

export interface HeroSide {
    /** Which face of the BoxGeometry this lands on (0..5, three.js material index). */
    slot: number;
    name: string;
    note: string;
}

export const HERO_SIDES: HeroSide[] = [
    {
        slot: 4,
        name: "Amazon management",
        note: "Listings, A+ content, PPC, reviews",
    },
    {
        slot: 1,
        name: "Shopify & store design",
        note: "Build, theme, speed, CRO",
    },
    {
        slot: 5,
        name: "Creative & packaging",
        note: "Graphics, product & 3D visuals",
    },
    {
        slot: 0,
        name: "Ads, SEO & retention",
        note: "Google, Meta, TikTok, email",
    },
];

/** Face slot that is pointing at the camera for each quarter turn. */
export const FRONT_OF = [4, 1, 5, 0];

/** Labels on the chips riding the orbit ring. */
export const HERO_CHANNELS = [
    "Amazon",
    "Shopify",
    "Google Ads",
    "Meta",
    "TikTok",
];

export const HERO_HEADLINE_LINES = [
    "Your E-commerce",
    "Growth Partner",
    "All in One Place.",
];

export interface HeroStat {
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
}

export const HERO_STATS: HeroStat[] = [
    { value: 300, suffix: "+", label: "brands scaled since 2017" },
    {
        value: 50,
        prefix: "$",
        suffix: "M+",
        label: "We Generated Revenue for our clients",
    },
    { value: 20, suffix: "+ channels", label: "run from one umbrella" },
];
