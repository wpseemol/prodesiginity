import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { SERVICES } from "@/data/servicesData";
import { POSTS, blogHref } from "@/data/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.url;

    const routes = [
        "",
        "/about",
        "/blog",
        "/careers",
        "/contact",
        "/privacy-policy",
        "/services",
        "/services/our-service",
        "/terms",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    const serviceRoutes = SERVICES.map((service) => ({
        url: `${baseUrl}/services/our-service/${service.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    // Real dates here, not `new Date()` — a sitemap that claims every
    // article changed today teaches a crawler to ignore the field.
    const blogRoutes = POSTS.map((post) => ({
        url: `${baseUrl}${blogHref(post.slug)}`,
        lastModified: new Date(post.updatedAt ?? post.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [...routes, ...serviceRoutes, ...blogRoutes];
}
