"use client";

import Marquee from "react-fast-marquee";
import Image from "next/image";

interface Brand {
    name: string;
    logo: string;
    colorFilterClass?: string;
}

const brands: Brand[] = [
    {
        name: "COLLECTIVE AROMAS Co",
        logo: "/assets/images/brands/1.png",
    },
    {
        name: "KOXAL",
        logo: "/assets/images/brands/2.png",
    },
    {
        name: "PHEROMEN",
        logo: "/assets/images/brands/3.png",
    },
    {
        name: "MUSK&CO.",
        logo: "/assets/images/brands/4.png",
    },
    {
        name: "PATÉLLE",
        logo: "/assets/images/brands/5.png",
    },
    {
        name: "عطور كابول",
        logo: "/assets/images/brands/6.png",
    },
    {
        name: "COLLECTIVE AROMAS Co.",
        logo: "/assets/images/brands/7.png",
    },
    {
        name: "GLACIER SUISSE",
        logo: "/assets/images/brands/8.png",
    },
    {
        name: "PAST PARFUMS",
        logo: "/assets/images/brands/9.png",
    },
    {
        name: "BLED BACKHOME",
        logo: "/assets/images/brands/10.png",
    },
    {
        name: "GIVA",
        logo: "/assets/images/brands/11.png",
    },
    {
        name: "TOURI",
        logo: "/assets/images/brands/12.png",
    },
    {
        name: "OLLA",
        logo: "/assets/images/brands/13.png",
    },
];

export default function BrandsMarquee() {
    return (
        <section className="relative py-14 sm:py-10 bg-white/70 dark:bg-[#070B14] border-y border-border-color dark:border-dark-border-color overflow-hidden select-none transition-colors duration-300 font-sans">
            {/* Side Fade Masks for Infinite Horizon Effect */}
            <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-48 bg-linear-to-r from-white dark:from-[#070B14] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-48 bg-linear-to-l from-white dark:from-[#070B14] to-transparent z-10 pointer-events-none" />

            {/* Infinite Logo Scroller with Pause on Hover */}
            <Marquee
                speed={40}
                gradient={false}
                pauseOnHover={true}
                pauseOnClick={true}
                className="overflow-hidden py-2"
            >
                <div className="flex items-center gap-5 sm:gap-24 px-6 sm:px-12">
                    {brands.map((brand, index) => (
                        <div
                            key={`${brand.name}-${index}`}
                            className="relative flex items-center justify-center h-14 sm:h-16 md:h-20 w-36 sm:w-48 md:w-56 transition-all duration-300 cursor-pointer group shrink-0"
                        >
                            {/* Dark Mode Ambient Glow on Hover */}
                            <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-brand-violet/20 via-primary/25 to-brand-blue/30 dark:from-dark-brand-violet/20 dark:via-dark-primary/15 dark:to-dark-brand-blue/30 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 blur-md pointer-events-none" />

                            {/* Logo Image */}
                            <Image
                                src={brand.logo}
                                alt={`${brand.name} logo`}
                                fill
                                className="object-contain filter grayscale opacity-60 contrast-125 dark:invert dark:opacity-50 group-hover:grayscale-0 group-hover:dark:invert-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 ease-out"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </Marquee>
        </section>
    );
}
