"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Loader2, ShieldCheck, UsersRound } from "lucide-react";
import { getAuthUser, signInWithGoogle } from "@/lib/auth";
import { siteConfig, staffLoginUrl } from "@/config/site";
import GoogleIcon from "@/components/auth/GoogleIcon";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GSI_SRC = "https://accounts.google.com/gsi/client";

let gsiPromise: Promise<void> | null = null;

function loadGoogleIdentity(): Promise<void> {
    if (window.google?.accounts?.id) return Promise.resolve();
    gsiPromise ??= new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = GSI_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => {
            gsiPromise = null;
            reject(new Error("Could not load Google sign-in"));
        };
        document.head.appendChild(script);
    });
    return gsiPromise;
}

/** Client login: Google only. Staff use the separate dashboard login. */
export default function LoginForm() {
    const router = useRouter();
    const buttonRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState("");
    const [status, setStatus] = useState<"loading" | "ready" | "signing-in" | "unavailable">(
        GOOGLE_CLIENT_ID ? "loading" : "unavailable",
    );

    useEffect(() => {
        if (getAuthUser()) router.replace(siteConfig.dashboardPath);
    }, [router]);

    const handleCredential = useCallback(
        async ({ credential }: GoogleCredentialResponse) => {
            setError("");
            setStatus("signing-in");
            try {
                await signInWithGoogle(credential);
                router.push(siteConfig.dashboardPath);
            } catch (err) {
                setError((err as Error).message);
                setStatus("ready");
            }
        },
        [router],
    );

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;
        let cancelled = false;

        loadGoogleIdentity()
            .then(() => {
                const container = buttonRef.current;
                const gsi = window.google?.accounts.id;
                if (cancelled || !container || !gsi) return;

                gsi.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (response) => void handleCredential(response),
                    ux_mode: "popup",
                    context: "signin",
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    itp_support: true,
                    use_fedcm_for_prompt: true,
                });
                const dark = document.documentElement.classList.contains("dark");
                gsi.renderButton(container, {
                    type: "standard",
                    theme: dark ? "filled_black" : "outline",
                    size: "large",
                    text: "continue_with",
                    shape: "pill",
                    logo_alignment: "center",
                    width: Math.min(Math.max(container.offsetWidth, 240), 400),
                });
                setStatus("ready");
            })
            .catch((err: Error) => {
                if (cancelled) return;
                setError(err.message);
                setStatus("unavailable");
            });

        return () => {
            cancelled = true;
        };
    }, [handleCredential]);

    return (
        <div className="space-y-6">
            <div className="relative min-h-11">
                <div
                    ref={buttonRef}
                    className={
                        status === "ready" ? "flex justify-center" : "pointer-events-none absolute inset-0 opacity-0"
                    }
                    aria-hidden={status !== "ready"}
                />
                {status !== "ready" ? (
                    <button
                        type="button"
                        disabled
                        className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-border-color bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-80 dark:border-dark-border-color dark:bg-slate-900 dark:text-slate-100"
                    >
                        {status === "unavailable" ? (
                            <GoogleIcon className="h-5 w-5 shrink-0" />
                        ) : (
                            <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
                        )}
                        {status === "signing-in"
                            ? "Signing you in…"
                            : status === "loading"
                              ? "Loading Google sign-in…"
                              : "Continue with Google"}
                    </button>
                ) : null}
            </div>

            {status === "unavailable" && !error ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                    {process.env.NODE_ENV === "development"
                        ? "Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in."
                        : "Google sign-in is temporarily unavailable. Please try again later."}
                </p>
            ) : null}

            {error ? (
                <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                >
                    {error}
                </p>
            ) : null}

            <p className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                We only receive your name, email and profile photo from Google. No password is
                stored with us.
            </p>

            <div className="flex items-center gap-3 text-[11px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                <span className="h-px flex-1 bg-border-color dark:bg-dark-border-color" />
                Staff access
                <span className="h-px flex-1 bg-border-color dark:bg-dark-border-color" />
            </div>

            <a
                href={staffLoginUrl()}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border-color px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5 dark:border-dark-border-color"
            >
                <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-dark-primary">
                        <UsersRound className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>
                        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Team member?
                        </span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                            Sign in to the staff portal
                        </span>
                    </span>
                </span>
                <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                    aria-hidden="true"
                />
            </a>

            <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                By continuing you agree to our{" "}
                <Link href="/terms" className="font-semibold text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-dark-primary">
                    Terms
                </Link>{" "}
                and{" "}
                <Link
                    href="/privacy-policy"
                    className="font-semibold text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-dark-primary"
                >
                    Privacy Policy
                </Link>
                .
            </p>
        </div>
    );
}
