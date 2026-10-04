/**
 * data/staffStyles.ts
 * ---------------------------------------------------------------------------
 * Visual presets for staff profile pages (/team/<slug>) and staff cards.
 *
 * Every specialist gets a page that looks like their craft: a 3D designer
 * gets a render viewport, a graphic designer a colour-blocked poster, a
 * developer a terminal, an animator an onion-skinned timeline. A member's
 * `profileStyle` (set in the dashboard) picks the preset; "auto" infers it
 * from the job title.
 *
 * IMPORTANT — class strings live here, in a .ts file Tailwind scans, never in
 * the API payload. The API only ever stores the preset KEY.
 */

import {
    Box,
    Clapperboard,
    Crown,
    HeartHandshake,
    Palette,
    Terminal,
    TrendingUp,
    type LucideIcon,
} from "lucide-react";

import type { AvatarShape, TeamMember } from "@/data/teamData";

export type StaffStyleKey =
    | "lead"
    | "designer"
    | "graphic"
    | "developer"
    | "animator"
    | "marketing"
    | "people";

export type StaffLayout =
    | "spotlight"
    | "studio"
    | "poster"
    | "terminal"
    | "motion"
    | "classic";

export interface StaffStyle {
    key: StaffStyleKey;
    /** Badge text on cards and the hero kicker. */
    label: string;
    layout: StaffLayout;
    icon: LucideIcon;
    /** Avatar frame when the member left theirs on "auto". */
    avatarShape: AvatarShape;
    /** Specialties shown when the member has not listed skills. */
    focus: string[];
    /** CTA button copy on the profile. */
    cta: string;
    classes: {
        /** Big gradient fills (banners, buttons, frames). */
        gradient: string;
        /** Accent text. */
        text: string;
        /** Tinted surface. */
        soft: string;
        /** Accent border. */
        border: string;
        /** Skill chip. */
        chip: string;
        /** Blurred light behind hero media. */
        glow: string;
        /** Hairline grid / pattern colour for hero backgrounds. */
        pattern: string;
    };
}

