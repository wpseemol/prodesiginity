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
  `${ACCESS_SECRET}_refresh_dev_only`;

if (!process.env.JWT_REFRESH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: JWT_REFRESH_SECRET environment variable is missing.");
}

export const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_TTL || "15m";
export const REFRESH_TOKEN_TTL_DAYS = Number(
  process.env.JWT_REFRESH_TTL_DAYS || 7,
);
/** Admin sessions: short-lived refresh (default 1 day). */
export const ADMIN_REFRESH_TTL_DAYS = Number(
  process.env.JWT_ADMIN_REFRESH_TTL_DAYS || 1,
);
/** Employer/staff sessions: default 3 days. */
export const EMPLOYER_REFRESH_TTL_DAYS = Number(
  process.env.JWT_EMPLOYER_REFRESH_TTL_DAYS || 3,
);

const STAFF_ROLES = new Set(["admin", "employer"]);

export type AccessTokenPayload = {
  userId: number;
  email: string;
  username: string;
  role: string;
  type: "access";
};

export type RefreshTokenPayload = {
  userId: number;
  role: string;
  type: "refresh";
  jti: string;
  /** Rotation family — shared across a login chain. */
  fid: string;
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

export function isStaffRole(role: string) {
  return STAFF_ROLES.has(role);
}

export function refreshTtlDaysForRole(role: string): number {
  if (role === "admin") return ADMIN_REFRESH_TTL_DAYS;
  if (role === "employer") return EMPLOYER_REFRESH_TTL_DAYS;
  return REFRESH_TOKEN_TTL_DAYS;
}

/** Parse TTL strings like `15m` / `1h` into cookie Max-Age seconds (fallback 15m). */
export function accessTokenMaxAgeSeconds(): number {
  const raw = ACCESS_TOKEN_TTL.trim();
  const match = /^(\d+)([smhd])$/i.exec(raw);
  if (!match) return 15 * 60;
  const n = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "s") return n;
  if (unit === "m") return n * 60;
  if (unit === "h") return n * 60 * 60;
  if (unit === "d") return n * 24 * 60 * 60;
  return 15 * 60;
}

export function signAccessToken(user: AuthUser) {
  const payload: AccessTokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    type: "access",
  };

  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
    audience: "prodesignity-api",
    issuer: "prodesignity-auth",
  } as jwt.SignOptions);
}

export async function issueTokenPair(
  user: AuthUser,
  familyId?: string,
) {
  const jti = crypto.randomUUID();
  const fid = familyId || crypto.randomUUID();
  const ttlDays = refreshTtlDaysForRole(user.role);

  const refreshPayload: RefreshTokenPayload = {
    userId: user.id,
    role: user.role,
    type: "refresh",
    jti,
    fid,
  };

  const refreshToken = jwt.sign(refreshPayload, REFRESH_SECRET, {
    expiresIn: `${ttlDays}d`,
    audience: "prodesignity-refresh",
    issuer: "prodesignity-auth",
  } as jwt.SignOptions);

  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

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
    refreshExpiresInDays: ttlDays,
  };
}

/**
 * Rotate refresh token. Detects reuse of an already-revoked token and
 * revokes the entire session family (all refresh tokens for that user).
 */
export async function rotateRefreshToken(refreshToken: string) {
  let decoded: RefreshTokenPayload;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_SECRET, {
      audience: "prodesignity-refresh",
      issuer: "prodesignity-auth",
    }) as RefreshTokenPayload;
  } catch {
    // Backward-compat: tokens issued before iss/aud hardening
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET) as RefreshTokenPayload;
    } catch {
      return null;
    }
  }

  if (decoded.type !== "refresh" || !decoded.userId || !decoded.jti) {
    return null;
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  // Reuse of a revoked refresh token ⇒ assume theft ⇒ kill all sessions.
  if (stored?.revokedAt) {
    await revokeAllUserRefreshTokens(stored.userId);
    console.warn(
      `[auth] Refresh token reuse detected for userId=${stored.userId}; all sessions revoked.`,
    );
    return null;
  }

  if (
    !stored ||
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

  // Role downgrade / mismatch invalidates the chain.
  if (decoded.role && decoded.role !== user.role) {
    await revokeAllUserRefreshTokens(user.id);
    return null;
  }

  const tokens = await issueTokenPair(user, decoded.fid);
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
    const decoded = jwt.verify(token, ACCESS_SECRET, {
      audience: "prodesignity-api",
      issuer: "prodesignity-auth",
    }) as AccessTokenPayload;
    if (decoded.type !== "access") return null;
    return decoded;
  } catch {
    // Accept pre-hardening tokens during rollout
    try {
      const decoded = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
      if (decoded.type !== "access") return null;
      return decoded;
    } catch {
      return null;
    }
  }
}
