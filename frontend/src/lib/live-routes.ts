import { BLOG_BASE_PATH } from "@/data/blog";
import { INDUSTRIES_BASE_PATH } from "@/data/industriesData";
import { SERVICES_BASE_PATH } from "@/data/servicesData";
import { TEAM_BASE_PATH } from "@/lib/team-api";

/**
 * Detail URLs the static 404 page may have to render from the live API
 * (content created in the dashboard after the last build). Group 1 is the
 * slug. The pre-paint gate and the fallbacks must share these, or a URL the
 * gate hides the 404 for would never be resolved.
 */
export const LIVE_ROUTES = {
    service: new RegExp(`^${SERVICES_BASE_PATH}/([^/]+)/?$`),
    industry: new RegExp(`^${INDUSTRIES_BASE_PATH}/([^/]+)/?$`),
    blog: new RegExp(`^${BLOG_BASE_PATH}/([a-z0-9-]{1,160})/?$`),
    staff: new RegExp(`^${TEAM_BASE_PATH}/([a-zA-Z0-9._-]{1,80})/?$`),
} as const;
