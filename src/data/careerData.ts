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
        id: "video-editor",
        title: "Video Editor & Motion Designer",
        department: "Creative Production",
        type: "Full-Time",
        location: "Remote / Hybrid (BD)",
        experience: "2+ Years",
        salary: "$600 - $1,200 / mo",
        description:
            "Craft high-retention commercial cuts, YouTube shorts, and kinetic typography for global DTC e-commerce brands.",
    },
    {
        id: "shopify-dev",
        title: "Shopify / Web Developer",
        department: "Engineering",
        type: "Full-Time",
        location: "Remote (BD)",
        experience: "3+ Years",
        salary: "$800 - $1,600 / mo",
        description:
            "Build custom Liquid 2.0 storefronts, optimize Core Web Vitals, and integrate Headless GraphQL APIs.",
    },
    {
        id: "graphic-designer",
        title: "Graphic & Brand Identity Designer",
        department: "Visual Design",
        type: "Full-Time",
        location: "Remote / Hybrid (BD)",
        experience: "2+ Years",
        salary: "$500 - $1,000 / mo",
        description:
            "Create vector systems, packaging die-lines, luxury brand books, and high-conversion ad creatives.",
    },
    {
        id: "3d-artist",
        title: "3D Product & CGI Artist",
        department: "3D Modeling & CGI",
        type: "Contract / Full-Time",
        location: "Remote (BD)",
        experience: "2+ Years",
        salary: "$700 - $1,400 / mo",
        description:
            "Render photorealistic studio product visuals, exploded view animations, and Amazon A+ listing modular assets.",
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
