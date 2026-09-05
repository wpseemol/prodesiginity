"use client";
import Marquee from "react-fast-marquee";
import {
    Palette, // Graphic Design
    ListChecks, // Product Listing
    AppWindow, // Web Applications
    Layout, // Website Design & Development
    ShoppingBag, // Shopify Store Design
    PackageSearch, // Amazon Listing
    Sparkles, // Product Animation
    Megaphone, // Paid Advertising
    SearchCheck, // SEO
    Video, // UGC Video
    Box, // 3D Animation
    Film, // 2D Animation
    BookOpen, // Product Catalog Design
    type LucideIcon,
} from "lucide-react";
import { HeaderPill } from "@/components/HeaderPill";

interface ServiceCard {
    icon: LucideIcon;
    title: string;
    description: string;
    iconBg: string;
    iconColor: string;
    accentBorder: string;
}

const topRowServices: ServiceCard[] = [
    {
        icon: Palette,
        title: "Graphic Design",
        description:
            "Design strong visuals for your brand, social media, packaging, and marketing materials.",
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        accentBorder: "group-hover:border-emerald-500/40",
    },
    {
        icon: ListChecks,
        title: "Product Listing",
        description:
            "Create clear, optimized product listings that help customers understand and buy with confidence.",
        iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
        iconColor: "text-brand-violet dark:text-dark-brand-violet",
        accentBorder:
            "group-hover:border-brand-violet/40 dark:group-hover:border-dark-brand-violet/40",
    },
    {
        icon: AppWindow,
        title: "Web Applications",
        description:
            "Develop custom web applications that simplify operations and solve real business needs.",
        iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
        iconColor: "text-brand-blue dark:text-dark-brand-blue",
        accentBorder:
            "group-hover:border-brand-blue/40 dark:group-hover:border-dark-brand-blue/40",
    },
    {
        icon: Layout,
        title: "Website Design & Development",
        description:
            "Create modern, fast, mobile-friendly websites made to represent your brand professionally.",
        iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
        iconColor: "text-brand-orange dark:text-dark-brand-orange",
        accentBorder:
            "group-hover:border-brand-orange/40 dark:group-hover:border-dark-brand-orange/40",
    },
    {
        icon: ShoppingBag,
        title: "Shopify Store Design",
        description:
            "Build high-converting Shopify stores that make shopping simple and drive more sales.",
        iconBg: "bg-primary/10 dark:bg-dark-primary/15",
        iconColor: "text-primary dark:text-dark-primary",
        accentBorder:
            "group-hover:border-primary/40 dark:group-hover:border-dark-primary/40",
    },
    {
        icon: PackageSearch,
        title: "Amazon Listing",
        description:
            "Optimize Amazon titles, images, descriptions, and content to improve product conversions.",
        iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
        iconColor: "text-brand-blue dark:text-dark-brand-blue",
        accentBorder:
            "group-hover:border-brand-blue/40 dark:group-hover:border-dark-brand-blue/40",
    },
    {
        icon: Sparkles,
        title: "Product Animation",
        description:
            "Bring your product to life with animated visuals that highlight key features and benefits.",
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        accentBorder: "group-hover:border-emerald-500/40",
    },
];

const bottomRowServices: ServiceCard[] = [
    {
        icon: Megaphone,
        title: "Paid Advertising",
        description:
            "Run targeted ad campaigns designed to reach the right people and generate results.",
        iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
        iconColor: "text-brand-blue dark:text-dark-brand-blue",
        accentBorder:
            "group-hover:border-brand-blue/40 dark:group-hover:border-dark-brand-blue/40",
    },
    {
        icon: SearchCheck,
        title: "SEO",
        description:
            "Improve your search visibility so more potential customers can find your business online.",
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        accentBorder: "group-hover:border-emerald-500/40",
    },
    {
        icon: Video,
        title: "UGC Video",
        description:
            "Create authentic user-generated-style videos that build trust and make products feel real.",
        iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
        iconColor: "text-brand-violet dark:text-dark-brand-violet",
        accentBorder:
            "group-hover:border-brand-violet/40 dark:group-hover:border-dark-brand-violet/40",
    },
    {
        icon: Box,
        title: "3D Animation",
        description:
            "Showcase products with realistic 3D visuals and animations that grab attention.",
        iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
        iconColor: "text-brand-orange dark:text-dark-brand-orange",
        accentBorder:
            "group-hover:border-brand-orange/40 dark:group-hover:border-dark-brand-orange/40",
    },
    {
        icon: Film,
        title: "2D Animation",
        description:
            "Turn your message into engaging animated videos that are easy to understand and remember.",
        iconBg: "bg-primary/10 dark:bg-dark-primary/15",
        iconColor: "text-primary dark:text-dark-primary",
        accentBorder:
            "group-hover:border-primary/40 dark:group-hover:border-dark-primary/40",
    },
    {
        icon: BookOpen,
        title: "Product Catalog Design",
        description:
            "Create clean, professional product catalogs that make your full range easy to explore.",
        iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
        iconColor: "text-brand-blue dark:text-dark-brand-blue",
        accentBorder:
            "group-hover:border-brand-blue/40 dark:group-hover:border-dark-brand-blue/40",
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
