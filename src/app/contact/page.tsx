"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
    MapPin,
    Mail,
    Send,
    Calendar,
    CheckCircle2,
    ArrowRight,
    Video,
    Globe,
    MessageSquare,
} from "lucide-react";

// Reusable down-to-top smooth fade variant
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
            ease: [0.22, 1, 0.36, 1], // Smooth cubic-bezier
        },
    },
};

// Staggered children container
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
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        service: "Shopify Development",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const text = `Name: ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0AService: ${formData.service}%0ASubject: ${formData.subject}%0AMessage: ${formData.message}`;
        window.open(`https://wa.me/8801738142398?text=${text}`, "_blank");
    };

    return (
        <div className="relative min-h-screen bg-white dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden">
            {/* Background Decorative Ambient Glows */}
            <div className="absolute top-20 left-1/4 -translate-x-1/2 w-125 h-125 bg-brand-violet/10 dark:bg-dark-brand-violet/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-10 w-112.5 h-112.5 bg-brand-blue/10 dark:bg-dark-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

            {/* 1. Header Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeInUpVariant}
                className="relative pt-16 pb-12 text-center max-w-4xl mx-auto px-4 sm:px-6"
            >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                    Contact
                </h1>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                    <Link
                        href="/"
                        className="hover:text-primary dark:hover:text-dark-primary transition-colors"
                    >
                        Home
                    </Link>
                    <span>/</span>
                    <span className="text-emerald-500 font-semibold">
                        Contact
                    </span>
                </div>
            </motion.section>

            {/* 2. Main Contact Grid */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                    {/* Left Column: Information Cards */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.15 }}
                        className="lg:col-span-5 space-y-8"
                    >
                        {/* Title & Copy */}
                        <motion.div variants={fadeInUpVariant}>
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
                                Have a project in mind or need expert web,
                                animation &amp; video services? Message us today
                                — WhatsApp is fastest.
                            </p>
                        </motion.div>

                        {/* Contact Detail Cards */}
                        <motion.div
                            variants={fadeInUpVariant}
                            className="space-y-4"
                        >
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
                                        Serving brands across USA, UK, BD &amp;
                                        worldwide with timezone-matched calls.
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
                                            href="mailto:mdpitul@gmail.com"
                                            className="hover:text-primary dark:hover:text-dark-primary font-medium transition-colors"
                                        >
                                            mdpitul@gmail.com
                                        </a>
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        <a
                                            href="https://wa.me/8801738142398"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-primary/55 font-medium transition-colors"
                                        >
                                            +880 1738-142398 (WhatsApp)
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Social Follow */}
                        <motion.div variants={fadeInUpVariant} className="pt-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
                                Follow Us
                            </span>
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://facebook.com/proDesiginity"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary/55 hover:scale-105 transition-all"
                                    aria-label="Facebook Page"
                                >
                                    <Globe className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://wa.me/8801738142398"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary/55 hover:scale-105 transition-all"
                                    aria-label="WhatsApp Support"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Send Us a Message Form */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.15 }}
                        variants={fadeInUpVariant}
                        className="lg:col-span-7"
                    >
                        <div className="p-8 sm:p-10 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-2xl relative">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-color dark:border-dark-border-color">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Send className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                                        Send Us a Message
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        We typically reply within 1–2 hours on
                                        WhatsApp &amp; Email.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. John Doe"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                            Phone Number (WhatsApp)
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phone: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                            Service Needed
                                        </label>
                                        <select
                                            value={formData.service}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    service: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                                        >
                                            <option value="Shopify Development">
                                                Shopify Development
                                            </option>
                                            <option value="Web Design & Development">
                                                Web Design & Development
                                            </option>
                                            <option value="Video Editing & Motion">
                                                Video Editing & Motion
                                            </option>
                                            <option value="3D Animation & Visuals">
                                                3D Animation & Visuals
                                            </option>
                                            <option value="Custom Project">
                                                Custom Inquiries
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Project Inquiry / Redesign"
                                        value={formData.subject}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                subject: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Your Message *
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        placeholder="Tell us about your project, timeline, and goals..."
                                        value={formData.message}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                message: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-primary to-primary/80 hover:from-primary hover:to-teal-700 shadow-lg shadow-primary/20 transition-all duration-200"
                                >
                                    <span>Send Message</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 3. Bottom CTA Card: Elevate Your Brand */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={fadeInUpVariant}
                className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24"
            >
                <div className="relative p-8 sm:p-12 rounded-3xl bg-linear-to-br from-card-bg to-slate-100 dark:from-[#0B101E] dark:to-[#070A12] border border-border-color dark:border-dark-border-color shadow-2xl overflow-hidden">
                    {/* Ambient Flare */}
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        {/* Left Content */}
                        <div className="lg:col-span-7 space-y-4">
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

                            <div className="pt-2">
                                <a
                                    href="https://wa.me/8801738142398?text=Hello%20ProDesignity,%20I%20would%20like%20to%20book%20a%20free%20strategy%20call."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/80 shadow-lg shadow-primary/25 transition-all"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Book Your Free Call</span>
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Right Mini Schedule Widget */}
                        <div className="lg:col-span-5 flex justify-center">
                            <div className="w-full max-w-sm p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-border-color dark:border-dark-border-color shadow-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <Video className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                Strategy Call
                                            </h4>
                                            <p className="text-[10px] text-slate-400">
                                                Google Meet / Zoom
                                            </p>
                                        </div>
                                    </div>
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                                        Duration: 30 Mins
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        Available: Saturday to Thursday
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                                    <span>Fast Response</span>
                                    <span className="font-bold text-primary dark:text-dark-primary">
                                        1–2 Hours
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
