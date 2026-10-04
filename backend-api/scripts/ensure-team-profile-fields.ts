import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

async function columnExists(table: string, column: string) {
  const rows = await prisma.$queryRawUnsafe<{ Field: string }[]>(
    `SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`,
  );
  return rows.length > 0;
}

const columns: [name: string, ddl: string][] = [
  ["avatar_url", "VARCHAR(512) NULL AFTER `photo_title`"],
  ["avatar_shape", "VARCHAR(16) NOT NULL DEFAULT 'auto' AFTER `avatar_url`"],
  ["profile_style", "VARCHAR(24) NOT NULL DEFAULT 'auto' AFTER `avatar_shape`"],
  ["socials", "JSON NULL AFTER `profile_style`"],
  ["skills", "JSON NULL AFTER `socials`"],
];

async function main() {
  for (const [name, ddl] of columns) {
    if (!(await columnExists("team_members", name))) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE \`team_members\` ADD COLUMN \`${name}\` ${ddl}`,
      );
      console.log(`Added team_members.${name}`);
    }
  }
  console.log("Team profile columns are up to date.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
