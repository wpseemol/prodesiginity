import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowLeft,
    FileCheck2,
    FolderKanban,
    MessagesSquare,
    Star,
} from "lucide-react";
import Logo from "@/components/home/Logo";
import LoginForm from "@/components/auth/LoginForm";
import ThemeToggle from "@/components/ThemeToggle";
import { HeaderPill } from "@/components/HeaderPill";
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

const POINT_ICONS = [FolderKanban, FileCheck2, MessagesSquare];

const PREVIEW_PROJECTS = [
    {
        name: "3D Product Render",
        status: "In review",
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        bar: "from-amber-400 to-orange-500",
        progress: 82,
    },
    {
        name: "Shopify Store Design",
        status: "Delivered",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        bar: "from-emerald-400 to-teal-500",
        progress: 100,
    },
    {
        name: "Packaging Mockups",
        status: "In progress",
        badge: "bg-primary/10 text-primary dark:text-dark-primary",
        bar: "from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue",
        progress: 46,
    },
];

function ProjectPreview() {
    return (
        <div
            aria-hidden="true"
            className="relative mt-10 max-w-lg rounded-3xl border border-border-color bg-white/80 p-5 shadow-[0_24px_60px_-28px_rgba(24,26,64,0.3)] backdrop-blur-xl dark:border-dark-border-color dark:bg-[#0d1220]/80 dark:shadow-[0_26px_60px_-30px_rgba(0,0,0,0.9)] sm:p-6"
        >
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Your projects
                    </span>
                </div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    Updated just now
                </span>
            </div>

            <ul className="space-y-4">
                {PREVIEW_PROJECTS.map((project) => (
                    <li key={project.name}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {project.name}
                            </span>
                            <span
                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${project.badge}`}
                            >
                                {project.status}
                            </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80">
                            <div
                                className={`h-full rounded-full bg-linear-to-r ${project.bar}`}
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function LoginPage() {
    const { eyebrow, description, points } = siteConfig.login;

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#fbfbff] font-sans text-slate-900 transition-colors duration-300 dark:bg-[#070B14] dark:text-slate-100">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e7e9f5_1px,transparent_1px),linear-gradient(to_bottom,#e7e9f5_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(110%_80%_at_30%_25%,#000_25%,transparent_75%)] dark:bg-[linear-gradient(to_right,#161b30_1px,transparent_1px),linear-gradient(to_bottom,#161b30_1px,transparent_1px)]" />
                <div className="absolute -top-48 -left-40 h-[36rem] w-[36rem] rounded-full bg-brand-violet/15 blur-3xl dark:bg-dark-brand-violet/20" />
                <div className="absolute -right-32 -bottom-48 h-[34rem] w-[34rem] rounded-full bg-brand-blue/15 blur-3xl dark:bg-dark-brand-blue/15" />
            </div>

            <header className="relative z-20 container mx-auto flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                <Logo />
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full border border-border-color bg-white/70 px-3.5 py-2 text-sm font-semibold text-slate-600 backdrop-blur transition-colors hover:border-primary/40 hover:text-primary dark:border-dark-border-color dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-dark-primary"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Back to site</span>
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <div className="relative z-10 container mx-auto grid items-center gap-14 px-4 pt-4 pb-16 sm:px-6 lg:min-h-[calc(100vh-5.5rem)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:pb-20">
                <section className="order-2 text-center lg:order-1 lg:text-left">
                    <HeaderPill
                        text={eyebrow}
                        className="mb-6 sm:mb-6 lg:justify-start"
                    />

                    <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                        Every project,{" "}
                        <span className="bg-linear-to-r from-primary/70 via-primary/65 to-cyan-500 bg-clip-text text-transparent dark:from-primary/65 dark:via-primary/60 dark:to-cyan-400">
                            one dashboard.
                        </span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 lg:mx-0 dark:text-slate-400">
                        {description}
                    </p>

                    <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left lg:mx-0">
                        {points.map((point, i) => {
                            const Icon = POINT_ICONS[i % POINT_ICONS.length];
                            return (
                                <li
                                    key={point}
                                    className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-dark-primary">
                                        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                                    </span>
                                    {point}
                                </li>
                            );
                        })}
                    </ul>

                    <div className="hidden sm:block">
                        <ProjectPreview />
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
                        <span className="flex gap-0.5 text-amber-400" aria-hidden="true">
                            {Array.from({ length: 5 }, (_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Rated{" "}
                            <b className="font-bold text-slate-900 dark:text-white">4.8</b> by
                            300+ store owners
                        </span>
                    </div>
                </section>

                <section className="order-1 mx-auto w-full max-w-md lg:order-2">
                    <div className="relative">
                        <div
                            aria-hidden="true"
                            className="absolute -inset-px rounded-[2rem] bg-linear-to-br from-brand-violet/60 via-primary/10 to-brand-blue/60 opacity-60 blur-sm dark:from-dark-brand-violet/50 dark:to-dark-brand-blue/50"
                        />
                        <div className="relative rounded-[2rem] border border-border-color bg-white/90 p-7 shadow-[0_24px_60px_-28px_rgba(24,26,64,0.35)] backdrop-blur-xl sm:p-10 dark:border-dark-border-color dark:bg-[#0d1220]/90 dark:shadow-[0_26px_60px_-30px_rgba(0,0,0,0.9)]">
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                    Welcome back
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                    Sign in with Google to follow your projects,
                                    download files and request revisions.
                                </p>
                            </div>

                            <LoginForm />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
