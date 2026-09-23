import { Request, Response, NextFunction } from "express";
import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { updateSiteSettingsSchema } from "../lib/zod/team";
import {
  DEFAULT_SITE_CONFIG,
  mergeSiteConfig,
} from "../lib/zod/siteConfig";
import { publicSiteUploadPath } from "../lib/uploads";
import type { AuthRequest } from "../middleware/auth";

const SETTINGS_KEY = "default";

const publicSettingsSelect = {
  siteName: true,
  faviconUrl: true,
  loginTitle: true,
  loginSubtitle: true,
  loginBadgeText: true,
  loginLogoUrl: true,
  trackingEnabled: true,
  metaPixelId: true,
  googleMeasurementId: true,
  googleAdsId: true,
  siteConfig: true,
} as const;

const adminSettingsSelect = {
  id: true,
  key: true,
  siteName: true,
  faviconUrl: true,
  loginTitle: true,
  loginSubtitle: true,
  loginBadgeText: true,
  loginLogoUrl: true,
  trackingEnabled: true,
  metaPixelId: true,
  googleMeasurementId: true,
  googleAdsId: true,
  metaCapiAccessToken: true,
  metaCapiTestEventCode: true,
  googleAdsConversionLabel: true,
  googleAdsCustomerId: true,
  googleEnhancedConversionsApiKey: true,
  siteConfig: true,
  updatedAt: true,
} as const;

function emptyToNull(value: string | undefined) {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function maskSecret(value: string | null | undefined) {
  if (!value) return null;
  if (value.length <= 4) return "••••";
  return `••••${value.slice(-4)}`;
}

function toAdminSettingsPayload(
  row: Awaited<ReturnType<typeof getOrCreateSettingsAdmin>>,
) {
  const siteConfig = mergeSiteConfig(row.siteConfig);
  return {
    id: row.id,
    siteName: row.siteName ?? siteConfig.name,
    faviconUrl: row.faviconUrl,
    loginTitle: row.loginTitle,
    loginSubtitle: row.loginSubtitle,
    loginBadgeText: row.loginBadgeText,
    loginLogoUrl: row.loginLogoUrl,
    trackingEnabled: row.trackingEnabled,
    metaPixelId: row.metaPixelId,
    googleMeasurementId: row.googleMeasurementId,
    googleAdsId: row.googleAdsId,
    metaCapiTestEventCode: row.metaCapiTestEventCode,
    googleAdsConversionLabel: row.googleAdsConversionLabel,
    googleAdsCustomerId: row.googleAdsCustomerId,
    metaCapiAccessTokenSet: Boolean(row.metaCapiAccessToken),
    metaCapiAccessTokenMasked: maskSecret(row.metaCapiAccessToken),
    googleEnhancedConversionsApiKeySet: Boolean(
      row.googleEnhancedConversionsApiKey,
    ),
    googleEnhancedConversionsApiKeyMasked: maskSecret(
      row.googleEnhancedConversionsApiKey,
    ),
    siteConfig,
    updatedAt: row.updatedAt,
  };
}

function toPublicSettingsPayload(
  row: Awaited<ReturnType<typeof getOrCreateSettingsPublic>>,
) {
  const siteConfig = mergeSiteConfig(row.siteConfig);
  return {
    siteName: row.siteName ?? siteConfig.name,
    faviconUrl: row.faviconUrl,
    loginTitle: row.loginTitle,
    loginSubtitle: row.loginSubtitle,
    loginBadgeText: row.loginBadgeText,
    loginLogoUrl: row.loginLogoUrl,
    trackingEnabled: row.trackingEnabled,
    metaPixelId: row.metaPixelId,
    googleMeasurementId: row.googleMeasurementId,
    googleAdsId: row.googleAdsId,
    siteConfig,
  };
}

async function getOrCreateSettingsPublic() {
  return prisma.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      siteName: DEFAULT_SITE_CONFIG.name,
      loginTitle: "Sign in to your account",
      loginSubtitle:
        "Use your username or email to access the ProDesignity dashboard.",
      loginBadgeText: "Staff portal",
      siteConfig: DEFAULT_SITE_CONFIG as unknown as Prisma.InputJsonValue,
    },
    update: {},
    select: publicSettingsSelect,
  });
}

