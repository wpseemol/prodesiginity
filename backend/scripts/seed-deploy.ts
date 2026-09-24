/**
 * One-shot production / VPS bootstrap for the staff dashboard.
 *
 * Runs after `prisma db push` on the server:
 *   npm run db:seed:deploy
 *
 * Seeds:
 *   - admin + employee users (login at dashboard.prodesignity.com)
 *   - homepage CMS sections
 *   - team + site settings
 *   - services catalog
 *   - site config / tracking tables
 */
import { spawnSync } from "node:child_process";

const steps = [
  ["tsx", "prisma/seed.ts"],
  ["tsx", "scripts/ensure-team-settings.ts"],
  ["tsx", "scripts/ensure-site-config.ts"],
  ["tsx", "scripts/ensure-services.ts"],
  ["tsx", "scripts/ensure-tracking-settings.ts"],
] as const;

function run(cmd: string, args: readonly string[]) {
  console.log(`\n→ ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, [...args], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`Step failed: ${cmd} ${args.join(" ")}`);
  }
}

console.log("ProDesignity deploy seed — dashboard + CMS bootstrap");
for (const [cmd, ...args] of steps) {
  run(cmd, args);
}
console.log("\nDeploy seed complete. Log in at https://dashboard.prodesignity.com/login");
