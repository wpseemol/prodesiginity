import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

function createAdapter() {
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  // Prefer discrete DB_* vars — more reliable on Windows + Docker than a URL pool.
  if (user && password && database) {
    return new PrismaMariaDb({
      host: host === "localhost" ? "127.0.0.1" : host,
      port,
      user,
      password,
      database,
      // MySQL 8 caching_sha2_password over non-TLS fails after a server restart
      // (empty auth cache) unless the client may fetch the RSA public key.
      allowPublicKeyRetrieval: true,
      // Prefer a healthy pool for local + Hostinger deploys.
      connectionLimit: 10,
      // Fail request-level DB errors quickly so the API stays responsive
      // instead of hanging ~20s (feels like the server "stopped").
      connectTimeout: 8_000,
      acquireTimeout: 8_000,
      initializationTimeout: 8_000,
      // Drop idle sockets so a restarted MySQL doesn't leave a dead pool.
      idleTimeout: 60,
      // Always validate before reuse after MySQL restarts / network blips.
      minDelayValidation: 0,
    });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Database config missing. Set DB_HOST/DB_USER/DB_PASSWORD/DB_NAME or DATABASE_URL.",
    );
  }

  // Mariadb driver requires mariadb:// (not mysql://)
  const parsed = new URL(connectionString.replace(/^mysql:\/\//, "mariadb://"));
  if (!parsed.searchParams.has("allowPublicKeyRetrieval")) {
    parsed.searchParams.set("allowPublicKeyRetrieval", "true");
  }

  return new PrismaMariaDb(parsed.toString());
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaShutdownHooked?: boolean;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: createAdapter() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function hookShutdown() {
  if (globalForPrisma.prismaShutdownHooked) return;
  globalForPrisma.prismaShutdownHooked = true;

  const shutdown = () => {
    void prisma.$disconnect().finally(() => {
      // Let tsx / process exit continue.
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  process.once("beforeExit", shutdown);
}

hookShutdown();

export default prisma;
