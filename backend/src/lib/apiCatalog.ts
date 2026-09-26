export type ApiRoute = {
  method: string;
  path: string;
  auth?: "public" | "user" | "admin";
  note?: string;
};

/** Full public route map for the Express API (mounted under /api). */
export const API_ROUTES: ApiRoute[] = [
  { method: "GET", path: "/api/health", auth: "public" },

  { method: "POST", path: "/api/auth/register", auth: "public" },
  { method: "POST", path: "/api/auth/login", auth: "public" },
  { method: "POST", path: "/api/auth/refresh", auth: "public" },
  { method: "POST", path: "/api/auth/logout", auth: "public" },
  { method: "GET", path: "/api/auth/me", auth: "user" },
  { method: "PATCH", path: "/api/auth/me", auth: "user" },
  { method: "DELETE", path: "/api/auth/me", auth: "user" },
  { method: "GET", path: "/api/auth/me/photos", auth: "user" },
  { method: "POST", path: "/api/auth/me/photo", auth: "user", note: "multipart" },
  {
    method: "POST",
    path: "/api/auth/me/photos/:photoId/activate",
    auth: "user",
  },

  { method: "GET", path: "/api/homepage", auth: "public" },
  { method: "GET", path: "/api/homepage/:key", auth: "public" },

  { method: "GET", path: "/api/team", auth: "public" },
  { method: "GET", path: "/api/team/me", auth: "user" },
  { method: "PUT", path: "/api/team/me", auth: "user", note: "multipart" },
  { method: "GET", path: "/api/settings", auth: "public" },
  { method: "GET", path: "/api/services", auth: "public" },
  { method: "POST", path: "/api/track/visit", auth: "public" },

  { method: "GET", path: "/api/admin/users", auth: "admin" },
  { method: "POST", path: "/api/admin/users", auth: "admin" },
  { method: "GET", path: "/api/admin/homepage", auth: "admin" },
  { method: "POST", path: "/api/admin/homepage/logo", auth: "admin", note: "multipart" },
  { method: "POST", path: "/api/admin/homepage/media", auth: "admin", note: "multipart" },
  { method: "PUT", path: "/api/admin/homepage/:key", auth: "admin" },
  { method: "GET", path: "/api/admin/team", auth: "admin" },
  { method: "POST", path: "/api/admin/team", auth: "admin", note: "multipart" },
  { method: "PUT", path: "/api/admin/team/:id", auth: "admin", note: "multipart" },
  { method: "DELETE", path: "/api/admin/team/:id", auth: "admin" },
  { method: "GET", path: "/api/admin/analytics/overview", auth: "admin" },
  { method: "GET", path: "/api/admin/services", auth: "admin" },
  { method: "POST", path: "/api/admin/services/groups", auth: "admin" },
  { method: "PUT", path: "/api/admin/services/groups/:id", auth: "admin" },
  { method: "DELETE", path: "/api/admin/services/groups/:id", auth: "admin" },
  { method: "POST", path: "/api/admin/services", auth: "admin" },
  { method: "PUT", path: "/api/admin/services/:id", auth: "admin" },
  { method: "DELETE", path: "/api/admin/services/:id", auth: "admin" },
  { method: "GET", path: "/api/admin/settings", auth: "admin" },
  { method: "PUT", path: "/api/admin/settings", auth: "admin" },
  { method: "POST", path: "/api/admin/settings/favicon", auth: "admin", note: "multipart" },
  { method: "POST", path: "/api/admin/settings/login-logo", auth: "admin", note: "multipart" },
  { method: "POST", path: "/api/admin/settings/og-image", auth: "admin", note: "multipart" },
  { method: "POST", path: "/api/admin/settings/brand-logo", auth: "admin", note: "multipart" },
];

export const API_ROUTERS = [
  { mount: "/api/health", description: "Health check" },
  { mount: "/api/auth", description: "Auth + profile photos" },
  { mount: "/api/homepage", description: "Public homepage CMS" },
  { mount: "/api/team", description: "Public team list" },
  { mount: "/api/settings", description: "Public site settings" },
  { mount: "/api/services", description: "Public services catalog" },
  { mount: "/api/track", description: "Page visit tracking" },
  { mount: "/api/admin", description: "Admin CMS (JWT + admin role)" },
  { mount: "/uploads", description: "Static uploaded files" },
] as const;

export function getApiIndex(port: number | string) {
  const base =
    process.env.PUBLIC_API_URL?.replace(/\/$/, "") ||
    `http://localhost:${port}`;

  return {
    name: "prodesignity-api",
    status: "ok",
    port: Number(port),
    baseUrl: base,
    health: `${base}/api/health`,
    routers: API_ROUTERS,
    routes: API_ROUTES,
  };
}
