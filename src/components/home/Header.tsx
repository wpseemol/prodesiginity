import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/home/MobileMenu";

const navLinks: {
    name: string;
    href: string;
}[] = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
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
                            {/* Dark Mode SVG Logo */}
                            <Image
                                src={`assets/logo/prodesinity-logo-dark.svg`}
                                width="100"
                                height="40"
                                alt="ProDesignity Logo"
                                className=" h-0 w-0 dark:h-full dark:w-auto object-contain scale-0 dark:scale-100 transition-transform duration-200"
                                priority
                            />

                            {/* Light Mode SVG Logo */}
                            <Image
                                src={`assets/logo/prodesignity-logo-light.svg`}
                                width="100"
                                height="40"
                                alt="ProDesignity Logo"
                                className="h-full w-auto object-contain dark:scale-0 scale-100 dark:w-0 dark:h-0 transition-transform duration-200"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                scroll={true}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white/70 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 rounded-lg transition-all"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Controls: Theme Switcher & CTA */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <ThemeToggle />

                        <Link
                            href="/contact"
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