async function getOrCreateSettingsAdmin() {
  return prisma.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      siteName: DEFAULT_SITE_CONFIG.name,
      loginTitle: "Sign in to your account",
      loginSubtitle:
        "Use your username or email to access the ProDesignity dashboard.",
      loginBadgeText: "Staff portal",
      siteConfig: DEFAULT_SITE_CONFIG as unknown as Prisma.InputJsonValue,
    },
    update: {},
    select: adminSettingsSelect,
  });
}

/** Public branding + site config + browser tracking IDs (never secrets). */
export const getPublicSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await getOrCreateSettingsPublic();
    return res.status(200).json({ settings: toPublicSettingsPayload(settings) });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({ message: "Failed to load site settings" });
  }
};

export const getAdminSettings = async (_req: AuthRequest, res: Response) => {
  try {
    const settings = await getOrCreateSettingsAdmin();
    return res.status(200).json({ settings: toAdminSettingsPayload(settings) });
  } catch (error) {
    console.error("Get admin settings error:", error);
    return res.status(500).json({ message: "Failed to load site settings" });
  }
};

export const updateSiteSettings = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateSiteSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid settings",
      });
    }

    const data = parsed.data;
    const hasUpdate =
      data.siteName !== undefined ||
      data.loginTitle !== undefined ||
      data.loginSubtitle !== undefined ||
      data.loginBadgeText !== undefined ||
      data.useWebsiteLogo !== undefined ||
      data.trackingEnabled !== undefined ||
      data.metaPixelId !== undefined ||
      data.googleMeasurementId !== undefined ||
      data.googleAdsId !== undefined ||
      data.metaCapiAccessToken !== undefined ||
      data.clearMetaCapiAccessToken === true ||
      data.metaCapiTestEventCode !== undefined ||
      data.googleAdsConversionLabel !== undefined ||
      data.googleAdsCustomerId !== undefined ||
      data.googleEnhancedConversionsApiKey !== undefined ||
      data.clearGoogleEnhancedConversionsApiKey === true ||
      data.siteConfig !== undefined;

    if (!hasUpdate) {
      return res.status(400).json({ message: "No settings to update" });
    }

    const existing = await getOrCreateSettingsAdmin();

    const metaToken =
      data.clearMetaCapiAccessToken === true
        ? null
        : data.metaCapiAccessToken && data.metaCapiAccessToken.trim()
          ? data.metaCapiAccessToken.trim()
          : undefined;
    const googleKey =
      data.clearGoogleEnhancedConversionsApiKey === true
        ? null
        : data.googleEnhancedConversionsApiKey &&
            data.googleEnhancedConversionsApiKey.trim()
          ? data.googleEnhancedConversionsApiKey.trim()
          : undefined;

    let nextSiteConfig: Prisma.InputJsonValue | undefined;
    let syncedSiteName: string | undefined;
    if (data.siteConfig !== undefined) {
      const merged = mergeSiteConfig({
        ...mergeSiteConfig(existing.siteConfig),
        ...data.siteConfig,
        address: {
          ...mergeSiteConfig(existing.siteConfig).address,
          ...(data.siteConfig.address ?? {}),
        },
        social: {
          ...mergeSiteConfig(existing.siteConfig).social,
          ...(data.siteConfig.social ?? {}),
        },
        legal: {
          ...mergeSiteConfig(existing.siteConfig).legal,
          ...(data.siteConfig.legal ?? {}),
        },
      });
      nextSiteConfig = merged as unknown as Prisma.InputJsonValue;
      if (data.siteConfig.name !== undefined) {
        syncedSiteName = merged.name;
      }
    }

    const settings = await prisma.siteSetting.update({
      where: { key: SETTINGS_KEY },
      data: {
        ...(data.siteName !== undefined
          ? { siteName: data.siteName }
          : syncedSiteName !== undefined
            ? { siteName: syncedSiteName }
            : {}),
        ...(data.loginTitle !== undefined
          ? { loginTitle: data.loginTitle }
          : {}),
        ...(data.loginSubtitle !== undefined
          ? { loginSubtitle: data.loginSubtitle }
          : {}),
        ...(data.loginBadgeText !== undefined
          ? { loginBadgeText: data.loginBadgeText }
          : {}),
        ...(data.useWebsiteLogo === true ? { loginLogoUrl: null } : {}),
        ...(data.trackingEnabled !== undefined
          ? { trackingEnabled: data.trackingEnabled }
          : {}),
        ...(data.metaPixelId !== undefined
          ? { metaPixelId: emptyToNull(data.metaPixelId) }
          : {}),
        ...(data.googleMeasurementId !== undefined
          ? { googleMeasurementId: emptyToNull(data.googleMeasurementId) }
          : {}),
        ...(data.googleAdsId !== undefined
          ? { googleAdsId: emptyToNull(data.googleAdsId) }
          : {}),
        ...(metaToken !== undefined ? { metaCapiAccessToken: metaToken } : {}),
        ...(data.metaCapiTestEventCode !== undefined
          ? { metaCapiTestEventCode: emptyToNull(data.metaCapiTestEventCode) }
          : {}),
        ...(data.googleAdsConversionLabel !== undefined
          ? {
              googleAdsConversionLabel: emptyToNull(
                data.googleAdsConversionLabel,
              ),
            }
          : {}),
        ...(data.googleAdsCustomerId !== undefined
          ? { googleAdsCustomerId: emptyToNull(data.googleAdsCustomerId) }
          : {}),
        ...(googleKey !== undefined
          ? { googleEnhancedConversionsApiKey: googleKey }
          : {}),
        ...(nextSiteConfig !== undefined ? { siteConfig: nextSiteConfig } : {}),
      },
      select: adminSettingsSelect,
    });

    return res.status(200).json({
      message: "Site settings updated",
      settings: toAdminSettingsPayload(settings),
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({ message: "Failed to update site settings" });
  }
};

