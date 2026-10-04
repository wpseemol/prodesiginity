import "dotenv/config";
import bcrypt from "bcrypt";

const { default: prisma } = await import("../src/lib/prisma.js");
const mode = process.argv[2];

if (mode === "create") {
  await prisma.user.upsert({
    where: { username: "tmp-e2e-admin" },
    update: { password: await bcrypt.hash("TmpAdmin2026x", 10), role: "admin" },
    create: {
      fullName: "Temp E2E Admin",
      username: "tmp-e2e-admin",
      email: "tmp-e2e-admin@example.test",
      password: await bcrypt.hash("TmpAdmin2026x", 10),
      role: "admin",
    },
  });
  const presets = await prisma.avatarPreset.findMany({ select: { id: true, url: true, label: true } });
  console.log("admin ready; presets:", JSON.stringify(presets));
} else if (mode === "delete") {
  const r = await prisma.user.deleteMany({ where: { username: "tmp-e2e-admin" } });
  console.log("deleted", r.count);
}
await prisma.$disconnect();
