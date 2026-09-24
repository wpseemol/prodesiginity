import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { absoluteUrl, siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: "Dashboard",
    description: `Your ${siteConfig.name} client dashboard.`,
    alternates: { canonical: siteConfig.dashboardPath },
    openGraph: {
        title: `Dashboard | ${siteConfig.name}`,
        description: `Your ${siteConfig.name} client dashboard.`,
        url: absoluteUrl(siteConfig.dashboardPath),
    },
    robots: { index: false, follow: false },
};

export default function DashboardPage() {
    return <DashboardShell />;
}
