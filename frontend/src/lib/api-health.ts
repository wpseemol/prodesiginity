import { apiBaseUrl } from "@/config/api";

export type ApiHealthResult = {
  ok: boolean;
  status: number | null;
  url: string;
  latencyMs: number;
  body: { status?: string; uptime?: number } | null;
  error: string | null;
  checkedAt: string;
};

export function apiHealthUrl(): string {
  return `${apiBaseUrl.replace(/\/$/, "")}/health`;
}

export async function checkApiHealth(
  signal?: AbortSignal,
): Promise<ApiHealthResult> {
  const url = apiHealthUrl();
  const started = performance.now();
  const checkedAt = new Date().toISOString();

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal,
    });
    const latencyMs = Math.round(performance.now() - started);

    let body: ApiHealthResult["body"] = null;
    try {
      body = (await res.json()) as ApiHealthResult["body"];
    } catch {
      body = null;
    }

    const ok = res.ok && body?.status === "ok";

    return {
      ok,
      status: res.status,
      url,
      latencyMs,
      body,
      error: ok ? null : `Unexpected response (HTTP ${res.status})`,
      checkedAt,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - started);
    const message =
      err instanceof Error ? err.message : "Failed to reach API";

    return {
      ok: false,
      status: null,
      url,
      latencyMs,
      body: null,
      error: message,
      checkedAt,
    };
  }
}