export const STAFF_STYLES: Record<StaffStyleKey, StaffStyle> = {
    lead: {
        key: "lead",
        label: "Founder & Creative Lead",
        layout: "spotlight",
        icon: Crown,
        avatarShape: "hexagon",
        focus: [
            "Creative Direction",
            "Product CGI",
            "Client Strategy",
            "Quality Control",
            "Studio Operations",
        ],
        cta: "Start a project",
        classes: {
            gradient: "from-amber-400 via-fuchsia-500 to-indigo-600",
            text: "text-fuchsia-600 dark:text-fuchsia-400",
            soft: "bg-fuchsia-500/10 dark:bg-fuchsia-500/15",
            border: "border-fuchsia-500/30",
            chip: "border-fuchsia-500/25 bg-linear-to-r from-amber-400/10 to-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
            glow: "bg-fuchsia-500/30",
            pattern: "text-fuchsia-500/10",
        },
    },
    designer: {
        key: "designer",
        label: "3D Product Designer",
        layout: "studio",
        icon: Box,
        avatarShape: "squircle",
        focus: [
            "Product CGI",
            "3D Modeling",
            "Lighting & Materials",
            "Packshot Renders",
            "Exploded Views",
        ],
        cta: "Brief a render",
        classes: {
            gradient: "from-violet-600 via-indigo-600 to-blue-600",
            text: "text-violet-600 dark:text-violet-400",
            soft: "bg-violet-500/10 dark:bg-violet-500/15",
            border: "border-violet-500/30",
            chip: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
            glow: "bg-violet-500/30",
            pattern: "text-violet-500/10",
        },
    },
    graphic: {
        key: "graphic",
        label: "Graphic Designer",
        layout: "poster",
        icon: Palette,
        avatarShape: "blob",
        focus: [
            "Brand Identity",
            "Packaging Design",
            "Listing Graphics",
            "Social Creatives",
            "Print & Layout",
        ],
        cta: "Commission a design",
        classes: {
            gradient: "from-fuchsia-500 via-pink-500 to-orange-400",
            text: "text-pink-600 dark:text-pink-400",
            soft: "bg-pink-500/10 dark:bg-pink-500/15",
            border: "border-pink-500/30",
            chip: "border-pink-500/25 bg-pink-500/10 text-pink-700 dark:text-pink-300",
            glow: "bg-pink-500/30",
            pattern: "text-pink-500/10",
        },
    },
    developer: {
        key: "developer",
        label: "Developer",
        layout: "terminal",
        icon: Terminal,
        avatarShape: "circle",
        focus: [
            "Shopify Themes",
            "Next.js & React",
            "Performance",
            "Conversion UX",
            "Integrations",
        ],
        cta: "Scope a build",
        classes: {
            gradient: "from-emerald-500 via-green-500 to-lime-400",
            text: "text-emerald-600 dark:text-emerald-400",
            soft: "bg-emerald-500/10 dark:bg-emerald-500/15",
            border: "border-emerald-500/30",
            chip: "border-emerald-500/25 bg-emerald-500/10 font-mono text-emerald-700 dark:text-emerald-300",
            glow: "bg-emerald-500/25",
            pattern: "text-emerald-500/10",
        },
    },
    animator: {
        key: "animator",
        label: "Artist & Animator",
        layout: "motion",
        icon: Clapperboard,
        avatarShape: "circle",
        focus: [
            "2D Animation",
            "Motion Graphics",
            "Explainer Videos",
            "Illustration",
            "Storyboarding",
        ],
        cta: "Plan an animation",
        classes: {
            gradient: "from-amber-400 via-orange-500 to-red-500",
            text: "text-orange-600 dark:text-orange-400",
            soft: "bg-orange-500/10 dark:bg-orange-500/15",
            border: "border-orange-500/30",
            chip: "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300",
            glow: "bg-orange-500/30",
            pattern: "text-orange-500/10",
        },
    },
    marketing: {
        key: "marketing",
        label: "Marketing & SEO",
        layout: "classic",
        icon: TrendingUp,
        avatarShape: "squircle",
        focus: ["SEO", "Paid Social", "Google Ads", "Analytics", "Content Strategy"],
        cta: "Grow your store",
        classes: {
            gradient: "from-sky-500 via-blue-500 to-indigo-500",
            text: "text-sky-600 dark:text-sky-400",
            soft: "bg-sky-500/10 dark:bg-sky-500/15",
            border: "border-sky-500/30",
            chip: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
            glow: "bg-sky-500/30",
            pattern: "text-sky-500/10",
        },
    },
    people: {
        key: "people",
        label: "People & Operations",
        layout: "classic",
        icon: HeartHandshake,
        avatarShape: "circle",
        focus: ["Recruiting", "Team Culture", "Onboarding", "Operations", "Client Care"],
        cta: "Get in touch",
        classes: {
            gradient: "from-cyan-500 via-teal-500 to-emerald-400",
            text: "text-teal-600 dark:text-teal-400",
            soft: "bg-teal-500/10 dark:bg-teal-500/15",
            border: "border-teal-500/30",
            chip: "border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300",
            glow: "bg-teal-500/30",
            pattern: "text-teal-500/10",
        },
    },
};

/** Order matters: "Web Developer & Designer" is a developer, not a designer. */
const ROLE_RULES: [RegExp, StaffStyleKey][] = [
    [/graphic|brand|print|packag|illustrat/i, "graphic"],
    [/animat|motion|2d|video|vfx/i, "animator"],
    [/develop|engineer|shopify|web|code|program/i, "developer"],
    [/seo|market|advert|\bads\b|growth|social|content|creator/i, "marketing"],
    [/\bhr\b|human|people|recruit|operation|manager|admin/i, "people"],
    [/3d|product|model|render|cgi|design/i, "designer"],
];

function isStyleKey(value: unknown): value is StaffStyleKey {
    return typeof value === "string" && value in STAFF_STYLES;
}

export function resolveStaffStyle(member: TeamMember): StaffStyle {
    if (isStyleKey(member.profileStyle)) return STAFF_STYLES[member.profileStyle];
    if (member.lead) return STAFF_STYLES.lead;
    const match = ROLE_RULES.find(([pattern]) => pattern.test(member.role));
    return STAFF_STYLES[match?.[1] ?? "designer"];
}

const SHAPES: AvatarShape[] = ["circle", "squircle", "hexagon", "blob"];

export function resolveAvatarShape(member: TeamMember, style: StaffStyle): AvatarShape {
    return member.avatarShape && SHAPES.includes(member.avatarShape)
        ? member.avatarShape
        : style.avatarShape;
}
