import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { signAccessToken } from "../src/lib/tokens.js";

const username = process.argv[2] ?? "pitul";
const u = await prisma.user.findUniqueOrThrow({ where: { username } });
const user = { id: u.id, fullName: u.fullName, username: u.username, email: u.email, role: u.role };
console.log(JSON.stringify({ token: signAccessToken(user), user }));
await prisma.$disconnect();
