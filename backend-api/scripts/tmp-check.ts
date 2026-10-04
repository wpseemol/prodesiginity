import "dotenv/config";
const { default: prisma } = await import("../src/lib/prisma.js");
const users = await prisma.user.findMany({
  where: { avatarPresetId: { not: null } },
  select: { id: true, username: true, role: true, avatarPresetId: true },
});
console.log(JSON.stringify(users));
const team = await prisma.teamMember.findMany({
  where: { avatarUrl: { startsWith: "/uploads/avatars/" } },
  select: { id: true, name: true, avatarUrl: true },
});
console.log(JSON.stringify(team));
await prisma.$disconnect();
