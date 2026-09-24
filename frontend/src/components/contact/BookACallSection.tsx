"use client";

import { motion, type Variants } from "framer-motion";
import { Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import BookingCalendar from "@/components/contact/BookingCalendar";
import Link from "next/link";

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
                            Free 30 Minute Call
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
                            <Link
                                href="#book-a-call"
                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/80 shadow-lg shadow-primary/25 transition-all"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>Book Your Free Call</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <Link
                                href={`https://wa.me/${whatsappNumber}?text=Hello%20ProDesignity,%20I%20would%20like%20to%20book%20a%20free%20strategy%20call.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <svg
                                    className="w-5 h-5 fill-current shrink-0"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.677.15-.201.3-.777.98-1.028 1.28-.25.301-.502.351-.803.201-.301-.15-1.272-.469-2.423-1.496-.897-.8-1.503-1.789-1.68-2.09-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.301.301-.502.1-.201.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.235-.245-.588-.493-.508-.677-.518-.175-.009-.376-.01-.577-.01-.201 0-.527.075-.803.376s-1.054 1.029-1.054 2.508c0 1.48 1.079 2.909 1.229 3.11.15.201 2.124 3.243 5.145 4.549.719.311 1.28.497 1.718.636.723.23 1.38.198 1.9-.12.58-.354 1.78-1.454 2.032-2.056.251-.602.251-1.128.176-1.278-.075-.15-.276-.251-.577-.401zM12 2C6.477 2 2 6.477 2 12c0 1.892.524 3.662 1.434 5.178L2 22l4.98-1.399C8.423 21.493 10.153 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.273c-1.625 0-3.136-.484-4.417-1.317l-.317-.206-2.96.831.848-2.884-.226-.328A8.232 8.232 0 0 1 3.727 12c0-4.562 3.711-8.273 8.273-8.273 4.562 0 8.273 3.711 8.273 8.273 0 4.562-3.711 8.273-8.273 8.273z" />
                                </svg>
                                <span>Chat on WhatsApp</span>
                            </Link>
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
