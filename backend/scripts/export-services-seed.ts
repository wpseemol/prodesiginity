/**
 * One-shot: export frontend servicesData → prisma/servicesSeedData.json
 * Run from backend: npx tsx scripts/export-services-seed.ts
 */
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

async function main() {
  const dataPath = path.resolve(
    process.cwd(),
    "../frontend/src/data/servicesData.ts",
  );
  const mod = await import(pathToFileURL(dataPath).href);
  const groups = mod.SERVICE_GROUPS as unknown[];
  const services = (mod.SERVICES as Record<string, unknown>[]).map((s, i) => ({
    ...s,
    sortOrder: i + 1,
  }));
  const out = path.resolve(process.cwd(), "prisma/servicesSeedData.json");
  fs.writeFileSync(out, JSON.stringify({ groups, services }, null, 2));
  console.log(
    `Wrote ${out} (${groups.length} groups, ${services.length} services)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
