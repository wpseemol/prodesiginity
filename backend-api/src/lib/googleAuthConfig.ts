import prisma from "./prisma.js";

/**
 * OAuth client ID for "Sign in with Google": the value saved in the admin
 * dashboard wins, GOOGLE_CLIENT_ID in the environment is the fallback.
 */
export async function getGoogleClientId(): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({
    where: { key: "default" },
    select: { googleClientId: true },
  });
  return row?.googleClientId?.trim() || process.env.GOOGLE_CLIENT_ID?.trim() || null;
}
