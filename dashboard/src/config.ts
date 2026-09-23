export const apiBaseUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

/** Origin used for uploaded media (`/uploads/...`) */
export const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, "");

export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}

export type StaffRole = "admin" | "employer";