export const uploadFavicon = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Favicon file is required" });
    }
    await getOrCreateSettingsAdmin();
    const faviconUrl = publicSiteUploadPath(req.file.filename);
    const settings = await prisma.siteSetting.update({
      where: { key: SETTINGS_KEY },
      data: { faviconUrl },
      select: adminSettingsSelect,
    });
    return res.status(200).json({
      message: "Favicon updated",
      settings: toAdminSettingsPayload(settings),
    });
  } catch (error) {
    console.error("Upload favicon error:", error);
    return res.status(500).json({ message: "Failed to upload favicon" });
  }
};

export const uploadLoginLogo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Logo file is required" });
    }
    await getOrCreateSettingsAdmin();
    const loginLogoUrl = publicSiteUploadPath(req.file.filename);
    const settings = await prisma.siteSetting.update({
      where: { key: SETTINGS_KEY },
      data: { loginLogoUrl },
      select: adminSettingsSelect,
    });
    return res.status(200).json({
      message: "Login logo updated",
      settings: toAdminSettingsPayload(settings),
    });
  } catch (error) {
    console.error("Upload login logo error:", error);
    return res.status(500).json({ message: "Failed to upload login logo" });
  }
};

export function settingsUploadErrorHandler(
  err: unknown,
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!err) return next();
  if (err instanceof Error) {
    if ((err as { code?: string }).code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File is too large" });
    }
    return res.status(400).json({ message: err.message || "Upload failed" });
  }
  return res.status(400).json({ message: "Upload failed" });
}
