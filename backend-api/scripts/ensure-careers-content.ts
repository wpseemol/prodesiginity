/**
 * Creates the career_jobs / careers_page tables and seeds the careers page
 * copy and openings the site shipped with. Safe to run more than once: rows
 * an admin has already saved are never overwritten.
 *
 *   pnpm db:ensure-careers-content
 */
import "dotenv/config";
import type { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";
import { DEFAULT_CAREERS_PAGE, DEFAULT_CAREER_JOBS } from "../src/lib/zod/careersContent.js";

const TABLES = [
  `CREATE TABLE IF NOT EXISTS \`career_jobs\` (
    \`id\` INTEGER NOT NULL AUTO_INCREMENT,
    \`title\` VARCHAR(120) NOT NULL,
    \`department\` VARCHAR(80) NOT NULL,
    \`type\` VARCHAR(40) NOT NULL,
    \`location\` VARCHAR(80) NOT NULL,
    \`experience\` VARCHAR(40) NOT NULL,
    \`salary\` VARCHAR(60) NOT NULL,
    \`description\` TEXT NOT NULL,
    \`published\` BOOLEAN NOT NULL DEFAULT true,
    \`sort_order\` INTEGER NOT NULL DEFAULT 0,
    \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updated_at\` DATETIME(3) NOT NULL,
    INDEX \`career_jobs_sort_order_idx\`(\`sort_order\`),
    INDEX \`career_jobs_published_idx\`(\`published\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`careers_page\` (
    \`id\` INTEGER NOT NULL AUTO_INCREMENT,
    \`key\` VARCHAR(32) NOT NULL DEFAULT 'default',
    \`content\` JSON NOT NULL,
    \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updated_at\` DATETIME(3) NOT NULL,
    UNIQUE INDEX \`careers_page_key_key\`(\`key\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
];

async function main() {
  for (const ddl of TABLES) {
    await prisma.$executeRawUnsafe(ddl);
  }

  const page = await prisma.careersPage.findUnique({ where: { key: "default" } });
  if (!page) {
    await prisma.careersPage.create({
      data: { key: "default", content: DEFAULT_CAREERS_PAGE as unknown as Prisma.InputJsonValue },
    });
    console.log("Seeded careers page copy");
  }

  if ((await prisma.careerJob.count()) === 0) {
    await prisma.careerJob.createMany({
      data: DEFAULT_CAREER_JOBS.map((job, index) => ({ ...job, published: true, sortOrder: index + 1 })),
    });
    console.log(`Seeded ${DEFAULT_CAREER_JOBS.length} job openings`);
  }

  console.log("Careers page and job openings tables are up to date.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
