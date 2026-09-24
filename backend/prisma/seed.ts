import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma.js";
import { homepageSeedSections } from "./homepageSeed.js";

const demoUsers = [
  {
    fullName: "Demo Admin",
    username: "admin",
    email: "admin@prodesignity.com",
    password: "DemoAdmin1!",
    role: "admin" as const,
  },
  {
    fullName: "Demo Employee",
    username: "employee",
    email: "employee@prodesignity.com",
    password: "DemoEmployee1!",
    role: "employer" as const,
  },
];

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
  for (const user of demoUsers) {
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
  await seedUsers();
  await seedHomepage();

  console.log("\nDemo credentials:");
  console.log("  Admin    → admin / DemoAdmin1!");
  console.log("  Employee → employee / DemoEmployee1!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
