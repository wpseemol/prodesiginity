"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight, Quote, CheckCircle2 } from "lucide-react";
import { REVIEWS_DATA } from "@/data/reviewsData";
import { HeaderPill } from "@/components/HeaderPill";

export default function ReviewsSection() {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            duration: 35,
            align: "start",
        },
        [
            Autoplay({
                delay: 5000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
            }),
        ],
    );

    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi],
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    return (
        <section className="relative py-24 sm:py-32 bg-white dark:bg-[#070B14] border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans select-none overflow-hidden">
            {/* Soft Ambient Aurora Backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 sm:w-237.5 h-100 bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 dark:from-primary/15 dark:via-primary/10 dark:to-primary/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
                    <HeaderPill
                        text="Client Feedback &amp; Trust"
                        className="sm:mb-8"
                    />

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        What Our Customers <br />
                        <span className="bg-linear-to-r from-primary via-primary/70 to-cyan-500 dark:from-primary/80 dark:via-primary/70 dark:to-cyan-400 bg-clip-text text-transparent">
                            Are Saying
                        </span>
                    </h2>
                </div>

                {/* Flat Review Display Stage */}
                <div className="relative container mx-auto px-4 sm:px-12">
                    {/* Water-Drop Liquid Quote Icon Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="relative group">
                            {/* Animated Liquid Waterdrop Halo */}
                            <div className="absolute -inset-1.5 rounded-[38%_62%_63%_37%/41%_44%_56%_59%] bg-linear-to-tr from-primary via-primary to-cyan-400 opacity-40 blur-md animate-pulse" />

                            {/* Water-drop Glass Capsule */}
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-linear-to-br from-primary/20 via-primary/10 to-primary/20 border border-primary/40 text-primary dark:text-primary flex items-center justify-center shadow-lg shadow-emerald-500/10 backdrop-blur-xl">
                                <Quote className="w-6 h-6 sm:w-7 sm:h-7 fill-brand-orange dark:fill-brand-orange stroke-none" />
                            </div>
                        </div>
                    </div>

                    {/* Carousel Viewport */}
                    <div
                        className="overflow-hidden cursor-grab active:cursor-grabbing"
                        ref={emblaRef}
                    >
                        <div className="flex">
                            {REVIEWS_DATA.map((review) => (
                                <div
                                    key={review.id}
                                    className="flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 flex flex-col items-center text-center px-4 sm:px-6"
                                >
                                    {/* Testimonial Quote */}
                                    <p className="text-base sm:text-xl md:text-2xl font-medium italic leading-relaxed sm:leading-loose text-slate-800 dark:text-slate-200 max-w-2xl mx-auto">
                                        &ldquo;{review.quote}&rdquo;
                                    </p>

                                    {/* Clean Minimal Author Display */}
                                    <div className="mt-8 sm:mt-10 flex flex-col items-center">
                                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-primary mb-3 shadow-md">
                                            <Image
                                                src={review.avatar}
                                                alt={review.author}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                                                {review.author}
                                            </h3>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                                        </div>

                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
                                            {review.role}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Floating Navigation Controls */}
                    <button
                        type="button"
                        onClick={scrollPrev}
                        aria-label="Previous testimonial"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-border-color dark:border-dark-border-color text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary-hover hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer focus:outline-none shadow-md"
                    >
                        <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <button
                        type="button"
                        onClick={scrollNext}
                        aria-label="Next testimonial"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-border-color dark:border-dark-border-color text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary-hover hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer focus:outline-none shadow-md"
                    >
                        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Responsive Dots Indicator */}
                    <div className="flex justify-center items-center gap-2 mt-12">
                        {REVIEWS_DATA.map((review, index) => (
                            <button
                                key={review.id}
                                type="button"
                                onClick={() => scrollTo(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    index === selectedIndex
                                        ? "w-8 bg-primary shadow-md shadow-emerald-500/40"
                                        : "w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
