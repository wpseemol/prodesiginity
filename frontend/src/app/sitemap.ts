import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { serviceHref } from "@/data/servicesData";
import { industryHref } from "@/data/industriesData";
import { blogCanonicalPath } from "@/data/blog";
import { getBlogData } from "@/lib/blog-api";
import { getIndustries } from "@/lib/industries-catalog";
import { getServicesCatalog } from "@/lib/services-catalog";
import { getTeamData, staffHref } from "@/lib/team-api";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [{ services }, industries, { posts }, team] = await Promise.all([
        getServicesCatalog(),
        getIndustries(),
        getBlogData(),
        getTeamData(),
    ]);
    const baseUrl = siteConfig.url;

    const routes = [
        "",
        "/about",
        "/blog",
        "/careers",
        "/contact",
        "/industries",
        "/privacy-policy",
        "/services",
        "/services/our-service",
        "/team",
        "/terms",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    const serviceRoutes = services.map((service) => ({
        url: `${baseUrl}${serviceHref(service.slug)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    const industryRoutes = industries.map((industry) => ({
        url: `${baseUrl}${industryHref(industry.slug)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    // Real dates here, not `new Date()` — a sitemap that claims every
    // article changed today teaches a crawler to ignore the field.
    const blogRoutes = posts.map((post) => ({
        url: `${baseUrl}${blogCanonicalPath(post.slug)}`,
        lastModified: new Date(post.updatedAt ?? post.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    const teamRoutes = team.map((member) => ({
        url: `${baseUrl}${staffHref(member)}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    return [
        ...routes,
        ...serviceRoutes,
        ...industryRoutes,
        ...blogRoutes,
        ...teamRoutes,
    ];
}
