import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI needs a URL in config even for `prisma generate` (no DB call).
 * Prefer real DATABASE_URL; fall back so CI / frontend-only installs don't fail.
 */
function cliDatabaseUrl() {
  const raw =
    process.env.DATABASE_URL?.trim() ||
    "mysql://prisma:prisma@127.0.0.1:3306/prisma";

  if (raw.startsWith("mariadb://")) {
    return raw.replace(/^mariadb:\/\//, "mysql://");
  }
  return raw;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: cliDatabaseUrl(),
  },
});
