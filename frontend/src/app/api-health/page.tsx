import type { Metadata } from "next";
import Logo from "@/components/home/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import ApiHealthCheck from "@/components/api-health/ApiHealthCheck";
import { absoluteUrl, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "API Health",
  description: `Check whether the ${siteConfig.name} backend API is reachable.`,
  alternates: { canonical: "/api-health" },
  openGraph: {
    title: `API Health | ${siteConfig.name}`,
    description: `Check whether the ${siteConfig.name} backend API is reachable.`,
    url: absoluteUrl("/api-health"),
  },
  robots: { index: false, follow: false },
};

export default function ApiHealthPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12 font-sans text-slate-900 transition-colors duration-300 dark:bg-[#070B14] dark:text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.16),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.12),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(129,140,248,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(96,165,250,0.1),transparent_45%)]"
      />

      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <ApiHealthCheck />
      </div>
    </main>
  );
}
