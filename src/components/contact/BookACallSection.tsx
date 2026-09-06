"use client";

import { motion, type Variants } from "framer-motion";
import {
    Calendar,
    CheckCircle2,
    ArrowRight,
    MessageSquare,
} from "lucide-react";
import BookingCalendar from "@/components/contact/BookingCalendar";

const defaultFadeInVariant: Variants = {
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

interface BookACallSectionProps {
    variants?: Variants;
    whatsappNumber?: string;
}

export default function BookACallSection({
    variants = defaultFadeInVariant,
    whatsappNumber = "8801738142398",
}: BookACallSectionProps) {
    // Automatically removes #book-a-call from the URL when scrolled away
    const handleViewportLeave = () => {
        if (
            typeof window !== "undefined" &&
            window.location.hash === "#book-a-call"
        ) {
            window.history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search,
            );
        }
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            onViewportLeave={handleViewportLeave}
            viewport={{ once: false, amount: 0.2 }}
            variants={variants}
            id="book-a-call"
            className="container mx-auto  sm:px-4 lg:px-8 pb-16 scroll-mt-24 "
        >
            <div className="relative p-8 sm:p-12 rounded-3xl bg-linear-to-br from-card-bg to-slate-100 dark:from-[#0B101E] dark:to-[#070A12] border border-border-color dark:border-dark-border-color shadow-2xl overflow-hidden">
                {/* Ambient Flare */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">
                    {/* Left Content */}
                    <div className="lg:col-span-5 space-y-4 lg:pt-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary dark:text-dark-primary text-xs font-bold uppercase tracking-wider">
                            Free Discovery Call
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Ready to{" "}
                            <span className="bg-linear-to-r from-primary/65 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                                Elevate
                            </span>{" "}
                            Your Brand?
                        </h2>

                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                            Let&apos;s discuss your vision and map out a
                            creative strategy that drives real results. No
                            commitments, just pure value.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                1:1 Strategy Session
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                Custom Growth Roadmap
                            </span>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-3">
                            <a
                                href="#book-a-call"
                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/80 shadow-lg shadow-primary/25 transition-all"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>Book Your Free Call</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>

                            <a
                                href={`https://wa.me/${whatsappNumber}?text=Hello%20ProDesignity,%20I%20would%20like%20to%20book%20a%20free%20strategy%20call.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/70 border border-border-color dark:border-dark-border-color hover:border-primary/40 transition-all"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Ask on WhatsApp</span>
                            </a>
                        </div>
                    </div>

                    {/* Right Booking Widget */}
                    <div className="lg:col-span-7">
                        <BookingCalendar />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
