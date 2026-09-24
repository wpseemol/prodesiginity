import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma";
import { homepageSeedSections } from "./homepageSeed";

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
