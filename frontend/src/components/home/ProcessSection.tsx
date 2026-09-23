"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
    Search,
    Compass,
    Scissors,
    Eye,
    Rocket,
    ArrowRight,
} from "lucide-react";
import { HeaderPill } from "@/components/HeaderPill";

interface Step {
    number: string;
    stepFraction: string;
    badge: string;
    title: string;
    description: string;
    icon: typeof Search;
}

const processSteps: Step[] = [
    {
        number: "01",
        stepFraction: "1/5",
        badge: "FOUNDATION",
        title: "Discover & Understand",
        description:
            "We learn about your business, goals, audience, and challenges. This gives us the clarity to build the right solution—not just a beautiful one.",
        icon: Search,
    },
    {
        number: "02",
        stepFraction: "2/5",
        badge: "STRATEGY",
        title: "Plan & Strategize",
        description:
            "We define the creative direction, solution, timeline, and deliverables. You see the plan before production begins, so everyone stays aligned.",
        icon: Compass,
    },
    {
        number: "03",
        stepFraction: "3/5",
        badge: "PRODUCTION",
        title: "Create & Build",
        description:
            "Our team brings the idea to life—from graphics and video to websites and digital solutions. Every detail is designed and developed with purpose.",
        icon: Scissors,
    },
    {
        number: "04",
        stepFraction: "4/5",
        badge: "QUALITY",
        title: "Review & Refine",
        description:
            "You review the work, share your feedback, and we refine it until everything feels right. We focus on the details that make the final result stronger.",
        icon: Eye,
    },
    {
        number: "05",
        stepFraction: "5/5",
        badge: "RESULTS",
        title: "Launch & Grow",
        description:
            "We deliver everything ready to use, launch your project, and help you move forward. We can also support your next campaign, update, or digital solution.",
        icon: Rocket,
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 40,
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

export default function ProcessSection() {
    const [activeIndex, setActiveIndex] = useState<number>(4);

    return (
        <section className="relative py-20 lg:py-28 bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans overflow-hidden">
            {/* Background Ambient Glows */}
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/5 dark:bg-dark-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-violet/5 dark:bg-dark-brand-violet/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Block with Viewport Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 sm:pb-16"
                >
                    <div>
                        <HeaderPill
                            text="Our Process"
                            className="justify-start sm:mb-8"
                            dotClassName="hidden"
                            inlineDivClassName="px-3.5 py-1.5 sm:text-xs"
                        />
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                            How We Turn Ideas <br />
                            <span className="bg-linear-to-r from-brand-violet via-primary to-brand-blue dark:from-dark-brand-violet dark:via-dark-primary dark:to-dark-brand-blue bg-clip-text text-transparent">
                                Into Powerful Solutions
                            </span>
                        </h2>
                    </div>

                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xs md:text-right leading-relaxed">
                        A clear, collaborative process built to deliver quality,
                        speed, and measurable results.
                    </p>
                </motion.div>

                {/* 5-Step Dynamic Interactive Rows */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.15 }}
                    className="space-y-4"
                >
                    {processSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isSelected = activeIndex === index;

                        return (
                            <motion.div
                                key={step.number}
                                variants={itemVariants}
                                onClick={() => setActiveIndex(index)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`relative group rounded-2xl p-6 sm:p-8 transition-all duration-300 cursor-pointer ${
                                    isSelected
                                        ? "bg-emerald-500/5 dark:bg-emerald-950/20 border border-primary/50 dark:border-primary/40 shadow-xl shadow-emerald-500/10"
                                        : "bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                                }`}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                    {/* Left: Step Number & Icon */}
                                    <div className="md:col-span-3 flex items-center gap-4 sm:gap-6">
                                        <span
                                            className={`text-4xl sm:text-5xl font-black tracking-tight leading-none select-none transition-colors duration-300 ${
                                                isSelected
                                                    ? "text-primary/50 dark:text-primary/40"
                                                    : "text-slate-300 dark:text-slate-700"
                                            }`}
                                        >
                                            {step.number}
                                        </span>

                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                                                isSelected
                                                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>

                                    {/* Center: Title & Description */}
                                    <div className="md:col-span-8 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h3
                                                className={`text-lg sm:text-xl font-black leading-tight transition-colors duration-300 ${
                                                    isSelected
                                                        ? "text-primary dark:text-primary/80"
                                                        : "text-slate-900 dark:text-white"
                                                }`}
                                            >
                                                {step.title}
                                            </h3>
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border transition-colors duration-300 ${
                                                    isSelected
                                                        ? "bg-primary/15 text-primary dark:text-primary/80 border-primary/30"
                                                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60"
                                                }`}
                                            >
                                                {step.badge}
                                            </span>
                                        </div>

                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Right: Step Fraction Indicator */}
                                    <div className="md:col-span-1 hidden md:flex justify-end">
                                        <span
                                            className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all duration-300 ${
                                                isSelected
                                                    ? "border-primary/30 text-primary dark:text-primary/80 bg-primary/10"
                                                    : "border-border-color dark:border-dark-border-color text-slate-400 dark:text-slate-500"
                                            }`}
                                        >
                                            {step.stepFraction}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* CTA Footer Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-12 pt-6 border-t border-border-color dark:border-dark-border-color flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm"
                >
                    <p className="text-slate-400 dark:text-slate-500 font-medium">
                        Let’s Build Something That Works
                    </p>

                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-1.5 font-bold text-primary hover:text-primary-hover dark:text-dark-primary dark:hover:text-dark-primary-hover transition-colors group"
                    >
                        <span>Start a Project</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
