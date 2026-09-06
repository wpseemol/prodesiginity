import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/home/MobileMenu";
import DesktopNav, { type NavLink } from "@/components/home/nav/DesktopNav";

/**
 * `mega: true` swaps the plain link for the cascading Services flyout. The
 * items inside it are read from data/servicesData.ts, not listed here.
 */
const navLinks: NavLink[] = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services", mega: true },
    { name: "Pricing", href: "/#pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
];

export default function Header() {
    return (
        <header className="sticky top-0 z-40 w-full bg-card-bg dark:bg-dark-card-bg backdrop-blur-md border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Brand Logo & Name */}
                    {/* <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-tr from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue p-0.5 shadow-md group-hover:scale-105 transition-transform duration-200">
                            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden p-1">
                                <Image
                                    src="/assets/logo/prodesignity-logo.png"
                                    alt="ProDesignity Logo"
                                    width={38}
                                    height={38}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                                Pro
                                <span className="bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue bg-clip-text text-transparent">
                                    Designity
                                </span>
                            </span>

                            <span className="text-[10px] font-bold tracking-widest uppercase text-brand-orange dark:text-white/70 leading-tight">
                                Creative Agency
                            </span>
                        </div>
                    </Link> */}

                    {/* Brand Logo dark mode and light mode image */}
                    <Link
                        href="/"
                        className="flex items-center group select-none"
                    >
                        <div className="relative h-8 sm:h-9 md:h-10 w-auto transition-transform duration-200 group-hover:scale-105">
                            {/* Dark Mode SVG Logo.
                                Paths MUST start with "/". A bare
                                "assets/..." is resolved against the current
                                URL, so it 404s on every nested route
                                (/contact/assets/... etc). */}
                            <Image
                                src="/assets/logo/prodesinity-logo-dark.svg"
                                width="100"
                                height="40"
                                alt="ProDesignity Logo"
                                className="hidden dark:block h-full w-auto object-contain"
                                priority
                            />

                            {/* Light Mode SVG Logo */}
                            <Image
                                src="/assets/logo/prodesignity-logo-light.svg"
                                width="100"
                                height="40"
                                alt="ProDesignity Logo"
                                className="block dark:hidden h-full w-auto object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <DesktopNav navLinks={navLinks} />

                    {/* Controls: Theme Switcher & CTA */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <ThemeToggle />

                        <Link
                            href="/contact/#book-a-call"
                            className="hidden md:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-brand-violet to-brand-blue hover:from-primary-hover hover:to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue dark:hover:from-dark-primary-hover dark:hover:to-dark-brand-blue rounded-xl shadow-md transition-all duration-200"
                        >
                            Get Started
                        </Link>

                        <MobileMenu navLinks={navLinks} />
                    </div>
                </div>
            </div>
        </header>
    );
}
