import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma.js";
import { homepageSeedSections } from "./homepageSeed.js";

type SeedUser = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "employer";
};

/**
 * Demo defaults for local/dev. On production, set SEED_* env vars
 * (and preferably change passwords after first login).
 */
function buildSeedUsers(): SeedUser[] {
  return [
    {
      fullName: process.env.SEED_ADMIN_NAME ?? "Demo Admin",
      username: process.env.SEED_ADMIN_USERNAME ?? "admin",
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@prodesignity.com",
      password: process.env.SEED_ADMIN_PASSWORD ?? "DemoAdmin1!",
      role: "admin",
    },
    {
      fullName: process.env.SEED_EMPLOYEE_NAME ?? "Demo Employee",
      username: process.env.SEED_EMPLOYEE_USERNAME ?? "employee",
      email: process.env.SEED_EMPLOYEE_EMAIL ?? "employee@prodesignity.com",
      password: process.env.SEED_EMPLOYEE_PASSWORD ?? "DemoEmployee1!",
      role: "employer",
    },
  ];
}

async function waitForDb(retries = 8) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (error) {
      lastError = error;
      console.warn(
        `DB not ready (attempt ${attempt}/${retries}). Is MySQL running?`,
      );
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Could not connect to the database");
}

async function seedUsers() {
  const users = buildSeedUsers();

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        username: user.username,
        password: hashedPassword,
        role: user.role,
      },
      create: {
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });

    console.log(`Seeded ${user.role}: ${user.username} / ${user.email}`);
  }

  return users;
}

async function seedHomepage() {
  for (const section of homepageSeedSections) {
    await prisma.homePageSection.upsert({
      where: { key: section.key },
      update: {
        label: section.label,
        content: section.content as object,
      },
      create: {
        key: section.key,
        label: section.label,
        content: section.content as object,
      },
    });
    console.log(`Seeded homepage section: ${section.key}`);
  }
}

async function main() {
  console.log("Connecting to database…");
  await waitForDb();
  const users = await seedUsers();
  await seedHomepage();

  console.log("\nDashboard login credentials (https://dashboard.prodesignity.com):");
  for (const user of users) {
    const label = user.role === "admin" ? "Admin   " : "Employee";
    console.log(`  ${label} → ${user.username} / ${user.password}`);
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
