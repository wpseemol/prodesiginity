/**
 * Creates the `industries` table when missing and seeds the default
 * industries from prisma/industriesSeedData.json.
 *
 * Existing rows are left untouched so admin edits survive re-runs; pass
 * `--force` to overwrite them with the seed content.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, type Prisma } from "@prisma/client";

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

async function tableExists(table: string) {
  const rows = await prisma.$queryRawUnsafe<{ t?: string }[]>(
    `SHOW TABLES LIKE '${table}'`,
  );
  return rows.length > 0;
}

async function ensureTable() {
  if (await tableExists("industries")) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE \`industries\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`slug\` VARCHAR(120) NOT NULL,
      \`title\` VARCHAR(160) NOT NULL,
      \`headline\` VARCHAR(255) NOT NULL,
      \`icon\` VARCHAR(64) NOT NULL,
      \`tagline\` VARCHAR(255) NOT NULL,
      \`summary\` TEXT NOT NULL,
      \`hero_image\` VARCHAR(512) NULL,
      \`hero_image_alt\` VARCHAR(255) NULL,
      \`intro\` JSON NOT NULL,
      \`audience\` JSON NOT NULL,
      \`challenges\` JSON NOT NULL,
      \`solutions\` JSON NOT NULL,
      \`services\` JSON NOT NULL,
      \`stats\` JSON NOT NULL,
      \`faqs\` JSON NOT NULL,
      \`cta_title\` VARCHAR(200) NULL,
      \`cta_body\` VARCHAR(600) NULL,
      \`accent\` JSON NOT NULL,
      \`seo\` JSON NOT NULL,
      \`sort_order\` INT NOT NULL DEFAULT 0,
      \`published\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`industries_slug_key\` (\`slug\`),
      KEY \`industries_sort_order_idx\` (\`sort_order\`),
      KEY \`industries_published_idx\` (\`published\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  console.log("Created industries");
}

type SeedIndustry = {
  slug: string;
  title: string;
  headline: string;
  icon: string;
  tagline: string;
  summary: string;
  heroImage?: string;
  heroImageAlt?: string;
  intro: unknown;
  audience: unknown;
  challenges: unknown;
  solutions: unknown;
  services: unknown;
  stats: unknown;
  faqs: unknown;
  ctaTitle?: string;
  ctaBody?: string;
  accent: unknown;
  seo: unknown;
  sortOrder?: number;
};

function toRow(s: SeedIndustry, index: number) {
  const json = (value: unknown) => value as Prisma.InputJsonValue;
  return {
    title: s.title,
    headline: s.headline,
    icon: s.icon,
    tagline: s.tagline,
    summary: s.summary,
    heroImage: s.heroImage ?? null,
    heroImageAlt: s.heroImageAlt ?? null,
    intro: json(s.intro),
    audience: json(s.audience),
    challenges: json(s.challenges),
    solutions: json(s.solutions),
    services: json(s.services),
    stats: json(s.stats),
    faqs: json(s.faqs),
    ctaTitle: s.ctaTitle ?? null,
    ctaBody: s.ctaBody ?? null,
    accent: json(s.accent),
    seo: json(s.seo),
    sortOrder: s.sortOrder ?? index + 1,
  };
}

async function main() {
  const force = process.argv.includes("--force");
  await ensureTable();

  const seedPath = path.join(process.cwd(), "prisma", "industriesSeedData.json");
  if (!fs.existsSync(seedPath)) {
    console.error(
      "Missing prisma/industriesSeedData.json — run npm run industries:export-seed first",
    );
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(seedPath, "utf8")) as {
    industries: SeedIndustry[];
  };

  for (let i = 0; i < raw.industries.length; i++) {
    const s = raw.industries[i];
    const row = toRow(s, i);
    await prisma.industry.upsert({
      where: { slug: s.slug },
      create: { slug: s.slug, ...row, published: true },
      update: force ? row : {},
    });
    console.log("industry:", s.slug);
  }

  await prisma.$disconnect();
  console.log("Industries seed complete");
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
