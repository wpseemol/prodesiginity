/**
 * Adds Google sign-in settings, the avatar_presets table and the user columns
 * that point at a chosen preset / Google picture. Safe to run repeatedly.
 */
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

async function tableExists(table: string) {
  const rows = await prisma.$queryRawUnsafe<unknown[]>(
    `SHOW TABLES LIKE '${table}'`,
  );
  return rows.length > 0;
}

async function constraintExists(table: string, name: string) {
  const rows = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${table}' AND CONSTRAINT_NAME = '${name}'`,
  );
  return rows.length > 0;
}

async function ensureColumn(table: string, column: string, sql: string) {
  if (await columnExists(table, column)) {
    console.log("Exists", `${table}.${column}`);
    return;
  }
  await prisma.$executeRawUnsafe(sql);
  console.log("Added", `${table}.${column}`);
}

async function main() {
  await ensureColumn(
    "site_settings",
    "google_client_id",
    "ALTER TABLE `site_settings` ADD COLUMN `google_client_id` VARCHAR(255) NULL AFTER `google_enhanced_conversions_api_key`",
  );
  await ensureColumn(
    "site_settings",
    "google_client_secret",
    "ALTER TABLE `site_settings` ADD COLUMN `google_client_secret` TEXT NULL AFTER `google_client_id`",
  );

  if (!(await tableExists("avatar_presets"))) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE \`avatar_presets\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`url\` VARCHAR(512) NOT NULL,
        \`label\` VARCHAR(80) NULL,
        \`sort_order\` INT NOT NULL DEFAULT 0,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        KEY \`avatar_presets_sort_order_idx\` (\`sort_order\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log("Created avatar_presets");
  } else {
    console.log("Exists avatar_presets");
  }

  await ensureColumn(
    "users",
    "google_picture_url",
    "ALTER TABLE `users` ADD COLUMN `google_picture_url` VARCHAR(512) NULL AFTER `google_id`",
  );
  await ensureColumn(
    "users",
    "avatar_preset_id",
    "ALTER TABLE `users` ADD COLUMN `avatar_preset_id` INT NULL AFTER `photo_id`",
  );

  if (!(await constraintExists("users", "users_avatar_preset_id_fkey"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `users` ADD CONSTRAINT `users_avatar_preset_id_fkey` FOREIGN KEY (`avatar_preset_id`) REFERENCES `avatar_presets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE",
    );
    console.log("Added users_avatar_preset_id_fkey");
  } else {
    console.log("Exists users_avatar_preset_id_fkey");
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
