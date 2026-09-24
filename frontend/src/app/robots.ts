// src/app/robots.ts
/**
 * Prodesignity - Robots Configuration
 */
import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = siteConfig?.url || "https://prodesignity.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/admin/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
