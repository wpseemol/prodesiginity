"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, ChevronDown, Mail, RefreshCw } from "lucide-react";
import { authFetch } from "@/lib/auth";
import { cn } from "@/lib/utils";

type ApplicationStatus =
    | "new"
    | "reviewing"
    | "shortlisted"
    | "interview"
    | "offered"
    | "hired"
    | "rejected";

type MyApplication = {
    id: number;
    reference: string;
    jobTitle: string;
    status: ApplicationStatus;
    createdAt: string;
    updatedAt: string;
    replies: { id: number; subject: string; body: string; createdAt: string }[];
};

const STATUS: Record<ApplicationStatus, { label: string; className: string }> = {
    new: {
        label: "Received",
        className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    },
    reviewing: {
        label: "Under review",
        className: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    },
    shortlisted: {
        label: "Shortlisted",
        className: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    },
    interview: {
        label: "Interview",
        className: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    },
    offered: {
        label: "Offer made",
        className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
    hired: {
        label: "Hired",
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-200",
    },
    rejected: {
        label: "Not selected",
        className: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function ApplicationCard({ application }: { application: MyApplication }) {
    const [open, setOpen] = useState(application.replies.length > 0);
    const status = STATUS[application.status] ?? STATUS.new;
    const count = application.replies.length;

    return (
        <li className="rounded-2xl border border-border-color dark:border-dark-border-color">
            <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">
                        {application.jobTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {application.reference} · Applied {formatDate(application.createdAt)}
                    </p>
                </div>
                <span
                    className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        status.className,
                    )}
                >
                    {status.label}
                </span>
            </div>

            <div className="border-t border-border-color dark:border-dark-border-color">
                {count === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        No messages from the team yet. We&apos;ll email you and show
                        updates here.
                    </p>
                ) : (
                    <>
                        <button
                            type="button"
                            aria-expanded={open}
                            onClick={() => setOpen((v) => !v)}
                            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
                        >
                            <span className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {count} {count === 1 ? "message" : "messages"} from the team
                            </span>
                            <ChevronDown
                                className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                            />
                        </button>
                        {open ? (
                            <ul className="space-y-3 px-4 pb-4">
                                {application.replies.map((reply) => (
                                    <li
                                        key={reply.id}
                                        className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50"
                                    >
                                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {reply.subject}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatDate(reply.createdAt)}
                                            </p>
                                        </div>
                                        <p className="mt-2 whitespace-pre-line wrap-break-word text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                            {reply.body}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </>
                )}
            </div>
        </li>
    );
}

/** Job applications sent with the signed-in user's email, with the team's replies. */
export default function MyApplications() {
    const [applications, setApplications] = useState<MyApplication[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let active = true;
        authFetch("/careers/me/applications")
            .then(async (res) => {
                const data = (await res.json().catch(() => ({}))) as {
                    applications?: MyApplication[];
                    message?: string;
                };
                if (!res.ok) throw new Error(data.message || "Could not load your applications.");
                if (active) {
                    setApplications(data.applications ?? []);
                    setError(null);
                }
            })
            .catch((err: unknown) => {
                if (!active) return;
                setError(err instanceof Error ? err.message : "Could not load your applications.");
                setApplications([]);
            });
        return () => {
            active = false;
        };
    }, [reload]);

    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                    <Briefcase className="h-5 w-5" />
                    My applications
                </h2>
                <button
                    type="button"
                    onClick={() => {
                        setApplications(null);
                        setReload((n) => n + 1);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                </button>
            </div>

            {error ? (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </p>
            ) : null}

            {applications === null ? (
                <div className="mt-4 space-y-3">
                    {[0, 1].map((i) => (
                        <div
                            key={i}
                            className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60"
                        />
                    ))}
                </div>
            ) : applications.length === 0 && !error ? (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    You haven&apos;t applied for a job with this email yet.{" "}
                    <Link
                        href="/careers"
                        className="font-semibold text-primary hover:underline dark:text-dark-primary"
                    >
                        See open positions
                    </Link>
                </p>
            ) : (
                <ul className="mt-4 space-y-3">
                    {applications.map((application) => (
                        <ApplicationCard key={application.id} application={application} />
                    ))}
                </ul>
            )}
        </div>
    );
}
