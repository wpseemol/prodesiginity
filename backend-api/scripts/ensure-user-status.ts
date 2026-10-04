import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const rows = await prisma.$queryRawUnsafe<unknown[]>(
    "SHOW COLUMNS FROM `users` LIKE 'disabled_at'",
  );
  if (rows.length === 0) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `users` ADD COLUMN `disabled_at` DATETIME(3) NULL AFTER `photo_id`",
    );
    console.log("Added users.disabled_at");
  }

  console.log("User status column is up to date.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
