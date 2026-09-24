import { mediaUrl } from "@/config";
import { WEBSITE_LOGOS } from "@/lib/brand";

const FAVICON_LINK_ID = "site-favicon";

/** Apply (or refresh) the browser tab favicon. */
export function applyDocumentFavicon(path: string | null | undefined) {
  const href =
    mediaUrl(path) ?? mediaUrl(WEBSITE_LOGOS.mark) ?? "/favicon.svg";

  let link = document.getElementById(
    FAVICON_LINK_ID,
  ) as HTMLLinkElement | null;

  if (!link) {
    link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  }
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.id = FAVICON_LINK_ID;
  // Bust cache after an admin upload so the tab updates immediately.
  const withBust = href.includes("?")
    ? `${href}&v=${Date.now()}`
    : `${href}?v=${Date.now()}`;
  link.type = "";
  link.href = withBust;

  // Keep apple-touch-icon in sync when a custom upload exists.
  let apple = document.querySelector<HTMLLinkElement>(
    "link[rel='apple-touch-icon']",
  );
  if (!apple) {
    apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    document.head.appendChild(apple);
  }
  apple.href = withBust;
}

export function applyDocumentTitle(siteName: string | null | undefined) {
  const name = siteName?.trim() || "ProDesignity";
  document.title = `${name} Dashboard`;
}
