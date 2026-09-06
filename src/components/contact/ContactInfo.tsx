"use client";

import { motion, type Variants } from "framer-motion";
import { MapPin, Globe, Mail, MessageSquare } from "lucide-react";

interface ContactInfoProps {
    fadeInVariant: Variants;
    staggerVariant: Variants;
}

export default function ContactInfo({
    fadeInVariant,
    staggerVariant,
}: ContactInfoProps) {
    return (
        <motion.div
            variants={staggerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            className="space-y-8"
        >
            {/* Title & Copy */}
            <motion.div variants={fadeInVariant}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Get In Touch
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Let&apos;s Start a <br />
                    <span className="bg-linear-to-r from-primary via-primary/40 to-cyan-500 dark:from-dark-primary dark:via-dark-teal-300 dark:to-dark-cyan-400 bg-clip-text text-transparent">
                        Conversation
                    </span>
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    Have a project in mind or need expert web, animation &amp;
                    video services? Message us today — WhatsApp is fastest.
                </p>
            </motion.div>

            {/* Contact Detail Cards */}
            <motion.div variants={fadeInVariant} className="space-y-4">
                {/* Bangladesh Office Card */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm hover:border-primary/40 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Bangladesh Office
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Dhaka &amp; Khulna Division, Bangladesh
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-semibold text-primary dark:text-dark-primary bg-primary/10 px-2 py-0.5 rounded">
                            Headquarters
                        </span>
                    </div>
                </div>

                {/* Global Coverage Card */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm hover:border-primary/40 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-dark-primary/15 text-primary dark:text-dark-primary flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Global Client Base
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Serving brands across USA, UK, BD &amp; worldwide
                            with timezone-matched calls.
                        </p>
                    </div>
                </div>

                {/* Direct Info Card */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm hover:border-primary/40 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-dark-primary/15 text-primary dark:text-dark-primary flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Direct Contact
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            <a
                                href="mailto:info@prodesignity.com"
                                className="hover:text-primary dark:hover:text-dark-primary font-medium transition-colors"
                            >
                                info@prodesignity.com
                            </a>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            <a
                                href="https://wa.me/8801738142398"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary/75 font-medium transition-colors"
                            >
                                +880 1738-142398 (WhatsApp)
                            </a>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Social Links */}
            <motion.div variants={fadeInVariant} className="pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
                    Follow Us
                </span>
                <div className="flex items-center gap-3">
                    {/* Facebook Link */}
                    <a
                        href="https://facebook.com/proDesiginity"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#1877F2] dark:hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:scale-105 transition-all"
                        aria-label="Facebook Page"
                    >
                        <svg
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </a>

                    {/* WhatsApp Link */}
                    <a
                        href="https://wa.me/8801738142398"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#25D366] dark:hover:text-[#25D366] hover:border-[#25D366]/40 hover:scale-105 transition-all"
                        aria-label="WhatsApp Support"
                    >
                        <svg
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M17.472 14.382c-.301-.15-1.776-.876-2.052-.976-.276-.1-.476-.15-.676.15-.2.3-.776.976-.951 1.176-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.424-1.497-.896-.799-1.502-1.787-1.677-2.088-.176-.3-.019-.462.132-.612.136-.135.301-.351.451-.527.15-.176.2-.301.301-.501.101-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.232-.244-.587-.493-.507-.677-.516-.175-.009-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.3-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9.12.58-.087 1.776-.726 2.026-1.428.25-.702.25-1.304.175-1.428-.075-.124-.275-.2-.576-.35zM12.04 2C6.54 2 2.07 6.47 2.07 11.97c0 1.94.55 3.75 1.51 5.29L2 22l4.9-1.52c1.48.88 3.2 1.39 5.14 1.39 5.5 0 9.97-4.47 9.97-9.97S17.54 2 12.04 2zm0 18.2c-1.68 0-3.24-.49-4.57-1.33l-.33-.21-2.9 0.9.92-2.82-.23-.37c-.96-1.42-1.52-3.13-1.52-4.97 0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2z" />
                        </svg>
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
}
