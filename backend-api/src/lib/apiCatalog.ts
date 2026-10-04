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
  { method: "POST", path: "/api/auth/google", auth: "public", note: "Google ID token, client accounts only" },
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
  { method: "GET", path: "/api/auth/avatar-presets", auth: "user" },
  { method: "PUT", path: "/api/auth/me/avatar", auth: "user", note: "body { presetId | null }" },

  { method: "GET", path: "/api/homepage", auth: "public" },
  { method: "GET", path: "/api/homepage/:key", auth: "public" },

  { method: "GET", path: "/api/team", auth: "public" },
  { method: "GET", path: "/api/team/me", auth: "user", note: "staff only" },
  { method: "PUT", path: "/api/team/me", auth: "user", note: "staff only, multipart" },
  { method: "GET", path: "/api/team/:slug", auth: "public" },
  { method: "GET", path: "/api/settings", auth: "public" },
  { method: "GET", path: "/api/services", auth: "public" },
  { method: "GET", path: "/api/industries", auth: "public" },
  { method: "GET", path: "/api/industries/:slug", auth: "public" },
  { method: "POST", path: "/api/track/visit", auth: "public" },
  { method: "GET", path: "/api/blog", auth: "public" },
  { method: "GET", path: "/api/blog/:slug", auth: "public" },

  { method: "POST", path: "/api/careers/apply", auth: "public", note: "multipart, rate limited" },
  { method: "GET", path: "/api/careers/applications", auth: "admin" },
  { method: "GET", path: "/api/careers/applications/:id", auth: "admin" },
  { method: "PATCH", path: "/api/careers/applications/:id", auth: "admin" },
  { method: "GET", path: "/api/careers/applications/:id/resume", auth: "admin" },
  { method: "POST", path: "/api/careers/applications/:id/reply", auth: "admin" },
  { method: "DELETE", path: "/api/careers/applications/:id", auth: "admin", note: "?block=1 also blocks the email" },
  { method: "GET", path: "/api/careers/blocked", auth: "admin" },
  { method: "POST", path: "/api/careers/blocked", auth: "admin", note: "body { email, reason? }" },
  { method: "DELETE", path: "/api/careers/blocked", auth: "admin", note: "?email=" },
  { method: "GET", path: "/api/careers/me/applications", auth: "user", note: "own applications + sent replies" },

  { method: "GET", path: "/api/notifications", auth: "user", note: "admin + staff" },
  { method: "POST", path: "/api/notifications/read-all", auth: "user" },
  { method: "POST", path: "/api/notifications/:id/read", auth: "user" },
  { method: "DELETE", path: "/api/notifications/:id", auth: "user" },

  { method: "GET", path: "/api/manage/blog/categories", auth: "user", note: "admin + staff" },
  { method: "POST", path: "/api/manage/blog/categories", auth: "admin" },
  { method: "PUT", path: "/api/manage/blog/categories/:id", auth: "admin" },
  { method: "DELETE", path: "/api/manage/blog/categories/:id", auth: "admin" },
  { method: "GET", path: "/api/manage/blog/byline-members", auth: "admin", note: "byline picker" },
  { method: "GET", path: "/api/manage/blog/posts", auth: "user", note: "staff see own posts" },
  { method: "GET", path: "/api/manage/blog/posts/:id", auth: "user", note: "owner or admin" },
  { method: "POST", path: "/api/manage/blog/posts", auth: "user", note: "admin + staff" },
  { method: "PUT", path: "/api/manage/blog/posts/:id", auth: "user", note: "owner or admin" },
  { method: "DELETE", path: "/api/manage/blog/posts/:id", auth: "user", note: "owner or admin" },
  { method: "POST", path: "/api/manage/blog/media", auth: "user", note: "multipart, admin + staff" },

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
  { method: "GET", path: "/api/admin/industries", auth: "admin" },
  { method: "POST", path: "/api/admin/industries", auth: "admin" },
  { method: "PUT", path: "/api/admin/industries/order", auth: "admin", note: "body { ids } in display order" },
  { method: "PUT", path: "/api/admin/industries/:id", auth: "admin" },
  { method: "DELETE", path: "/api/admin/industries/:id", auth: "admin" },
  { method: "GET", path: "/api/admin/settings", auth: "admin" },
  { method: "PUT", path: "/api/admin/settings", auth: "admin" },
  { method: "GET", path: "/api/admin/settings/mail", auth: "admin" },
  { method: "PUT", path: "/api/admin/settings/mail", auth: "admin" },
  { method: "POST", path: "/api/admin/settings/mail/test", auth: "admin" },
  { method: "GET", path: "/api/admin/settings/google", auth: "admin" },
  { method: "PUT", path: "/api/admin/settings/google", auth: "admin" },
  { method: "GET", path: "/api/admin/avatar-presets", auth: "admin" },
  { method: "POST", path: "/api/admin/avatar-presets", auth: "admin", note: "multipart image, max 5" },
  { method: "PUT", path: "/api/admin/avatar-presets/order", auth: "admin", note: "body { ids }" },
  { method: "PATCH", path: "/api/admin/avatar-presets/:id", auth: "admin" },
  { method: "DELETE", path: "/api/admin/avatar-presets/:id", auth: "admin" },
  { method: "POST", path: "/api/admin/settings/favicon", auth: "admin", note: "multipart" },
  { method: "POST", path: "/api/admin/settings/login-logo", auth: "admin", note: "multipart" },
  { method: "POST", path: "/api/admin/settings/og-image", auth: "admin", note: "multipart" },
  { method: "POST", path: "/api/admin/settings/brand-logo", auth: "admin", note: "multipart" },
];

export const API_ROUTERS = [
  { mount: "/api/health", description: "Health check" },
  { mount: "/api/auth", description: "Auth + profile photos" },
  { mount: "/api/homepage", description: "Public homepage CMS" },
  { mount: "/api/team", description: "Public team list + staff profiles" },
  { mount: "/api/settings", description: "Public site settings" },
  { mount: "/api/services", description: "Public services catalog" },
  { mount: "/api/industries", description: "Public industries we serve" },
  { mount: "/api/track", description: "Page visit tracking" },
  { mount: "/api/blog", description: "Public blog posts + categories" },
  { mount: "/api/manage/blog", description: "Blog management (JWT + admin/staff)" },
  { mount: "/api/careers", description: "Careers applications (public apply, admin review)" },
  { mount: "/api/notifications", description: "Dashboard notifications (JWT + admin/staff)" },
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
