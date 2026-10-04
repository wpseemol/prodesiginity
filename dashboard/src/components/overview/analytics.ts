export type AnalyticsOverview = {
  days: number;
  totalVisits: number;
  uniqueSessions: number;
  previous?: { visits: number; visitors: number };
  daily?: { date: string; visits: number; visitors: number }[];
  byCountry: { country: string; countryCode?: string | null; count: number }[];
  byDevice: { key: string; count: number }[];
  byBrowser: { key: string; count: number }[];
  byPath: { path: string; count: number }[];
  recent: {
    id: number;
    path: string;
    country: string | null;
    countryCode: string | null;
    deviceType: string | null;
    browser: string | null;
    referrer: string | null;
    createdAt: string;
  }[];
  tracking: {
    enabled: boolean;
    metaPixel: boolean;
    googleTag: boolean;
    googleAds: boolean;
    metaCapi: boolean;
    googleEnhancedConversions: boolean;
  };
  demographicsNote: string;
};

export type CountryStat = {
  code: string | null;
  name: string;
  count: number;
};

export const RANGE_OPTIONS = [7, 30, 90] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];

const compact = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatNumber(value: number) {
  return value >= 10_000 ? compact.format(value) : value.toLocaleString();
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function longDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function timeAgo(iso: string) {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) {
      return relative.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
}

export function referrerHost(referrer: string | null) {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

/** Merges rows that share a country code (the API groups by name + code). */
export function countryStats(analytics: AnalyticsOverview | null): CountryStat[] {
  if (!analytics) return [];
  const merged = new Map<string, CountryStat>();
  for (const row of analytics.byCountry) {
    const code = row.countryCode?.toUpperCase() || null;
    const known = row.country && row.country !== "Unknown";
    const key = code ?? (known ? row.country : "unknown");
    const existing = merged.get(key);
    if (existing) {
      existing.count += row.count;
    } else {
      merged.set(key, {
        code,
        name: known ? row.country : "Unknown location",
        count: row.count,
      });
    }
  }
  return [...merged.values()].sort((a, b) => b.count - a.count);
}
