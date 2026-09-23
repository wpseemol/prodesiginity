import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/home/MobileMenu";
import DesktopNav, { type NavLink } from "@/components/home/nav/DesktopNav";
import Logo from "@/components/home/Logo";
import Link from "next/link";

/**
 * `mega: true` swaps the plain link for the cascading Services flyout. The
 * items inside it are read from data/servicesData.ts, not listed here.
 */
const navLinks: NavLink[] = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services", mega: true },
    { name: "Pricing", href: "/#pricing" },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
];

export default function Header() {
    return (
        <header className="sticky top-0 z-40 w-full bg-card-bg dark:bg-dark-card-bg backdrop-blur-md border-b border-border-color dark:border-dark-border-color transition-colors duration-300 font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Brand Logo & Name */}
                    <Logo />

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
