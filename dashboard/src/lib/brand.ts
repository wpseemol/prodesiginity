import { mediaUrl } from "@/config";

/** Website logos served from backend /uploads/assets/logo */
export const WEBSITE_LOGOS = {
  light: "/uploads/assets/logo/prodesignity-logo-light.svg",
  dark: "/uploads/assets/logo/prodesignity-logo-dark.png",
  mark: "/uploads/assets/logo/prodesignity-logo.png",
} as const;

export const WEBSITE_LOGO_URLS = {
  light: mediaUrl(WEBSITE_LOGOS.light)!,
  dark: mediaUrl(WEBSITE_LOGOS.dark)!,
  mark: mediaUrl(WEBSITE_LOGOS.mark)!,
} as const;

export const DEFAULT_SITE_SETTINGS = {
  siteName: "ProDesignity",
  loginTitle: "Sign in to your account",
  loginSubtitle:
    "Use your username or email to access the ProDesignity dashboard.",
  loginBadgeText: "Staff portal",
  /** null = use website logo (WEBSITE_LOGOS) */
  loginLogoUrl: null as string | null,
  faviconUrl: null as string | null,
} as const;
