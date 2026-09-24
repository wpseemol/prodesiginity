"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import {
  checkApiHealth,
  type ApiHealthResult,
} from "@/lib/api-health";

function formatUptime(seconds: number | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return "—";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  if (h > 0) return `${h}h ${m}m ${rem}s`;
  if (m > 0) return `${m}m ${rem}s`;
  return `${rem}s`;
}

export default function ApiHealthCheck() {
  const [result, setResult] = useState<ApiHealthResult | null>(null);
  const [loading, setLoading] = useState(true);

  const runCheck = useCallback(async () => {
    setLoading(true);
    const next = await checkApiHealth();
    setResult(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      setLoading(true);
      const next = await checkApiHealth(controller.signal);
      if (!controller.signal.aborted) {
        setResult(next);
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const statusLabel = loading
    ? "Checking…"
    : result?.ok
      ? "API is working"
      : "API is down";

  const statusColor = loading
    ? "bg-amber-500"
    : result?.ok
      ? "bg-emerald-500"
      : "bg-rose-500";

  const statusText = loading
    ? "text-amber-700 dark:text-amber-300"
    : result?.ok
      ? "text-emerald-700 dark:text-emerald-300"
      : "text-rose-700 dark:text-rose-300";

  return (
    <div className="rounded-3xl border border-border-color bg-card-bg p-8 shadow-2xl dark:border-dark-border-color dark:bg-dark-card-bg sm:p-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            API health
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            <Activity className="h-6 w-6" />
            Backend status
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void runCheck()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border-color px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-dark-border-color dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Recheck
        </button>
      </div>

      <div
        className={`mb-6 flex items-center gap-3 rounded-2xl border border-border-color px-4 py-3 dark:border-dark-border-color ${statusText}`}
      >
        <span
          className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${statusColor} ${loading ? "animate-pulse" : ""}`}
          aria-hidden
        />
        <span className="text-base font-bold">{statusLabel}</span>
      </div>

      <dl className="space-y-3 text-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Endpoint</dt>
          <dd className="break-all font-mono text-slate-800 dark:text-slate-200">
            {result?.url ?? "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
          <dt className="text-slate-500 dark:text-slate-400">HTTP status</dt>
          <dd className="font-mono text-slate-800 dark:text-slate-200">
            {result?.status ?? "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Latency</dt>
          <dd className="font-mono text-slate-800 dark:text-slate-200">
            {result ? `${result.latencyMs} ms` : "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Uptime</dt>
          <dd className="font-mono text-slate-800 dark:text-slate-200">
            {formatUptime(result?.body?.uptime)}
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Checked at</dt>
          <dd className="font-mono text-slate-800 dark:text-slate-200">
            {result
              ? new Date(result.checkedAt).toLocaleString()
              : "—"}
          </dd>
        </div>
        {result?.error ? (
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Error</dt>
            <dd className="break-all text-rose-600 dark:text-rose-400">
              {result.error}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
