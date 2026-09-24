import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/** Prisma CLI expects mysql://; the runtime MariaDB adapter accepts either. */
function cliDatabaseUrl() {
  const raw = env("DATABASE_URL");
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
