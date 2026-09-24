export interface PricingPlan {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    isPopular?: boolean;
    popularBadgeText?: string;
    features: string[];
    ctaText: string;
    ctaHref: string;
}

export const PRICING_PLANS: PricingPlan[] = [
    {
        id: "launch",
        name: "E-Commerce Launch",
        price: "1,500.00",
        period: "/mo",
        description:
            "For startups and growing brands building a strong online presence.",
        features: [
            "Amazon Management & Optimization",
            "Shopify & E-Commerce Support",
            "Graphic & Creative Design",
            "Social Media Management",
            "SEO & Content Strategy",
            "Google, Meta & TikTok Marketing",
            "Product & Packaging Design",
            "Monthly Reporting & Strategy",
        ],
        ctaText: "Get Started",
        ctaHref: "/contact?plan=ecommerce-launch",
    },
    {
        id: "growth",
        name: "E-Commerce Growth",
        price: "2,500.00",
        period: "/mo",
        description:
            "For established brands looking to increase traffic, conversions & sales.",
        isPopular: true,
        popularBadgeText: "MOST POPULAR",
        features: [
            "Full Amazon Growth Support",
            "Shopify & E-Commerce Management",
            "Advanced Graphic & Creative Production",
            "Social Media Management",
            "Advanced SEO & Content Marketing",
            "Google, Meta & TikTok Ads",
            "Product, Packaging & 3D Design",
            "Analytics, CRO & Growth Strategy",
            "Monthly Performance Reporting",
        ],
        ctaText: "Get Started",
        ctaHref: "/contact?plan=ecommerce-growth",
    },
    {
        id: "partner",
        name: "E-Commerce Partner",
        price: "5,000.00",
        period: "/mo",
        description:
            "Your complete outsourced e-commerce & digital marketing team.",
        features: [
            "Complete Amazon Management",
            "Full Shopify & E-Commerce Management",
            "High-Volume Creative & Graphic Support",
            "Social Media & Content Management",
            "Full SEO & Organic Growth",
            "Google, Meta & TikTok Advertising",
            "Product, Packaging & 3D Visualization",
            "Email & Retention Marketing",
            "Analytics, CRO & Conversion Strategy",
            "Dedicated Account Management",
            "Weekly Strategy & Growth Support",
        ],
        ctaText: "Get Started",
        ctaHref: "/contact?plan=ecommerce-partner",
    },
];
