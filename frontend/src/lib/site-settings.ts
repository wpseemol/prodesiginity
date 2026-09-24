import { apiBaseUrl, mediaUrl } from "@/config/api";
import { siteConfig, type SiteConfig } from "@/config/site";

type PublicSiteConfigPatch = Partial<{
  name: string;
  legalName: string;
  domain: string;
  url: string;
  logo: string;
  ogImage: string;
  founded: string;
  tagline: string;
  description: string;
  email: string;
  privacyEmail: string;
  phone: string;
  whatsapp: string;
  contactPath: string;
  address: Partial<SiteConfig["address"]>;
  social: Partial<SiteConfig["social"]>;
  serviceAreas: string[];
  languages: string[];
  priceRange: string;
  legal: Partial<SiteConfig["legal"]>;
}>;

type PublicSettingsResponse = {
  settings?: {
    siteName?: string | null;
    faviconUrl?: string | null;
    siteConfig?: PublicSiteConfigPatch | null;
  };
};

function mergeSiteConfig(patch?: PublicSiteConfigPatch | null): SiteConfig {
  const p = patch && typeof patch === "object" ? patch : {};
  return {
    ...siteConfig,
    ...p,
    name: p.name || siteConfig.name,
    legalName: p.legalName || siteConfig.legalName,
    domain: p.domain || siteConfig.domain,
    url: p.url || siteConfig.url,
    logo: p.logo || siteConfig.logo,
    ogImage: p.ogImage || siteConfig.ogImage,
    founded: p.founded || siteConfig.founded,
    tagline: p.tagline || siteConfig.tagline,
    description: p.description || siteConfig.description,
    email: p.email || siteConfig.email,
    privacyEmail: p.privacyEmail || siteConfig.privacyEmail,
    phone: p.phone || siteConfig.phone,
    whatsapp: p.whatsapp || siteConfig.whatsapp,
    contactPath: p.contactPath || siteConfig.contactPath,
    priceRange: p.priceRange || siteConfig.priceRange,
    address: { ...siteConfig.address, ...(p.address ?? {}) },
    social: { ...siteConfig.social, ...(p.social ?? {}) },
    legal: { ...siteConfig.legal, ...(p.legal ?? {}) },
    serviceAreas:
      Array.isArray(p.serviceAreas) && p.serviceAreas.length > 0
        ? p.serviceAreas
        : siteConfig.serviceAreas,
    languages:
      Array.isArray(p.languages) && p.languages.length > 0
        ? p.languages
        : siteConfig.languages,
    // Keep app-only keys from the static config.
    loginPath: siteConfig.loginPath,
    dashboardPath: siteConfig.dashboardPath,
    staffPortal: siteConfig.staffPortal,
    login: siteConfig.login,
  };
}

/**
 * Resolve site branding/SEO from the API (admin settings).
 * Falls back to static `siteConfig` when the API is unreachable.
 */
export async function getResolvedSiteConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch(`${apiBaseUrl}/settings`, {
      cache: "no-store",
    });
    if (!res.ok) return siteConfig;
    const data = (await res.json()) as PublicSettingsResponse;
    const merged = mergeSiteConfig(data.settings?.siteConfig);
    if (data.settings?.siteName?.trim()) {
      merged.name = data.settings.siteName.trim();
    }
    return merged;
  } catch {
    return siteConfig;
  }
}

/** Absolute URL for logos / OG images (API uploads or site paths). */
export function absoluteMediaUrl(
  path: string,
  baseUrl: string = siteConfig.url,
): string {
  if (/^https?:\/\//i.test(path)) return path;
  const resolved = mediaUrl(path) ?? path;
  if (/^https?:\/\//i.test(resolved)) return resolved;
  return new URL(resolved, baseUrl).toString();
}

export function seoTitle(config: SiteConfig, pageTitle?: string): string {
  const brand = `${config.name} | E-commerce Growth Partner`;
  return pageTitle ? `${pageTitle} | ${config.name}` : brand;
}
