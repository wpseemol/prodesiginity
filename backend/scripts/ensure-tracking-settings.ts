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
  const rows = await prisma.$queryRawUnsafe<{ Tables_in_db?: string }[]>(
    `SHOW TABLES LIKE '${table}'`,
  );
  return rows.length > 0;
}

async function addColumn(sql: string, label: string) {
  await prisma.$executeRawUnsafe(sql);
  console.log("Added", label);
}

async function main() {
  const cols: [string, string][] = [
    [
      "tracking_enabled",
      "ALTER TABLE `site_settings` ADD COLUMN `tracking_enabled` TINYINT(1) NOT NULL DEFAULT 0 AFTER `login_logo_url`",
    ],
    [
      "meta_pixel_id",
      "ALTER TABLE `site_settings` ADD COLUMN `meta_pixel_id` VARCHAR(64) NULL AFTER `tracking_enabled`",
    ],
    [
      "google_measurement_id",
      "ALTER TABLE `site_settings` ADD COLUMN `google_measurement_id` VARCHAR(64) NULL AFTER `meta_pixel_id`",
    ],
    [
      "google_ads_id",
      "ALTER TABLE `site_settings` ADD COLUMN `google_ads_id` VARCHAR(64) NULL AFTER `google_measurement_id`",
    ],
    [
      "meta_capi_access_token",
      "ALTER TABLE `site_settings` ADD COLUMN `meta_capi_access_token` TEXT NULL AFTER `google_ads_id`",
    ],
    [
      "meta_capi_test_event_code",
      "ALTER TABLE `site_settings` ADD COLUMN `meta_capi_test_event_code` VARCHAR(64) NULL AFTER `meta_capi_access_token`",
    ],
    [
      "google_ads_conversion_label",
      "ALTER TABLE `site_settings` ADD COLUMN `google_ads_conversion_label` VARCHAR(128) NULL AFTER `meta_capi_test_event_code`",
    ],
    [
      "google_ads_customer_id",
      "ALTER TABLE `site_settings` ADD COLUMN `google_ads_customer_id` VARCHAR(32) NULL AFTER `google_ads_conversion_label`",
    ],
    [
      "google_enhanced_conversions_api_key",
      "ALTER TABLE `site_settings` ADD COLUMN `google_enhanced_conversions_api_key` TEXT NULL AFTER `google_ads_customer_id`",
    ],
  ];

  for (const [name, sql] of cols) {
    if (!(await columnExists("site_settings", name))) {
      await addColumn(sql, name);
    } else {
      console.log("Exists", name);
    }
  }

  if (!(await tableExists("page_visits"))) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE \`page_visits\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`path\` VARCHAR(512) NOT NULL,
        \`referrer\` VARCHAR(512) NULL,
        \`country\` VARCHAR(80) NULL,
        \`country_code\` VARCHAR(8) NULL,
        \`device_type\` VARCHAR(32) NULL,
        \`browser\` VARCHAR(64) NULL,
        \`session_id\` VARCHAR(64) NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        KEY \`page_visits_created_at_idx\` (\`created_at\`),
        KEY \`page_visits_country_code_idx\` (\`country_code\`),
        KEY \`page_visits_device_type_idx\` (\`device_type\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log("Created page_visits");
  } else {
    console.log("Exists page_visits");
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
