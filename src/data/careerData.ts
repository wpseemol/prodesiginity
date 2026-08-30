import { Laptop, DollarSign, Globe, Clock } from "lucide-react";

export interface JobPosition {
    id: string;
    title: string;
    department: string;
    type: string;
    location: string;
    experience: string;
    salary: string;
    description: string;
}

export interface CareerPerk {
    icon: React.ElementType;
    title: string;
    desc: string;
}

export const OPEN_POSITIONS: JobPosition[] = [
    {
        id: "video-editing",
        title: "Video Editor & Motion Designer",
        department: "Creative Production",
        type: "Full-Time",
        location: "Remote / Hybrid (BD)",
        experience: "2+ Years",
        salary: "Negotiate",
        description:
            "Craft high-retention commercial cuts, YouTube shorts, and kinetic typography for global DTC e-commerce brands.",
    },
    {
        id: "graphic-design",
        title: "Graphic & Brand Identity Designer",
        department: "Visual Design",
        type: "Full-Time",
        location: "Remote / Hybrid (BD)",
        experience: "2+ Years",
        salary: "Negotiate",
        description:
            "Create vector systems, packaging die-lines, luxury brand books, and high-conversion marketing assets.",
    },
    {
        id: "shopify-development",
        title: "Shopify / Theme Developer",
        department: "Engineering",
        type: "Full-Time",
        location: "Remote (BD)",
        experience: "3+ Years",
        salary: "Negotiate",
        description:
            "Build custom Liquid 2.0 storefronts, optimize Core Web Vitals, and integrate headless e-commerce architectures.",
    },
    {
        id: "seo-digital-marketing",
        title: "SEO & Digital Marketing Strategist",
        department: "Growth & Marketing",
        type: "Full-Time",
        location: "Remote (BD)",
        experience: "2+ Years",
        salary: "Negotiate",
        description:
            "Execute technical SEO audits, manage PPC ad campaigns, and drive organic traffic growth across multi-channel funnels.",
    },
    {
        id: "ui-ux-design",
        title: "UI/UX Product Designer",
        department: "Product Design",
        type: "Full-Time",
        location: "Remote / Hybrid (BD)",
        experience: "2+ Years",
        salary: "Negotiate",
        description:
            "Architect high-converting wireframes, interactive Figma prototypes, and cohesive design systems for web and mobile platforms.",
    },
    {
        id: "2d-animation",
        title: "2D Animator & Motion Artist",
        department: "Creative Production",
        type: "Full-Time",
        location: "Remote (BD)",
        experience: "2+ Years",
        salary: "Negotiate",
        description:
            "Produce compelling 2D explainer videos, character rigs, and promotional motion graphics using After Effects and Illustrator.",
    },
    {
        id: "3d-animation",
        title: "3D Animator & CGI Generalist",
        department: "3D Modeling & CGI",
        type: "Full-Time",
        location: "Remote (BD)",
        experience: "2+ Years",
        salary: "Negotiate",
        description:
            "Develop photorealistic product visualizations, 3D character/object animations, and simulated dynamics using Blender or Cinema 4D.",
    },
    {
        id: "web-app-development",
        title: "Web Application Developer (Full-Stack)",
        department: "Engineering",
        type: "Full-Time",
        location: "Remote (BD)",
        experience: "3+ Years",
        salary: "Negotiate",
        description:
            "Build robust, scalable full-stack web applications using Next.js, React, Node.js, and modern relational/NoSQL databases.",
    },
];

export const CAREER_PERKS: CareerPerk[] = [
    {
        icon: Laptop,
        title: "100% Remote-First Culture",
        desc: "Work comfortably from your home setup anywhere across Bangladesh with flexible core hours.",
    },
    {
        icon: DollarSign,
        title: "Competitive USD-Pegged Pay",
        desc: "Performance bonuses, yearly increments, and timely monthly payouts with zero delays.",
    },
    {
        icon: Globe,
        title: "Tier-1 Global Brands",
        desc: "Direct portfolio exposure building assets for international enterprise clients and funded startups.",
    },
    {
        icon: Clock,
        title: "Paid Time Off & Festival Bonuses",
        desc: "Generous leave policy, Eid festival allowances, and designated mental health wellness days.",
    },
];

export const BD_CITIES = [
    "Dhaka",
    "Chattogram",
    "Khulna",
    "Rajshahi",
    "Sylhet",
    "Barishal",
    "Rangpur",
    "Mymensingh",
    "Cumilla",
    "Gazipur",
    "Narayanganj",
    "Bogura",
    "Jashore",
    "Cox's Bazar",
    "Other / Remote (BD)",
];
