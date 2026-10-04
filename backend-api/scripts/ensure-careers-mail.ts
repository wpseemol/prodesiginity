/**
 * Creates the careers / blocked-email / notifications / mail-settings tables
 * and the users.google_id column. Safe to run more than once.
 *
 *   pnpm db:ensure-careers
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

async function columnExists(table: string, column: string) {
  const rows = await prisma.$queryRawUnsafe<{ Field: string }[]>(
    `SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`,
  );
  return rows.length > 0;
}

async function indexExists(table: string, index: string) {
  const rows = await prisma.$queryRawUnsafe<{ Key_name: string }[]>(
    `SHOW INDEX FROM \`${table}\` WHERE Key_name = '${index}'`,
  );
  return rows.length > 0;
}

const TABLES = [
  `CREATE TABLE IF NOT EXISTS \`job_applications\` (
    \`id\` INTEGER NOT NULL AUTO_INCREMENT,
    \`name\` VARCHAR(80) NOT NULL,
    \`email\` VARCHAR(254) NOT NULL,
    \`phone\` VARCHAR(20) NOT NULL,
    \`city\` VARCHAR(60) NOT NULL,
    \`job_title\` VARCHAR(120) NOT NULL,
    \`experience\` VARCHAR(20) NOT NULL,
    \`portfolio_url\` VARCHAR(300) NULL,
    \`cover_letter\` TEXT NULL,
    \`resume_file\` VARCHAR(120) NOT NULL,
    \`resume_name\` VARCHAR(160) NOT NULL,
    \`resume_mime\` VARCHAR(100) NOT NULL,
    \`resume_size\` INTEGER NOT NULL,
    \`status\` VARCHAR(20) NOT NULL DEFAULT 'new',
    \`rating\` TINYINT NULL,
    \`notes\` TEXT NULL,
    \`ip_hash\` VARCHAR(64) NULL,
    \`user_agent\` VARCHAR(255) NULL,
    \`read_at\` DATETIME(3) NULL,
    \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updated_at\` DATETIME(3) NOT NULL,
    INDEX \`job_applications_status_idx\`(\`status\`),
    INDEX \`job_applications_created_at_idx\`(\`created_at\`),
    INDEX \`job_applications_email_idx\`(\`email\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`application_replies\` (
    \`id\` INTEGER NOT NULL AUTO_INCREMENT,
    \`application_id\` INTEGER NOT NULL,
    \`subject\` VARCHAR(200) NOT NULL,
    \`body\` TEXT NOT NULL,
    \`status\` VARCHAR(16) NOT NULL,
    \`provider\` VARCHAR(16) NULL,
    \`error\` VARCHAR(500) NULL,
    \`sent_by_id\` INTEGER NULL,
    \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX \`application_replies_application_id_idx\`(\`application_id\`),
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`application_replies_application_id_fkey\` FOREIGN KEY (\`application_id\`)
      REFERENCES \`job_applications\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`application_replies_sent_by_id_fkey\` FOREIGN KEY (\`sent_by_id\`)
      REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`notifications\` (
    \`id\` INTEGER NOT NULL AUTO_INCREMENT,
    \`user_id\` INTEGER NULL,
    \`type\` VARCHAR(40) NOT NULL,
    \`title\` VARCHAR(160) NOT NULL,
    \`body\` VARCHAR(500) NULL,
    \`link\` VARCHAR(255) NULL,
    \`read_at\` DATETIME(3) NULL,
    \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX \`notifications_user_id_read_at_idx\`(\`user_id\`, \`read_at\`),
    INDEX \`notifications_created_at_idx\`(\`created_at\`),
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`notifications_user_id_fkey\` FOREIGN KEY (\`user_id\`)
      REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`mail_settings\` (
    \`id\` INTEGER NOT NULL AUTO_INCREMENT,
    \`key\` VARCHAR(32) NOT NULL DEFAULT 'default',
    \`provider\` VARCHAR(16) NOT NULL DEFAULT 'none',
    \`from_name\` VARCHAR(120) NULL,
    \`from_email\` VARCHAR(254) NULL,
    \`reply_to\` VARCHAR(254) NULL,
    \`notify_email\` VARCHAR(254) NULL,
    \`resend_api_key\` TEXT NULL,
    \`smtp_preset\` VARCHAR(32) NULL,
    \`smtp_host\` VARCHAR(255) NULL,
    \`smtp_port\` INTEGER NULL,
    \`smtp_secure\` BOOLEAN NOT NULL DEFAULT false,
    \`smtp_user\` VARCHAR(254) NULL,
    \`smtp_pass\` TEXT NULL,
    \`careers_auto_reply\` BOOLEAN NOT NULL DEFAULT true,
    \`notify_on_application\` BOOLEAN NOT NULL DEFAULT true,
    \`last_test_at\` DATETIME(3) NULL,
    \`last_test_ok\` BOOLEAN NULL,
    \`last_error\` VARCHAR(500) NULL,
    \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updated_at\` DATETIME(3) NOT NULL,
    UNIQUE INDEX \`mail_settings_key_key\`(\`key\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`blocked_emails\` (
    \`id\` INTEGER NOT NULL AUTO_INCREMENT,
    \`email\` VARCHAR(254) NOT NULL,
    \`reason\` VARCHAR(255) NULL,
    \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX \`blocked_emails_email_key\`(\`email\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
];

async function main() {
  if (!(await columnExists("users", "google_id"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `users` ADD COLUMN `google_id` VARCHAR(64) NULL AFTER `password`",
    );
    console.log("Added users.google_id");
  }
  if (!(await indexExists("users", "users_google_id_key"))) {
    await prisma.$executeRawUnsafe(
      "CREATE UNIQUE INDEX `users_google_id_key` ON `users`(`google_id`)",
    );
  }

  for (const ddl of TABLES) {
    await prisma.$executeRawUnsafe(ddl);
  }

  console.log("Careers, blocked emails, notifications and mail settings tables are up to date.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
