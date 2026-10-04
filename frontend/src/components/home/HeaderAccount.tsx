"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import { staffInitials } from "@/components/team/StaffAvatar";
import { mediaUrl } from "@/config/api";
import { siteConfig } from "@/config/site";
import { signOut, type AuthUser } from "@/lib/auth";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { cn } from "@/lib/utils";

export function AccountAvatar({
    user,
    className,
}: {
    user: AuthUser;
    className?: string;
}) {
    const [failed, setFailed] = useState<string | null>(null);
    const src = user.picture ? (mediaUrl(user.picture) ?? user.picture) : null;

    if (src && failed !== src) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setFailed(src)}
                className={cn("shrink-0 rounded-full object-cover", className)}
            />
        );
    }
    return (
        <span
            aria-hidden="true"
            className={cn(
                "flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-brand-violet text-xs font-black text-white",
                className,
            )}
        >
            {staffInitials(user.name) || <User className="h-4 w-4" />}
        </span>
    );
}

/** Desktop header: "Login" when signed out, the account menu when signed in. */
export default function HeaderAccount() {
    const user = useCurrentUser();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onPointer = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    if (user === undefined) {
        return (
            <span
                aria-hidden="true"
                className="hidden sm:inline-block h-9 w-20 rounded-full bg-slate-200/70 dark:bg-slate-800/70 animate-pulse"
            />
        );
    }

    if (!user) {
        return (
            <Link
                href={siteConfig.loginPath}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-dark-primary transition-colors"
            >
                Login
            </Link>
        );
    }

    const firstName = user.name.split(/\s+/)[0] || user.name;

    const logout = async () => {
        setOpen(false);
        await signOut();
    };

    return (
        <div ref={rootRef} className="relative hidden sm:block">
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border-color dark:border-dark-border-color py-1 pl-1 pr-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
                <AccountAvatar user={user} className="h-7 w-7" />
                <span className="max-w-28 truncate">{firstName}</span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-slate-400 transition-transform",
                        open && "rotate-180",
                    )}
                />
            </button>

            {open ? (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-border-color dark:border-dark-border-color bg-white dark:bg-slate-900 shadow-xl"
                >
                    <div className="flex items-center gap-3 border-b border-border-color dark:border-dark-border-color p-4">
                        <AccountAvatar user={user} className="h-10 w-10" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <div className="p-1.5">
                        <Link
                            role="menuitem"
                            href={siteConfig.dashboardPath}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => void logout()}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Log out
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
