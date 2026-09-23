import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: JWT_SECRET environment variable is missing.");
}

export const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  JWT_SECRET ||
  "development_access_secret_change_in_prod";

export const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  `${ACCESS_SECRET}_refresh`;

export const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_TTL || "15m";
export const REFRESH_TOKEN_TTL_DAYS = Number(
  process.env.JWT_REFRESH_TTL_DAYS || 7,
);

export type AccessTokenPayload = {
  userId: number;
  email: string;
  username: string;
  role: string;
  type: "access";
};

export type RefreshTokenPayload = {
  userId: number;
  type: "refresh";
  jti: string;
};

export type AuthUser = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  photo?: {
    id: number;
    url: string;
    altText: string | null;
    description: string | null;
    createdAt: Date;
  } | null;
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(user: AuthUser) {
  const payload: AccessTokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    type: "access",
  };

  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL } as jwt.SignOptions);
}

export async function issueTokenPair(user: AuthUser) {
  const jti = crypto.randomUUID();
  const refreshPayload: RefreshTokenPayload = {
    userId: user.id,
    type: "refresh",
    jti,
  };

  const refreshToken = jwt.sign(refreshPayload, REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d`,
  } as jwt.SignOptions);

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt,
    },
  });

  return {
    accessToken: signAccessToken(user),
    refreshToken,
    expiresIn: ACCESS_TOKEN_TTL,
  };
}

export async function rotateRefreshToken(refreshToken: string) {
  let decoded: RefreshTokenPayload;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }

  if (decoded.type !== "refresh" || !decoded.userId) {
    return null;
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (
    !stored ||
    stored.revokedAt ||
    stored.expiresAt.getTime() < Date.now() ||
    stored.userId !== decoded.userId
  ) {
    return null;
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      role: true,
      photo: {
        select: {
          id: true,
          url: true,
          altText: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const tokens = await issueTokenPair(user);
  return { user, ...tokens };
}

export async function revokeRefreshToken(refreshToken: string) {
  try {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Ignore revoke failures for logout UX
  }
}

export async function revokeAllUserRefreshTokens(userId: number) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
    if (decoded.type !== "access") return null;
    return decoded;
  } catch {
    return null;
  }
}
