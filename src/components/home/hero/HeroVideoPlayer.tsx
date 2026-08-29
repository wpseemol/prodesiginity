"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import HeroBadges from "./HeroBadges";

interface HeroVideoPlayerProps {
    videoId?: string;
    thumbnailSrc?: string;
}

export default function HeroVideoPlayer({
    videoId = "dQw4w9WgXcQ",
    thumbnailSrc = "/assets/hero-showcase.jpg",
}: HeroVideoPlayerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Close popup on 'Escape' key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };

        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div className="lg:col-span-6 relative w-full max-w-lg mx-auto lg:max-w-none">
            {/* 1. In-Page Thumbnail Video Box */}
            <div className="relative aspect-16/10 w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl group">
                <Image
                    src={thumbnailSrc}
                    alt="ProDesignity Video Reel"
                    fill
                    className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                    priority
                />

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        aria-label="Play Showreel"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl group-hover:scale-110 transition-all cursor-pointer"
                    >
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white ml-1" />
                    </button>
                    <span className="mt-3 text-xs sm:text-sm font-semibold tracking-widest uppercase text-white drop-shadow">
                        Watch Showreel
                    </span>
                </div>
            </div>

            {/* 2. Floating In-Page Badges */}
            <HeroBadges />

            {/* 3. Smooth Popup Video Modal (Framer Motion) */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
                        {/* Backdrop Blur Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.88, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.88, y: 30 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                            }}
                            className="relative w-full max-w-4xl z-10"
                        >
                            {/* Close Button Top-Right */}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close Video"
                                className="absolute -top-12 right-0 sm:-right-2 p-2 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all cursor-pointer focus:outline-none"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Responsive 16:9 Video Frame */}
                            <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                                    title="ProDesignity Video Showreel"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full border-0"
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
