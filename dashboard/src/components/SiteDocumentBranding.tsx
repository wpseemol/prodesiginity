import { useEffect } from "react";
import { apiBaseUrl } from "@/config";
import {
  applyDocumentFavicon,
  applyDocumentTitle,
} from "@/lib/documentBranding";

type PublicSettings = {
  siteName?: string | null;
  faviconUrl?: string | null;
};

/**
 * Loads public site settings once and applies favicon + tab title
 * everywhere in the dashboard (login + authenticated pages).
 */
export function SiteDocumentBranding() {
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/settings`);
        const data = (await res.json()) as { settings?: PublicSettings };
        if (cancelled || !res.ok || !data.settings) {
          applyDocumentFavicon(null);
          return;
        }
        applyDocumentFavicon(data.settings.faviconUrl);
        applyDocumentTitle(data.settings.siteName);
      } catch {
        applyDocumentFavicon(null);
      }
    })();

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<PublicSettings>).detail;
      if (!detail) return;
      if ("faviconUrl" in detail) applyDocumentFavicon(detail.faviconUrl);
      if ("siteName" in detail) applyDocumentTitle(detail.siteName);
    };

    window.addEventListener("site-branding-updated", onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("site-branding-updated", onUpdated);
    };
  }, []);

  return null;
}

/** Call after admin saves favicon / site name so the tab updates live. */
export function notifySiteBrandingUpdated( partial: {
  faviconUrl?: string | null;
  siteName?: string | null;
}) {
  window.dispatchEvent(
    new CustomEvent("site-branding-updated", { detail: partial }),
  );
}
