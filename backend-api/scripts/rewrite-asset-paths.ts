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

async function main() {
  const team = await prisma.$executeRawUnsafe(`
    UPDATE team_members
    SET photo_url = REPLACE(photo_url, '/assets/images/team/', '/uploads/assets/images/team/')
    WHERE photo_url LIKE '/assets/images/team/%'
  `);
  console.log("team_members updated:", team);

  // MySQL JSON: cast to char, replace, write back as JSON
  const sections = await prisma.$queryRawUnsafe<{ id: number; content: string }[]>(
    `SELECT id, CAST(content AS CHAR) AS content FROM homepage_sections`,
  );

  for (const row of sections) {
    if (!row.content.includes("/assets/")) continue;
    const next = row.content.replaceAll("/assets/", "/uploads/assets/");
    await prisma.$executeRawUnsafe(
      `UPDATE homepage_sections SET content = CAST(? AS JSON) WHERE id = ?`,
      next,
      row.id,
    );
    console.log("homepage section", row.id, "rewrote /assets/ paths");
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
