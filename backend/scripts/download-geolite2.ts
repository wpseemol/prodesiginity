/**
 * Download GeoLite2-Country.mmdb from MaxMind.
 *
 * 1. Create a free account: https://www.maxmind.com/en/geolite2/signup
 * 2. Generate a license key under Account → Manage License Keys
 * 3. Put in backend/.env:
 *      MAXMIND_ACCOUNT_ID=123456
 *      MAXMIND_LICENSE_KEY=your_key_here
 * 4. Run: npm run geoip:download
 *
 * Databases expire ~30 days — re-run this script monthly (or weekly).
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import * as tar from "tar";

const OUT_DIR = path.join(process.cwd(), "data", "geoip");
const OUT_FILE = path.join(OUT_DIR, "GeoLite2-Country.mmdb");

async function main() {
  const accountId = process.env.MAXMIND_ACCOUNT_ID?.trim();
  const licenseKey = process.env.MAXMIND_LICENSE_KEY?.trim();

  if (!licenseKey) {
    console.error(
      "Missing MAXMIND_LICENSE_KEY in .env\n" +
        "Sign up: https://www.maxmind.com/en/geolite2/signup",
    );
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Prefer authenticated permalink when account id is set; fall back to legacy URL.
  const url = accountId
    ? "https://download.maxmind.com/geoip/databases/GeoLite2-Country/download?suffix=tar.gz"
    : `https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=${encodeURIComponent(licenseKey)}&suffix=tar.gz`;

  console.log("Downloading GeoLite2-Country…");

  const headers: Record<string, string> = {};
  if (accountId) {
    const token = Buffer.from(`${accountId}:${licenseKey}`).toString("base64");
    headers.Authorization = `Basic ${token}`;
  }

  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    console.error(
      `Download failed (${res.status}): ${text.slice(0, 400) || res.statusText}`,
    );
    process.exit(1);
  }

  const tmpTar = path.join(OUT_DIR, "GeoLite2-Country.tar.gz");
  await pipeline(
    Readable.fromWeb(res.body as import("stream/web").ReadableStream),
    createWriteStream(tmpTar),
  );

  console.log("Extracting…");
  let foundMmdb: string | null = null;

  await tar.x({
    file: tmpTar,
    cwd: OUT_DIR,
    gzip: true,
    filter: (filePath) => {
      if (filePath.endsWith(".mmdb")) {
        foundMmdb = filePath;
        return true;
      }
      return false;
    },
  });

  // tar.x with filter still extracts matching files under nested folder
  const walk = (dir: string): string | null => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const nested = walk(full);
        if (nested) return nested;
      } else if (entry.name.endsWith(".mmdb")) {
        return full;
      }
    }
    return null;
  };

  const extracted =
    (foundMmdb ? path.join(OUT_DIR, foundMmdb) : null) || walk(OUT_DIR);

  if (!extracted || !fs.existsSync(extracted)) {
    console.error("Could not find .mmdb inside the archive.");
    process.exit(1);
  }

  fs.copyFileSync(extracted, OUT_FILE);
  fs.unlinkSync(tmpTar);

  // Clean nested extract folders
  for (const entry of fs.readdirSync(OUT_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith("GeoLite2-Country_")) {
      fs.rmSync(path.join(OUT_DIR, entry.name), {
        recursive: true,
        force: true,
      });
    }
  }

  const sizeMb = (fs.statSync(OUT_FILE).size / (1024 * 1024)).toFixed(1);
  console.log(`Saved ${OUT_FILE} (${sizeMb} MB)`);
  console.log("Restart the API so it reloads the database.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
