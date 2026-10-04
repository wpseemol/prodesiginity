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
 * Only seeds a real admin when ALL of these are set:
 *   SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 * Demo accounts are never created by default.
 */
function buildSeedUsers(): SeedUser[] {
  const username = process.env.SEED_ADMIN_USERNAME?.trim();
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();
  const fullName = process.env.SEED_ADMIN_NAME?.trim() || "Admin";

  if (!username || !email || !password) {
    console.log(
      "Skipping user seed (set SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD to create a real admin).",
    );
    return [];
  }

  return [
    {
      fullName,
      username,
      email,
      password,
      role: "admin",
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

  if (users.length > 0) {
    console.log("\nDashboard login:");
    for (const user of users) {
      console.log(`  Admin → ${user.username} / (your SEED_ADMIN_PASSWORD)`);
    }
  } else {
    console.log(
      "\nNo users seeded. Create staff via Team members (auto login) or set SEED_ADMIN_* env vars.",
    );
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
