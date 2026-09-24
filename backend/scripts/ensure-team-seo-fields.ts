import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

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
  if (!(await columnExists("team_members", "photo_alt"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `team_members` ADD COLUMN `photo_alt` VARCHAR(255) NULL AFTER `photo_url`",
    );
    console.log("Added photo_alt");
  }
  if (!(await columnExists("team_members", "photo_title"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `team_members` ADD COLUMN `photo_title` VARCHAR(160) NULL AFTER `photo_alt`",
    );
    console.log("Added photo_title");
  }

  // Backfill SEO defaults where empty
  await prisma.$executeRawUnsafe(`
    UPDATE \`team_members\`
    SET
      \`photo_alt\` = CONCAT(\`name\`, ', ', \`role\`),
      \`photo_title\` = \`name\`
    WHERE \`photo_alt\` IS NULL OR \`photo_alt\` = ''
       OR \`photo_title\` IS NULL OR \`photo_title\` = ''
  `);
  console.log("Backfilled SEO alt/title");

  const sample = await prisma.teamMember.findMany({
    select: { slug: true, photoAlt: true, photoTitle: true },
    take: 3,
  });
  console.log(sample);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
