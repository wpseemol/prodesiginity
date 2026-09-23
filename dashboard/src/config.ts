export const apiBaseUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

/** Origin used for uploaded media (`/uploads/...`) */
export const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, "");

/** Marketing site origin for static `/assets/...` paths shown in admin UI */
export const siteOrigin =
  import.meta.env.VITE_SITE_URL ?? "http://localhost:3000";

export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/uploads/")) {
    return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return `${siteOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}

export type StaffRole = "admin" | "employer";
