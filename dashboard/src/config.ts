export const apiBaseUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

/** Origin used for uploaded media (`/uploads/...`) */
export const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, "");

/** Marketing site origin (rarely needed now that assets live on the API) */
export const siteOrigin =
  import.meta.env.VITE_SITE_URL ?? "http://localhost:3000";

export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  let normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/assets/")) {
    normalized = `/uploads/assets/${normalized.slice("/assets/".length)}`;
  }

  if (normalized.startsWith("/uploads/")) {
    return `${apiOrigin}${normalized}`;
  }

  return `${siteOrigin}${normalized}`;
}

export type StaffRole = "admin" | "employer";
