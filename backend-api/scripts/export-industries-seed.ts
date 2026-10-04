/**
 * One-shot: export frontend industriesData → prisma/industriesSeedData.json
 * Run from backend-api: npx tsx scripts/export-industries-seed.ts
 */
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

async function main() {
  const dataPath = path.resolve(
    process.cwd(),
    "../frontend/src/data/industriesData.ts",
  );
  const mod = await import(pathToFileURL(dataPath).href);
  const industries = (mod.INDUSTRIES as Record<string, unknown>[]).map(
    (industry, i) => ({ ...industry, sortOrder: i + 1 }),
  );
  const out = path.resolve(process.cwd(), "prisma/industriesSeedData.json");
  fs.writeFileSync(out, JSON.stringify({ industries }, null, 2));
  console.log(`Wrote ${out} (${industries.length} industries)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
