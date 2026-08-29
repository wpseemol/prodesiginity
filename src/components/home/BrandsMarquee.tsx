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
        name: "T-Mobile",
        logo: "https://commons.wikimedia.org/wiki/Special:FilePath/T-Mobile_logo.svg",
    },
    {
        name: "Wayfair",
        logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Wayfair_logo.svg",
    },
    {
        name: "Uber",
        logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Uber_logo_2018.svg",
    },
    {
        name: "Amazon",
        logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Amazon_logo.svg",
    },
    {
        name: "OPPO",
        logo: "https://commons.wikimedia.org/wiki/Special:FilePath/OPPO_Logo.svg",
    },
    {
        name: "Nestlé",
        logo: "/assets/brands/Nestl#U00e9.png",
    },
    {
        name: "Shopify",
        logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Shopify_logo_2018.svg",
    },
    {
        name: "Walmart",
        logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Walmart_logo_(2025).svg",
    },
];

export default function BrandsMarquee() {
    return (
        <section className="relative py-12 bg-white/70 dark:bg-[#070B14] border-y border-border-color dark:border-dark-border-color overflow-hidden select-none transition-colors duration-300 font-sans">
            {/* Side Fade Masks for Infinite Horizon Effect */}
            <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-40 bg-linear-to-r from-white dark:from-[#090D16] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-40 bg-linear-to-l from-white dark:from-[#090D16] to-transparent z-10 pointer-events-none" />

            {/* Infinite Logo Scroller with Pause on Hover */}
            <Marquee
                speed={45}
                gradient={false}
                pauseOnHover={true}
                pauseOnClick={true}
                className="overflow-hidden"
            >
                <div className="flex items-center gap-12 sm:gap-20 px-6 sm:px-10">
                    {brands.map((brand, index) => (
                        <div
                            key={`${brand.name}-${index}`}
                            className="relative flex items-center justify-center h-10 sm:h-12 w-28 sm:w-36 transition-all duration-300 cursor-pointer group"
                        >
                            {/* Dark Mode Gradient Border on Hover */}
                            <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-brand-violet/30 via-primary/35 to-brand-blue/40 dark:from-dark-brand-violet/20 dark:via-dark-primary/15 dark:to-dark-brand-blue/35 opacity-0 dark:group-hover:opacity-100 dark:group-hover:scale-150 transition-all duration-300 blur-[2px] " />

                            {/* Grayscale by default, full real color + scale on hover */}
                            <Image
                                src={brand.logo}
                                alt={`${brand.name} logo`}
                                height={48}
                                width={144}
                                className="max-h-full max-w-full object-contain filter grayscale opacity-40 contrast-125 dark:invert dark:opacity-40 group-hover:grayscale-0 group-hover:dark:invert-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 ease-out"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </Marquee>
        </section>
    );
}
