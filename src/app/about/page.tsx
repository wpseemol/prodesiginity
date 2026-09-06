"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
    ChevronRight,
    Sparkles,
    Box,
    Palette,
    Video,
    Layout,
    Cpu,
    CheckCircle2,
    ArrowRight,
    Layers,
    ShieldCheck,
    Zap,
    Users,
} from "lucide-react";
import BookACallSection from "@/components/contact/BookACallSection";

const fadeInUpVariant: Variants = {
    hidden: {
        opacity: 0,
        y: 35,
        filter: "blur(4px)",
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        },
    },
};

interface ServiceGroup {
    id: string;
    badge: string;
    title: string;
    tagline: string;
    icon: typeof Box;
    iconBg: string;
    iconColor: string;
    borderColor: string;
    summaryTags: string[];
    capabilities: string[];
}

const SERVICE_CATEGORIES: ServiceGroup[] = [
    {
        id: "3d-cgi",
        badge: "CGI & Motion",
        title: "3D Design & Visualization",
        tagline:
            "Photorealistic modeling, rendering, and cinematic CGI ads built to showcase products from every angle.",
        icon: Box,
        iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
        iconColor: "text-brand-orange dark:text-dark-brand-orange",
        borderColor: "border-brand-orange/20 dark:border-brand-orange/30",
        summaryTags: [
            "Product Modeling",
            "Rendering",
            "Animation",
            "Visualization",
            "CGI Ads",
        ],
        capabilities: [
            "3D Product Modeling & Rendering",
            "Photorealistic Visualization & Mockups",
            "Product & Commercial Animations",
            "3D Explainer & CGI Advertising Videos",
            "Packaging, Architectural & Interior 3D",
            "Interactive Product Configurators",
        ],
    },
    {
        id: "graphic-design",
        badge: "Branding & Visuals",
        title: "Graphic Design & Branding",
        tagline:
            "Identity systems, high-converting e-commerce assets, and packaging that establish brand authority.",
        icon: Palette,
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        borderColor: "border-emerald-500/20 dark:border-emerald-500/30",
        summaryTags: [
            "Branding",
            "Packaging",
            "Social Media",
            "E-commerce Graphics",
            "Marketing Design",
        ],
        capabilities: [
            "Brand Identity & Complete Guidelines",
            "Amazon A+ Content & Infographics",
            "Shopify & Walmart Product Graphics",
            "Packaging & Custom Label Design",
            "Social Media & Ad Creative Kits",
            "Product Catalogs, Brochures & Flyers",
        ],
    },
    {
        id: "video-motion",
        badge: "Production & Post",
        title: "Video Production & Motion Graphics",
        tagline:
            "Engaging commercial ads, viral short-form editing, and custom animations that drive conversions.",
        icon: Video,
        iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
        iconColor: "text-brand-violet dark:text-dark-brand-violet",
        borderColor: "border-brand-violet/20 dark:border-brand-violet/30",
        summaryTags: [
            "Product Videos",
            "Commercials",
            "Explainers",
            "Motion Graphics",
            "Video Editing",
        ],
        capabilities: [
            "Commercial Ads & Promotional Videos",
            "UGC-Style Video Editing for TikTok & Reels",
            "2D/3D Motion Graphics & Logo Reveals",
            "Corporate & Brand Story Explainers",
            "Color Grading, Sound Design & Captions",
            "High-Retention YouTube Content Post-Production",
        ],
    },
    {
        id: "web-ecommerce",
        badge: "Web Engineering",
        title: "Website & E-commerce",
        tagline:
            "Ultra-fast, accessible digital storefronts and web platforms designed to convert visitors into customers.",
        icon: Layout,
        iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
        iconColor: "text-brand-blue dark:text-dark-brand-blue",
        borderColor: "border-brand-blue/20 dark:border-brand-blue/30",
        summaryTags: [
            "Websites",
            "Shopify",
            "WordPress",
            "UI/UX",
            "Landing Pages",
        ],
        capabilities: [
            "Custom Website Design & Front-End Engineering",
            "Shopify & E-Commerce Store Architecture",
            "High-Converting Sales Landing Pages",
            "WordPress & Headless CMS Implementation",
            "Speed Optimization, SEO & Bug Remediation",
            "Payment Gateway & Booking Integrations",
        ],
    },
    {
        id: "digital-solutions",
        badge: "Systems & Cloud",
        title: "Business Software & Digital Solutions",
        tagline:
            "Custom web applications, automated business workflows, and operational dashboards.",
        icon: Cpu,
        iconBg: "bg-primary/10 dark:bg-dark-primary/15",
        iconColor: "text-primary dark:text-dark-primary",
        borderColor: "border-primary/20 dark:border-primary/30",
        summaryTags: [
            "Custom Software",
            "CRM",
            "Inventory",
            "Automation",
            "Dashboards",
        ],
        capabilities: [
            "Custom Web Applications & Portal Systems",
            "CRM, Order & Inventory Management Systems",
            "Invoice, Billing & Real-Time Reporting Dashboards",
            "Workflow Automation & Third-Party API Integrations",
            "Custom Client Appointment & Scheduling Engines",
            "Enterprise Maintenance & Technical Support",
        ],
    },
];

