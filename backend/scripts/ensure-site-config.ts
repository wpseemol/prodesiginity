import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, type Prisma } from "@prisma/client";
import { DEFAULT_SITE_CONFIG } from "../src/lib/zod/siteConfig";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host:
      process.env.DB_HOST === "localhost" ? "127.0.0.1" : process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  }),
});

async function columnExists(table: string, column: string) {
  const rows = await prisma.$queryRawUnsafe<{ Field: string }[]>(
    `SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`,
  );
  return rows.length > 0;
}

async function main() {
  if (!(await columnExists("site_settings", "site_config"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `site_settings` ADD COLUMN `site_config` JSON NULL AFTER `google_enhanced_conversions_api_key`",
    );
    console.log("Added site_config");
  } else {
    console.log("Exists site_config");
  }

  const row = await prisma.siteSetting.findUnique({ where: { key: "default" } });
  if (!row) {
    await prisma.siteSetting.create({
      data: {
        key: "default",
        siteName: DEFAULT_SITE_CONFIG.name,
        loginTitle: "Sign in to your account",
        loginSubtitle:
          "Use your username or email to access the ProDesignity dashboard.",
        loginBadgeText: "Staff portal",
        siteConfig: DEFAULT_SITE_CONFIG as unknown as Prisma.InputJsonValue,
      },
    });
    console.log("Created default settings + site_config");
  } else if (row.siteConfig == null) {
    await prisma.siteSetting.update({
      where: { key: "default" },
      data: {
        siteConfig: DEFAULT_SITE_CONFIG as unknown as Prisma.InputJsonValue,
        siteName: row.siteName || DEFAULT_SITE_CONFIG.name,
      },
    });
    console.log("Seeded default site_config");
  } else {
    console.log("site_config already populated");
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
