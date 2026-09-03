import Link from "next/link";
import Image from "next/image";

const serviceLinks = [
    { name: "Short-form & Reels Editing", href: "/services" },
    { name: "Long-form Video Production", href: "/services" },
    { name: "Thumbnail & Visual Graphics", href: "/services" },
    { name: "Motion Design & VFX", href: "/services" },
];

const companyLinks = [
    { name: "About ProDesignity", href: "/about" },
    { name: "Services Portfolio", href: "/services" },
    { name: "Contact & Inquiries", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms" },
];

export default function Footer() {
    return (
        <footer className="bg-card-bg dark:bg-dark-card-bg border-t border-border-color dark:border-dark-border-color text-slate-600 dark:text-slate-400 transition-colors duration-300 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-border-color dark:border-dark-border-color">
                    {/* Brand Identity Column */}
                    <div className="space-y-4">
                        {/* Brand Logo dark mode and light mode image */}
                        <Link
                            href="/"
                            className="flex items-center group select-none"
                        >
                            <div className="relative h-8 sm:h-9 md:h-10 w-auto transition-transform duration-200 group-hover:scale-105">
                                {/* Dark Mode SVG Logo. Leading "/" is required
                                    — see the note in Header.tsx. */}
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
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                            High-converting video editing, modern visual assets,
                            and brand design built to scale creator and
                            enterprise growth.
                        </p>
                    </div>

                    {/* Services Column */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
                            Services
                        </h3>
                        <ul className="space-y-2.5">
                            {serviceLinks.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm hover:text-primary dark:hover:text-dark-primary transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
                            Company
                        </h3>
                        <ul className="space-y-2.5">
                            {companyLinks.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm hover:text-primary dark:hover:text-dark-primary transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Direct Column */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
                            Reach Us
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    Email:
                                </span>
                                <a
                                    href="mailto:contact@prodesignity.com"
                                    className="hover:text-primary dark:hover:text-dark-primary transition-colors"
                                >
                                    contact@prodesignity.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    WhatsApp:
                                </span>
                                <a
                                    href="https://wa.me/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-orange dark:text-dark-brand-orange hover:opacity-80 transition-opacity font-medium"
                                >
                                    Message Support
                                </a>
                            </li>
                            <li className="pt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-primary dark:text-dark-primary bg-primary/10 dark:bg-dark-primary/10 rounded-full border border-primary/20 dark:border-dark-primary/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Available for new bookings
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
                    <p>
                        © {new Date().getFullYear()} ProDesignity. All rights
                        reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link
                            href="/terms"
                            className="hover:text-slate-600 dark:hover:text-slate-300 transition"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            href="/privacy-policy"
                            className="hover:text-slate-600 dark:hover:text-slate-300 transition"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
