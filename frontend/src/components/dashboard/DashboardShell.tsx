"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    LogOut,
    FolderKanban,
    Settings,
    User,
} from "lucide-react";
import Logo from "@/components/home/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { clearAuthUser, getAuthUser, type AuthUser } from "@/lib/auth";
import { siteConfig } from "@/config/site";

const nav = [
    {
        name: "Overview",
        href: siteConfig.dashboardPath,
        icon: LayoutDashboard,
    },
    {
        name: "Projects",
        href: `${siteConfig.dashboardPath}#projects`,
        icon: FolderKanban,
    },
    {
        name: "Settings",
        href: `${siteConfig.dashboardPath}#settings`,
        icon: Settings,
    },
];

export default function DashboardShell() {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const current = getAuthUser();
        if (!current) {
            router.replace(siteConfig.loginPath);
            return;
        }
        setUser(current);
        setReady(true);
    }, [router]);

    const handleLogout = () => {
        clearAuthUser();
        router.push(siteConfig.loginPath);
    };

    if (!ready || !user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white font-sans dark:bg-[#070B14]">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading dashboard…
                </p>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-[#070B14] dark:text-slate-100">
            <header className="sticky top-0 z-40 border-b border-border-color bg-card-bg/90 backdrop-blur-md dark:border-dark-border-color dark:bg-dark-card-bg/90">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Logo />
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-xl border border-border-color px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-dark-border-color dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Log out</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
                <aside className="space-y-1">
                    {nav.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-white"
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </aside>

                <main className="space-y-8">
                    <section className="rounded-3xl border border-border-color bg-white p-6 shadow-sm dark:border-dark-border-color dark:bg-slate-900/50 sm:p-8">
                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-dark-primary/15 dark:text-dark-primary">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                                    Hi, {user.name}
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {user.email}
                                    {user.provider === "google"
                                        ? " · Google"
                                        : null}
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            You&apos;re signed in to your {siteConfig.name}{" "}
                            dashboard at{" "}
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {siteConfig.dashboardPath}
                            </span>
                            .
                        </p>
                    </section>

                    <section
                        id="projects"
                        className="rounded-3xl border border-border-color bg-white p-6 shadow-sm dark:border-dark-border-color dark:bg-slate-900/50 sm:p-8"
                    >
                        <h2 className="text-lg font-bold">Projects</h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            No projects yet. Your active work will show up here.
                        </p>
                    </section>

                    <section
                        id="settings"
                        className="rounded-3xl border border-border-color bg-white p-6 shadow-sm dark:border-dark-border-color dark:bg-slate-900/50 sm:p-8"
                    >
                        <h2 className="text-lg font-bold">Settings</h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Account preferences will live in this section.
                        </p>
                    </section>
                </main>
            </div>
        </div>
    );
}