export default function AboutPage() {
    return (
        <main className="relative min-h-screen bg-white dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-24 left-1/4 -translate-x-1/2 w-120 h-120 bg-brand-violet/10 dark:bg-dark-brand-violet/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-12 w-110 h-110 bg-brand-blue/10 dark:bg-dark-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

            {/* 1. Header Section (Consistent Inner Page Design) */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeInUpVariant}
                className="relative pt-12 sm:pt-16 pb-12 container mx-auto px-4 sm:px-6 lg:px-8"
            >
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-8"
                >
                    <Link
                        href="/"
                        className="hover:text-primary dark:hover:text-dark-primary transition-colors"
                    >
                        Home
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 stroke-[2.5]" />
                    <span className="text-primary dark:text-dark-primary font-semibold">
                        About Us
                    </span>
                </nav>

                <div className="flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-violet/10 dark:bg-dark-brand-violet/15 border border-brand-violet/20 text-brand-violet dark:text-dark-brand-violet flex items-center justify-center shadow-inner">
                            <Layers className="w-5 h-5" />
                        </div>
                        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 dark:bg-dark-primary/15 text-primary dark:text-dark-primary border border-primary/20">
                            AGENCY OVERVIEW &amp; SERVICES
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl leading-tight">
                        A Full-Service Digital Production &amp; Technology
                        Partner
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                        ProDesignity delivers end-to-end creative and technology
                        solutions — ranging from 3D CGI visuals and branding to
                        scalable web architectures and automated business
                        software.
                    </p>
                </div>
            </motion.section>

            {/* 2. Agency Pillars (3 Stats/Highlights) */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-14">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                One Single Partner
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                No juggling multiple freelancers. Strategy,
                                design, video, and code under one roof.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-violet/10 text-brand-violet dark:text-dark-brand-violet flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Conversion Driven
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Every asset is engineered to accelerate
                                e-commerce conversion and sales volume.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue dark:text-dark-brand-blue flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Global Availability
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Dedicated support across USA, UK, and European
                                timezones with daily updates.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. The 5 Core Capabilities Sections */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-border-color dark:border-dark-border-color text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Comprehensive Offerings
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Explore Our Core Service Capabilities
                    </h2>
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
                >
                    {SERVICE_CATEGORIES.map((service, index) => {
                        const IconComponent = service.icon;
                        const isFullWidth =
                            index === SERVICE_CATEGORIES.length - 1;

                        return (
                            <motion.div
                                key={service.id}
                                variants={fadeInUpVariant}
                                className={`rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-xl p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 ${
                                    isFullWidth ? "lg:col-span-2" : ""
                                }`}
                            >
                                <div>
                                    {/* Category Card Header */}
                                    <div className="flex items-center justify-between gap-4 mb-5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-11 h-11 rounded-xl ${service.iconBg} ${service.iconColor} border ${service.borderColor} flex items-center justify-center shrink-0 shadow-sm`}
                                            >
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                                                    Category {index + 1}
                                                </span>
                                                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                                                    {service.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <span
                                            className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${service.iconBg} ${service.iconColor} border ${service.borderColor}`}
                                        >
                                            {service.badge}
                                        </span>
                                    </div>

                                    {/* Tagline */}
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                        {service.tagline}
                                    </p>

                                    {/* Keyword Pills Summary */}
                                    <div className="flex flex-wrap gap-1.5 mb-6 pb-6 border-b border-border-color dark:border-dark-border-color">
                                        {service.summaryTags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-border-color dark:border-dark-border-color text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Capabilities Checklist */}
                                    <div
                                        className={`grid gap-2.5 ${isFullWidth ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}
                                    >
                                        {service.capabilities.map((item) => (
                                            <div
                                                key={item}
                                                className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                                <span className="leading-snug">
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom CTA link */}
                                <div className="mt-8 pt-4 border-t border-border-color dark:border-dark-border-color flex items-center justify-between">
                                    <span className="text-[11px] font-medium text-slate-400">
                                        Available as single project or monthly
                                        retainer
                                    </span>
                                    <a
                                        href="#book-a-call"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                                    >
                                        <span>Consult with us</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>

            {/* 4. Booking Section Component */}
            <BookACallSection />
        </main>
    );
}
