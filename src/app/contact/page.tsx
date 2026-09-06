"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";
import BookACallSection from "@/components/contact/BookACallSection";
import { ChevronRight, Mail } from "lucide-react";

const fadeInUpVariant: Variants = {
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
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.05,
        },
    },
};

export default function ContactPage() {
    return (
        <main className="relative min-h-screen bg-white dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-20 left-1/4 -translate-x-1/2 w-125 h-125 bg-brand-violet/10 dark:bg-dark-brand-violet/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-10 w-112.5 h-112.5 bg-brand-blue/10 dark:bg-dark-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

            {/* Breadcrumb Header matching inner page design */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeInUpVariant}
                className="relative pt-12 sm:pt-16 pb-10 container mx-auto px-4 sm:px-6 lg:px-8"
            >
                {/* Top Breadcrumb Trail */}
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
                        Contact
                    </span>
                </nav>

                {/* Header Content with Icon + Category Pill */}
                <div className="flex flex-col items-start gap-4">
                    {/* Page Title */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                        Contact Us
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                        Have a project in mind or want to explore our digital
                        services? Send us a message or schedule a direct
                        consultation.
                    </p>
                </div>
            </motion.section>

            {/* Main Content Grid */}
            <section className="relative container mx-auto px-4 sm:px-4 lg:px-8 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                    <div className="lg:col-span-5">
                        <ContactInfo
                            fadeInVariant={fadeInUpVariant}
                            staggerVariant={staggerContainer}
                        />
                    </div>
                    <div className="lg:col-span-7">
                        <ContactForm fadeInVariant={fadeInUpVariant} />
                    </div>
                </div>
            </section>
            <section className=" sm:px-4 lg:px-8 pb-16">
                <BookACallSection />
            </section>
        </main>
    );
}
