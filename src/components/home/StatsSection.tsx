import { HeaderPill } from "@/components/HeaderPill";
import { Video, Users, Award, ThumbsUp } from "lucide-react";

interface StatItem {
    icon: typeof Video;
    value: string;
    label: string;
    description: string;
    accentBar: string;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    borderColor: string;
}

const stats: StatItem[] = [
    {
        icon: Video,
        value: "500+",
        label: "Videos Edited",
        description: "Reels, Shorts, Long-form & Ads",
        accentBar: "bg-emerald-500",
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        valueColor: "text-emerald-600 dark:text-emerald-400",
        borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
    },
    {
        icon: Users,
        value: "50+",
        label: "Happy Clients",
        description: "Across USA, BD, UK & beyond",
        accentBar: "bg-brand-violet dark:bg-dark-brand-violet",
        iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
        iconColor: "text-brand-violet dark:text-dark-brand-violet",
        valueColor: "text-brand-violet dark:text-dark-brand-violet",
        borderColor: "border-brand-violet/20 hover:border-brand-violet/40",
    },
    {
        icon: Award,
        value: "5+",
        label: "Years Experience",
        description: "In video, design & web",
        accentBar: "bg-brand-blue dark:bg-dark-brand-blue",
        iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
        iconColor: "text-brand-blue dark:text-dark-brand-blue",
        valueColor: "text-brand-blue dark:text-dark-brand-blue",
        borderColor: "border-brand-blue/20 hover:border-brand-blue/40",
    },
    {
        icon: ThumbsUp,
        value: "98%",
        label: "Client Retention",
        description: "They come back. Every time.",
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className={`relative group rounded-3xl p-8 sm:p-9 bg-card-bg dark:bg-dark-card-bg border ${stat.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden`}
                            >
                                {/* Top Accent Strip */}
                                <div
                                    className={`absolute top-0 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-b-full ${stat.accentBar}`}
                                />

                                {/* Icon Container */}
                                <div
                                    className={`w-14 h-14 rounded-2xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}
                                >
                                    <Icon className="w-7 h-7" />
                                </div>

                                {/* Stat Big Number */}
                                <span
                                    className={`text-4xl sm:text-5xl font-black tracking-tight leading-none ${stat.valueColor}`}
                                >
                                    {stat.value}
                                </span>

                                {/* Small Divider */}
                                <div
                                    className={`w-8 h-0.5 rounded-full my-4 opacity-50 ${stat.accentBar}`}
                                />

                                {/* Stat Label */}
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                                    {stat.label}
                                </h3>

                                {/* Subtitle Description */}
                                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {stat.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Tagline Quote */}
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
