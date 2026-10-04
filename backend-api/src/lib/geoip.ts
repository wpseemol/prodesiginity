import fs from "fs";
import path from "path";
import { Reader, type ReaderModel, type Country } from "@maxmind/geoip2-node";

export type GeoLookup = {
  countryCode: string | null;
  country: string | null;
  source: "header" | "maxmind" | "none";
};

let readerPromise: Promise<ReaderModel | null> | null = null;

function defaultDbPath() {
  return (
    process.env.GEOIP_DB_PATH?.trim() ||
    path.join(process.cwd(), "data", "geoip", "GeoLite2-Country.mmdb")
  );
}

function normalizeIp(ip: string): string | null {
  let value = ip.trim();
  if (!value) return null;
  if (value.startsWith("::ffff:")) value = value.slice(7);
  if (value.startsWith("[") && value.endsWith("]")) {
    value = value.slice(1, -1);
  }
  if (
    value === "127.0.0.1" ||
    value === "::1" ||
    value === "localhost" ||
    value.startsWith("10.") ||
    value.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(value) ||
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    value.startsWith("fe80:")
  ) {
    return null;
  }
  return value;
}

async function getReader(): Promise<ReaderModel | null> {
  if (!readerPromise) {
    readerPromise = (async () => {
      const dbPath = defaultDbPath();
      try {
        if (!fs.existsSync(dbPath)) {
          console.warn(
            `[geoip] MaxMind DB not found at ${dbPath}. Run: npm run geoip:download`,
          );
          return null;
        }
        const buffer = fs.readFileSync(dbPath);
        const reader = Reader.openBuffer(buffer);
        console.log(`[geoip] Loaded MaxMind GeoLite2 from ${dbPath}`);
        return reader;
      } catch (error) {
        console.error("[geoip] Failed to open MaxMind DB:", error);
        return null;
      }
    })();
  }
  return readerPromise;
}

/** Lookup country via local GeoLite2-Country.mmdb (offline, no per-request API cost). */
export async function lookupIpCountry(
  ip: string | null | undefined,
): Promise<GeoLookup> {
  const normalized = ip ? normalizeIp(ip) : null;
  if (!normalized) {
    return { countryCode: null, country: null, source: "none" };
  }

  const reader = await getReader();
  if (!reader) {
    return { countryCode: null, country: null, source: "none" };
  }

  try {
    const result: Country = reader.country(normalized);
    const code = result.country?.isoCode?.toUpperCase() ?? null;
    const name = result.country?.names?.en ?? null;
    if (!code || code === "XX") {
      return { countryCode: null, country: null, source: "none" };
    }
    return {
      countryCode: code,
      country: name,
      source: "maxmind",
    };
  } catch {
    return { countryCode: null, country: null, source: "none" };
  }
}

/** Force reload after replacing the MMDB file (e.g. weekly cron). */
export function resetGeoIpReader() {
  readerPromise = null;
}
