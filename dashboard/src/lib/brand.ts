/** Same logo files used on the marketing website (copied into dashboard/public). */
export const WEBSITE_LOGOS = {
  light: "/assets/logo/prodesignity-logo-light.svg",
  dark: "/assets/logo/prodesignity-logo-dark.png",
  mark: "/assets/logo/prodesignity-logo.png",
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
