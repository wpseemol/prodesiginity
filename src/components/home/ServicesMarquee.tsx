"use client";

import Marquee from "react-fast-marquee";
import {
    MonitorPlay,
    Video,
    Mic,
    Layers,
    Box,
    Globe,
    Zap,
    BarChart3,
    Smartphone,
    Film,
} from "lucide-react";
import { HeaderPill } from "@/components/HeaderPill";

interface ServiceCard {
    icon: typeof MonitorPlay;
    title: string;
    description: string;
    iconBg: string;
    iconColor: string;
    accentBorder: string;
}

const topRowServices: ServiceCard[] = [
    {
        icon: MonitorPlay,
        title: "Demo Videos",
        description:
            "Showcase your product features with clear, step-by-step walkthroughs that educate and convert.",
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        accentBorder: "group-hover:border-emerald-500/40",
    },
    {
        icon: Video,
        title: "Video Editing",
        description:
            "Transform raw footage into cinematic stories with perfect pacing that keeps viewers watching.",
        iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
        iconColor: "text-brand-violet dark:text-dark-brand-violet",
        accentBorder:
            "group-hover:border-brand-violet/40 dark:group-hover:border-dark-brand-violet/40",
    },
    {
        icon: Mic,
        title: "Podcast Production",
        description:
            "End-to-end audio & video editing to make your episodes sound studio-grade and professional.",
        iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
        iconColor: "text-brand-blue dark:text-dark-brand-blue",
        accentBorder:
            "group-hover:border-brand-blue/40 dark:group-hover:border-dark-brand-blue/40",
    },
    {
        icon: Layers,
        title: "SaaS Explainers",
        description:
            "Simplify complex software concepts into engaging visuals that drive instant user understanding.",
        iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
        iconColor: "text-brand-orange dark:text-dark-brand-orange",
        accentBorder:
            "group-hover:border-brand-orange/40 dark:group-hover:border-dark-brand-orange/40",
    },
    {
        icon: Box,
        title: "3D Animation",
        description:
            "Create immersive 3D worlds and product visualizations that captivate your audience instantly.",
        iconBg: "bg-primary/10 dark:bg-dark-primary/15",
        iconColor: "text-primary dark:text-dark-primary",
        accentBorder:
            "group-hover:border-primary/40 dark:group-hover:border-dark-primary/40",
    },
];

const bottomRowServices: ServiceCard[] = [
    {
        icon: Globe,
        title: "Web Development",
        description:
            "Build fast, SEO-optimized, and mobile-responsive websites that turn your visitors into clients.",
        iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
        iconColor: "text-brand-blue dark:text-dark-brand-blue",
        accentBorder:
            "group-hover:border-brand-blue/40 dark:group-hover:border-dark-brand-blue/40",
    },
    {
        icon: Zap,
        title: "Short Form",
        description:
            "Dominate TikTok, Reels & Shorts with viral editing styles that boost engagement and growth.",
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        accentBorder: "group-hover:border-emerald-500/40",
    },
    {
        icon: BarChart3,
        title: "Digital Marketing",
        description:
            "Data-driven strategies and targeted campaigns to scale your brand's reach and revenue fast.",
        iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
        iconColor: "text-brand-violet dark:text-dark-brand-violet",
        accentBorder:
            "group-hover:border-brand-violet/40 dark:group-hover:border-dark-brand-violet/40",
    },
    {
        icon: Smartphone,
        title: "UGC Content",
        description:
            "Leverage authentic user stories and testimonials to build trust and social proof for sales.",
        iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
        iconColor: "text-brand-orange dark:text-dark-brand-orange",
        accentBorder:
            "group-hover:border-brand-orange/40 dark:group-hover:border-dark-brand-orange/40",
    },
    {
        icon: Film,
        title: "Corporate Video",
        description:
            "Polished, professional storytelling that strengthens your company's reputation and authority.",
        iconBg: "bg-primary/10 dark:bg-dark-primary/15",
        iconColor: "text-primary dark:text-dark-primary",
        accentBorder:
            "group-hover:border-primary/40 dark:group-hover:border-dark-primary/40",
    },
];

function CardItem({ service }: { service: ServiceCard }) {
    const Icon = service.icon;
    return (
        <div
            className={`group relative w-55 md:w-60 h-55 sm:h-60 p-6 sm:p-7 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color ${service.accentBorder} shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between mx-3 select-none`}
        >
            <div>
                {/* Icon Frame */}
                <div
                    className={`w-12 h-12 rounded-2xl ${service.iconBg} ${service.iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                >
                    <Icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2">
                    {service.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {service.description}
                </p>
            </div>

            {/* Interactive Bottom Progress Indicator */}
            <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                <div className="w-0 group-hover:w-full h-full bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue transition-all duration-500 rounded-full" />
            </div>
        </div>
    );
}

export default function ServicesMarquee() {
    return (
        <section className="relative py-20 lg:py-28 bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color overflow-hidden select-none transition-colors duration-300 font-sans px-4 sm:px-6 lg:px-8">
            {/* Background Ambient Glows */}
            <div className="absolute top-1/3 left-10 w-96 h-96 bg-brand-violet/10 dark:bg-dark-brand-violet/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-blue/10 dark:bg-dark-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto relative">
                {/* Section Header */}
                <div className="max-w-7xl mx-auto px-4 text-center mb-14 sm:mb-16 relative z-10">
                    <HeaderPill text="Global Services" className="sm:mb-8" />

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Types of Work{" "}
                        <span className="bg-linear-to-r from-primary/70 via-primary/65 to-cyan-500 dark:from-primary/65 dark:via-primary/60 dark:to-cyan-400 bg-clip-text text-transparent">
                            We Do
                        </span>
                    </h2>

                    <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                        We provide a wide range of digital services to help your
                        business grow online.
                    </p>
                </div>

                {/* Marquee Wrapper with Universal CSS Alpha Mask (No color hardcoding) */}
                <div
                    className="relative w-full"
                    style={{
                        maskImage:
                            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                    }}
                >
                    {/* Marquee Row 1 (Moving Right) */}
                    <div className="mb-6">
                        <Marquee
                            direction="right"
                            speed={35}
                            gradient={false}
                            autoFill={
                                true
                            } /* <-- Prevents gaps across all screen sizes */
                            pauseOnHover={true}
                            pauseOnClick={true}
                            className="overflow-hidden py-2"
                        >
                            {topRowServices.map((service, index) => (
                                <CardItem
                                    key={`top-${service.title}-${index}`}
                                    service={service}
                                />
                            ))}
                        </Marquee>
                    </div>

                    {/* Marquee Row 2 (Moving Left) */}
                    <div>
                        <Marquee
                            direction="left"
                            speed={28}
                            gradient={false}
                            autoFill={
                                true
                            } /* <-- Prevents gaps across all screen sizes */
                            pauseOnHover={true}
                            pauseOnClick={true}
                            className="overflow-hidden py-2"
                        >
                            {bottomRowServices.map((service, index) => (
                                <CardItem
                                    key={`bottom-${service.title}-${index}`}
                                    service={service}
                                />
                            ))}
                        </Marquee>
                    </div>
                </div>
            </div>
        </section>
    );
}
