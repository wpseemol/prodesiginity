"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { siteConfig } from "@/config/site";

const CHROMELESS = [siteConfig.loginPath, siteConfig.dashboardPath];

export default function SiteChrome({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const hideChrome = CHROMELESS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

    if (hideChrome) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            {children}
            <ScrollToTop />
            <Footer />
        </>
    );
}
