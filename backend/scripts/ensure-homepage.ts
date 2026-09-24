import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, type Prisma } from "@prisma/client";
import { homepageSeedSections } from "../prisma/homepageSeed";

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

async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`homepage_sections\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`key\` VARCHAR(64) NOT NULL,
      \`label\` VARCHAR(128) NOT NULL,
      \`content\` JSON NOT NULL,
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`homepage_sections_key_key\` (\`key\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
}

async function main() {
  await ensureTable();
  console.log("homepage_sections table ready");

  for (const section of homepageSeedSections) {
    await prisma.homePageSection.upsert({
      where: { key: section.key },
      create: {
        key: section.key,
        label: section.label,
        content: section.content as Prisma.InputJsonValue,
      },
      update: {},
    });
    console.log("ensured:", section.key);
  }

  // Team roster lives in team_members — remove obsolete homepage CMS section
  const removed = await prisma.homePageSection.deleteMany({
    where: { key: "team" },
  });
  if (removed.count > 0) {
    console.log("removed obsolete homepage section: team");
  }

  const all = await prisma.homePageSection.findMany({
    select: { key: true, label: true },
    orderBy: { key: "asc" },
  });
  console.log(
    "sections:",
    all.map((s) => `${s.key} (${s.label})`).join(", "),
  );
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
