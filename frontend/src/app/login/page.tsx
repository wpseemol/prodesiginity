import type { Metadata } from "next";
import Logo from "@/components/home/Logo";
import LoginForm from "@/components/auth/LoginForm";
import ThemeToggle from "@/components/ThemeToggle";
import { absoluteUrl, siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: "Login",
    description: siteConfig.login.description,
    alternates: { canonical: siteConfig.loginPath },
    openGraph: {
        title: `Login | ${siteConfig.name}`,
        description: siteConfig.login.description,
        url: absoluteUrl(siteConfig.loginPath),
    },
    robots: { index: false, follow: false },
};

export default function LoginPage() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12 font-sans text-slate-900 transition-colors duration-300 dark:bg-[#070B14] dark:text-slate-100">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.16),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.12),_transparent_45%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(129,140,248,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(96,165,250,0.1),_transparent_45%)]"
            />

            <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
                <ThemeToggle />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <Logo />
                </div>

                <div className="rounded-3xl border border-border-color bg-card-bg p-8 shadow-2xl dark:border-dark-border-color dark:bg-dark-card-bg sm:p-10">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Welcome back
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Sign in to open your dashboard.
                        </p>
                    </div>

                    <LoginForm />
                </div>
            </div>
        </main>
    );
}
