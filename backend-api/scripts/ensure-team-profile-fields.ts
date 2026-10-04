import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

type ColumnInfo = { Field: string; Null: "YES" | "NO" };

async function columnInfo(table: string, column: string) {
  const rows = await prisma.$queryRawUnsafe<ColumnInfo[]>(
    `SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`,
  );
  return rows[0] ?? null;
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
    if (!(await columnInfo("team_members", name))) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE \`team_members\` ADD COLUMN \`${name}\` ${ddl}`,
      );
      console.log(`Added team_members.${name}`);
    }
  }

  const photo = await columnInfo("team_members", "photo_url");
  if (photo?.Null === "NO") {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `team_members` MODIFY COLUMN `photo_url` VARCHAR(512) NULL",
    );
    console.log("team_members.photo_url is now optional");
  }

  console.log("Team profile columns are up to date.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
