import { HeaderPill } from "@/components/HeaderPill";
<<<<<<< HEAD
import { Video, Users, Award, ThumbsUp } from "lucide-react";

interface StatItem {
    icon: typeof Video;
=======
import {
    Award,
    type LucideIcon,
    ThumbsUp,
    Users,
    Video,
} from "lucide-react";
import type { StatsCmsContent } from "@/lib/homepage";

interface StatItem {
    icon: LucideIcon;
>>>>>>> seemol
    value: string;
    label: string;
    description: string;
    accentBar: string;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    borderColor: string;
}

<<<<<<< HEAD
const stats: StatItem[] = [
    {
        icon: Video,
        value: "Build",
        label: "Product listings",
        description: "storefronts & brand assets",
=======
const ACCENTS: Record<
    string,
    Pick<
        StatItem,
        "accentBar" | "iconBg" | "iconColor" | "valueColor" | "borderColor"
    >
> = {
    emerald: {
>>>>>>> seemol
        accentBar: "bg-emerald-500",
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        valueColor: "text-emerald-600 dark:text-emerald-400",
        borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
    },
<<<<<<< HEAD
    {
        icon: Users,
        value: "Create",
        label: "3D visuals",
        description: "product photography, video & ad creatives",
=======
    violet: {
>>>>>>> seemol
        accentBar: "bg-brand-violet dark:bg-dark-brand-violet",
        iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
        iconColor: "text-brand-violet dark:text-dark-brand-violet",
        valueColor: "text-brand-violet dark:text-dark-brand-violet",
        borderColor: "border-brand-violet/20 hover:border-brand-violet/40",
    },
<<<<<<< HEAD
    {
        icon: Award,
        value: "Grow",
        label: "Amazon",
        description: "Amazon, Meta, Google & TikTok advertising.",
=======
    blue: {
>>>>>>> seemol
        accentBar: "bg-brand-blue dark:bg-dark-brand-blue",
        iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
        iconColor: "text-brand-blue dark:text-dark-brand-blue",
        valueColor: "text-brand-blue dark:text-dark-brand-blue",
        borderColor: "border-brand-blue/20 hover:border-brand-blue/40",
    },
<<<<<<< HEAD
=======
    orange: {
        accentBar: "bg-brand-orange dark:bg-dark-brand-orange",
        iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
        iconColor: "text-brand-orange dark:text-dark-brand-orange",
        valueColor: "text-brand-orange dark:text-dark-brand-orange",
        borderColor: "border-brand-orange/20 hover:border-brand-orange/40",
    },
};

const ICONS: Record<string, LucideIcon> = {
    Video,
    Users,
    Award,
    ThumbsUp,
};

const DEFAULT_STATS: StatItem[] = [
    {
        icon: Video,
        value: "Build",
        label: "Product listings",
        description: "storefronts & brand assets",
        ...ACCENTS.emerald,
    },
    {
        icon: Users,
        value: "Create",
        label: "3D visuals",
        description: "product photography, video & ad creatives",
        ...ACCENTS.violet,
    },
    {
        icon: Award,
        value: "Grow",
        label: "Amazon",
        description: "Amazon, Meta, Google & TikTok advertising.",
        ...ACCENTS.blue,
    },
>>>>>>> seemol
    {
        icon: ThumbsUp,
        value: "Optimize",
        label: "SEO",
        description:
            "Conversion optimization & ongoing performance improvements",
<<<<<<< HEAD
        accentBar: "bg-brand-orange dark:bg-dark-brand-orange",
        iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
        iconColor: "text-brand-orange dark:text-dark-brand-orange",
        valueColor: "text-brand-orange dark:text-dark-brand-orange",
        borderColor: "border-brand-orange/20 hover:border-brand-orange/40",
    },
];

export default function StatsSection() {
    return (
        <section className="relative py-20 lg:py-28 bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans overflow-hidden ">
            {/* Subtle Background Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-87.5 bg-primary/5 dark:bg-dark-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative px-4 sm:px-6 lg:px-8 container mx-auto">
                {/* Top Header Pill */}
                <div className="flex justify-center mb-12 sm:mb-16">
                    <HeaderPill text="Our Numbers Speak" />
                </div>

                {/* 4-Column Responsive Grid */}
=======
        ...ACCENTS.orange,
    },
];

function resolveStats(content?: StatsCmsContent | null): {
    pill: string;
    items: StatItem[];
} {
    const pill = content?.pill?.trim() || "Our Numbers Speak";
    if (!content?.items?.length) {
        return { pill, items: DEFAULT_STATS };
    }

    const items = content.items.map((item, index) => {
        const fallback = DEFAULT_STATS[index % DEFAULT_STATS.length];
        const accent = ACCENTS[item.accent ?? ""] ?? {
            accentBar: fallback.accentBar,
            iconBg: fallback.iconBg,
            iconColor: fallback.iconColor,
            valueColor: fallback.valueColor,
            borderColor: fallback.borderColor,
        };
        return {
            icon: ICONS[item.icon ?? ""] ?? fallback.icon,
            value: item.value?.trim() || fallback.value,
            label: item.label?.trim() || fallback.label,
            description: item.description?.trim() || fallback.description,
            ...accent,
        };
    });

    return { pill, items };
}

type StatsSectionProps = {
    content?: StatsCmsContent | null;
};

export default function StatsSection({ content }: StatsSectionProps) {
    const { pill, items: stats } = resolveStats(content);

    return (
        <section className="relative py-20 lg:py-28 bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans overflow-hidden ">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-87.5 bg-primary/5 dark:bg-dark-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative px-4 sm:px-6 lg:px-8 container mx-auto">
                <div className="flex justify-center mb-12 sm:mb-16">
                    <HeaderPill text={pill} />
                </div>

>>>>>>> seemol
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className={`relative group rounded-3xl p-8 sm:p-9 bg-card-bg dark:bg-dark-card-bg border ${stat.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden`}
                            >
<<<<<<< HEAD
                                {/* Top Accent Strip */}
=======
>>>>>>> seemol
                                <div
                                    className={`absolute top-0 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-b-full ${stat.accentBar}`}
                                />

<<<<<<< HEAD
                                {/* Icon Container */}
=======
>>>>>>> seemol
                                <div
                                    className={`w-14 h-14 rounded-2xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}
                                >
                                    <Icon className="w-7 h-7" />
                                </div>

<<<<<<< HEAD
                                {/* Stat Big Number */}
=======
>>>>>>> seemol
                                <span
                                    className={`text-4xl sm:text-5xl font-black tracking-tight leading-none ${stat.valueColor}`}
                                >
                                    {stat.value}
                                </span>

<<<<<<< HEAD
                                {/* Small Divider */}
=======
>>>>>>> seemol
                                <div
                                    className={`w-8 h-0.5 rounded-full my-4 opacity-50 ${stat.accentBar}`}
                                />

<<<<<<< HEAD
                                {/* Stat Label */}
=======
>>>>>>> seemol
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                                    {stat.label}
                                </h3>

<<<<<<< HEAD
                                {/* Subtitle Description */}
=======
>>>>>>> seemol
                                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {stat.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

<<<<<<< HEAD
                {/* Bottom Tagline Quote */}
=======
>>>>>>> seemol
                <div className="mt-14 sm:mt-16 text-center">
                    <p className="text-xs sm:text-sm italic font-medium text-slate-400 dark:text-slate-500">
                        &ldquo;Real results for real brands — not just numbers
                        on a screen.&rdquo;
                    </p>
                </div>
            </div>
        </section>
    );
}
