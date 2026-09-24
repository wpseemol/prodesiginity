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

const teamSeed = [
  {
    slug: "Abdullah-Pitul",
    name: "Abdullah Pitul",
    role: "Founder & 3D Product Designer",
    tagline: "Building ProDesignity since 2019",
    photoUrl: "/uploads/assets/images/team/pitul.jpg",
    isLead: true,
    sortOrder: 1,
  },
  {
    slug: "Shajjad-Shagor",
    name: "Shajjad Shagor",
    role: "Shopify Developer",
    photoUrl: "/uploads/assets/images/team/shajjad.jpg",
    isLead: false,
    sortOrder: 2,
  },
  {
    slug: "Yeasin-Iqbal",
    name: "Yeasin Iqbal",
    role: "3D Product design & Modeling",
    photoUrl: "/uploads/assets/images/team/yeasin.jpg",
    isLead: false,
    sortOrder: 3,
  },
  {
    slug: "Antor-Halder",
    name: "Antor Halder",
    role: "2D Artist & Animator",
    photoUrl: "/uploads/assets/images/team/antor.jpg",
    isLead: false,
    sortOrder: 4,
  },
  {
    slug: "Syedal-Nasif",
    name: "Syedal Nasif",
    role: "HR",
    photoUrl: "/uploads/assets/images/team/nasif-change.jpg",
    isLead: false,
    sortOrder: 5,
  },
  {
    slug: "Asif-Iqbol-Suzon",
    name: "Asif Iqbol Suzon",
    role: "Graphic Designer",
    photoUrl: "/uploads/assets/images/team/asif.jpg",
    isLead: false,
    sortOrder: 6,
  },
  {
    slug: "Shahariar",
    name: "Shahariar",
    role: "Advertising and marketing SEO",
    photoUrl: "/uploads/assets/images/team/shahariar.jpg",
    isLead: false,
    sortOrder: 7,
  },
  {
    slug: "Seemol-Chakroborti",
    name: "Seemol Chakroborti",
    role: "Web Developer & Designer",
    photoUrl: "/uploads/assets/images/team/seemol.jpg",
    isLead: false,
    sortOrder: 8,
  },
];

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`team_members\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`slug\` VARCHAR(80) NOT NULL,
      \`name\` VARCHAR(120) NOT NULL,
      \`role\` VARCHAR(160) NOT NULL,
      \`tagline\` VARCHAR(255) NULL,
      \`photo_url\` VARCHAR(512) NOT NULL,
      \`is_lead\` TINYINT(1) NOT NULL DEFAULT 0,
      \`sort_order\` INT NOT NULL DEFAULT 0,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`team_members_slug_key\` (\`slug\`),
      KEY \`team_members_sort_order_idx\` (\`sort_order\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`site_settings\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`key\` VARCHAR(32) NOT NULL DEFAULT 'default',
      \`site_name\` VARCHAR(120) NULL,
      \`favicon_url\` VARCHAR(512) NULL,
      \`login_title\` VARCHAR(160) NULL,
      \`login_subtitle\` VARCHAR(255) NULL,
      \`login_badge_text\` VARCHAR(80) NULL,
      \`login_logo_url\` VARCHAR(512) NULL,
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`site_settings_key_key\` (\`key\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  console.log("Tables ready");

  for (const member of teamSeed) {
    await prisma.teamMember.upsert({
      where: { slug: member.slug },
      create: member,
      update: {},
    });
    console.log("team:", member.slug);
  }

  await prisma.siteSetting.upsert({
    where: { key: "default" },
    create: {
      key: "default",
      siteName: "ProDesignity",
      loginTitle: "Sign in to your account",
      loginSubtitle:
        "Use your username or email to access the ProDesignity dashboard.",
      loginBadgeText: "Staff portal",
    },
    update: {},
  });
  console.log("site settings ready");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
