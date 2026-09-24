/**
 * Backend API config for the marketing site.
 * Dashboard edits land here; the homepage reads them via GET /homepage.
 */
export const apiBaseUrl = "https://api.prodesignity.com/api";

/** Origin used for uploaded media (`/uploads/...`) */
export const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, "");

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

    return normalized;
}
