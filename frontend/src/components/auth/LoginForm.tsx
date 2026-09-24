"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { getAuthUser, setAuthUser } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import GoogleIcon from "@/components/auth/GoogleIcon";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        if (getAuthUser()) {
            router.replace(siteConfig.dashboardPath);
        }
    }, [router]);

    const goToDashboard = () => {
        router.push(siteConfig.dashboardPath);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!email.trim() || password.length < 4) {
            setError("Enter a valid email and a password (min 4 characters).");
            setLoading(false);
            return;
        }

        const name = email.split("@")[0] || "User";
        setAuthUser({
            email: email.trim().toLowerCase(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            provider: "email",
        });

        goToDashboard();
    };

    const handleGoogleLogin = () => {
        setError("");
        setGoogleLoading(true);

        // Placeholder Google provider until OAuth credentials are wired.
        setAuthUser({
            email: "user@gmail.com",
            name: "Google User",
            provider: "google",
        });

        goToDashboard();
    };

    return (
        <div className="space-y-5">
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-border-color bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-dark-border-color dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
                <GoogleIcon className="h-5 w-5 shrink-0" />
                {googleLoading ? "Connecting Google…" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border-color dark:bg-dark-border-color" />
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    or
                </span>
                <div className="h-px flex-1 bg-border-color dark:bg-dark-border-color" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                    >
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-border-color bg-slate-50 py-3.5 pr-4 pl-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-primary focus:outline-none dark:border-dark-border-color dark:bg-slate-900/90 dark:text-white dark:focus:ring-dark-primary"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-border-color bg-slate-50 py-3.5 pr-12 pl-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-primary focus:outline-none dark:border-dark-border-color dark:bg-slate-900/90 dark:text-white dark:focus:ring-dark-primary"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {error ? (
                    <p
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                    >
                        {error}
                    </p>
                ) : null}

                <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-violet to-brand-blue px-5 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:from-primary-hover hover:to-brand-blue disabled:cursor-not-allowed disabled:opacity-70 dark:from-dark-brand-violet dark:to-dark-brand-blue"
                >
                    {loading ? "Signing in…" : "Sign in to dashboard"}
                    {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Back to{" "}
                <Link
                    href="/"
                    className="font-semibold text-primary hover:underline dark:text-dark-primary"
                >
                    homepage
                </Link>
            </p>
        </div>
    );
}
