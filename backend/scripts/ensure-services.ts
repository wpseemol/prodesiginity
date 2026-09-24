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

async function ensureTables() {
  if (!(await tableExists("service_groups"))) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE \`service_groups\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`slug\` VARCHAR(80) NOT NULL,
        \`title\` VARCHAR(160) NOT NULL,
        \`blurb\` VARCHAR(512) NOT NULL,
        \`icon\` VARCHAR(64) NOT NULL,
        \`sort_order\` INT NOT NULL DEFAULT 0,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`service_groups_slug_key\` (\`slug\`),
        KEY \`service_groups_sort_order_idx\` (\`sort_order\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log("Created service_groups");
  }

  if (!(await tableExists("services"))) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE \`services\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`slug\` VARCHAR(120) NOT NULL,
        \`title\` VARCHAR(200) NOT NULL,
        \`group_id\` INT NOT NULL,
        \`icon\` VARCHAR(64) NOT NULL,
        \`tagline\` VARCHAR(255) NOT NULL,
        \`summary\` TEXT NOT NULL,
        \`intro\` JSON NOT NULL,
        \`deliverables\` JSON NOT NULL,
        \`ideal_for\` JSON NOT NULL,
        \`process\` JSON NOT NULL,
        \`faqs\` JSON NOT NULL,
        \`timeline\` VARCHAR(120) NOT NULL,
        \`starting_at\` VARCHAR(120) NOT NULL,
        \`accent\` JSON NOT NULL,
        \`seo\` JSON NOT NULL,
        \`sort_order\` INT NOT NULL DEFAULT 0,
        \`published\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`services_slug_key\` (\`slug\`),
        KEY \`services_group_id_idx\` (\`group_id\`),
        KEY \`services_sort_order_idx\` (\`sort_order\`),
        KEY \`services_published_idx\` (\`published\`),
        CONSTRAINT \`services_group_id_fkey\` FOREIGN KEY (\`group_id\`) REFERENCES \`service_groups\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log("Created services");
  }
}

type SeedGroup = {
  slug: string;
  title: string;
  blurb: string;
  icon: string;
};

type SeedService = {
  slug: string;
  title: string;
  group: string;
  icon: string;
  tagline: string;
  summary: string;
  intro: string[];
  deliverables: string[];
  idealFor: string[];
  process: unknown;
  faqs: unknown;
  timeline: string;
  startingAt: string;
  accent: unknown;
  seo: unknown;
  sortOrder?: number;
};

async function main() {
  await ensureTables();

  const seedPath = path.join(process.cwd(), "prisma", "servicesSeedData.json");
  if (!fs.existsSync(seedPath)) {
    console.error("Missing prisma/servicesSeedData.json — run export script first");
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(seedPath, "utf8")) as {
    groups: SeedGroup[];
    services: SeedService[];
  };

  const groupIdBySlug = new Map<string, number>();

  for (let i = 0; i < raw.groups.length; i++) {
    const g = raw.groups[i];
    const row = await prisma.serviceGroup.upsert({
      where: { slug: g.slug },
      create: {
        slug: g.slug,
        title: g.title,
        blurb: g.blurb,
        icon: g.icon,
        sortOrder: i + 1,
      },
      update: {
        title: g.title,
        blurb: g.blurb,
        icon: g.icon,
        sortOrder: i + 1,
      },
    });
    groupIdBySlug.set(g.slug, row.id);
    console.log("group:", g.slug);
  }

  for (let i = 0; i < raw.services.length; i++) {
    const s = raw.services[i];
    const groupId = groupIdBySlug.get(s.group);
    if (!groupId) {
      console.warn("skip service (unknown group):", s.slug, s.group);
      continue;
    }
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        title: s.title,
        groupId,
        icon: s.icon,
        tagline: s.tagline,
        summary: s.summary,
        intro: s.intro as Prisma.InputJsonValue,
        deliverables: s.deliverables as Prisma.InputJsonValue,
        idealFor: s.idealFor as Prisma.InputJsonValue,
        process: s.process as Prisma.InputJsonValue,
        faqs: s.faqs as Prisma.InputJsonValue,
        timeline: s.timeline,
        startingAt: s.startingAt,
        accent: s.accent as Prisma.InputJsonValue,
        seo: s.seo as Prisma.InputJsonValue,
        sortOrder: s.sortOrder ?? i + 1,
        published: true,
      },
      update: {
        title: s.title,
        groupId,
        icon: s.icon,
        tagline: s.tagline,
        summary: s.summary,
        intro: s.intro as Prisma.InputJsonValue,
        deliverables: s.deliverables as Prisma.InputJsonValue,
        idealFor: s.idealFor as Prisma.InputJsonValue,
        process: s.process as Prisma.InputJsonValue,
        faqs: s.faqs as Prisma.InputJsonValue,
        timeline: s.timeline,
        startingAt: s.startingAt,
        accent: s.accent as Prisma.InputJsonValue,
        seo: s.seo as Prisma.InputJsonValue,
        sortOrder: s.sortOrder ?? i + 1,
        published: true,
      },
    });
    console.log("service:", s.slug);
  }

  await prisma.$disconnect();
  console.log("Services seed complete");
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
