import { z } from "zod";
import { ROLE_RE } from "./careers.js";

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const MARKUP = /<[^>]*>|javascript:|data:text\/html/i;

const line = (max: number, label: string) =>
  z
    .string()
    .transform((v) => v.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .min(1, `${label} is required`)
        .max(max, `${label} must be ${max} characters or fewer`)
        .refine((v) => !MARKUP.test(v), `${label} cannot contain HTML`),
    );

const text = (max: number, label: string) =>
  z
    .string()
    .transform((v) => v.replace(CONTROL_CHARS, "").trim())
    .pipe(
      z
        .string()
        .min(1, `${label} is required`)
        .max(max, `${label} must be ${max} characters or fewer`)
        .refine((v) => !MARKUP.test(v), `${label} cannot contain HTML`),
    );

const iconName = z
  .string()
  .trim()
  .regex(/^[A-Z][A-Za-z0-9]{0,63}$/, "Pick an icon from the list");

export const careersPageSchema = z.object({
  hero: z.object({
    badge: line(60, "Hero badge"),
    title: line(120, "Hero title"),
    highlight: line(120, "Hero highlighted line"),
    subtitle: text(400, "Hero intro"),
    openingsButton: line(40, "Openings button"),
    applyButton: line(40, "Apply button"),
  }),
  form: z.object({
    badge: line(60, "Form badge"),
    title: line(120, "Form title"),
    subtitle: text(400, "Form intro"),
  }),
  perks: z.object({
    title: line(120, "Perks title"),
    subtitle: text(300, "Perks intro"),
    items: z
      .array(
        z.object({
          icon: iconName,
          title: line(80, "Perk title"),
          description: text(300, "Perk description"),
        }),
      )
      .max(8, "Add at most 8 perks"),
  }),
  openings: z.object({
    eyebrow: line(60, "Openings label"),
    title: line(120, "Openings title"),
    hint: line(160, "Openings hint"),
    emptyText: text(300, "No openings message"),
  }),
});

export type CareersPageContent = z.infer<typeof careersPageSchema>;

export const careerJobSchema = z.object({
  title: line(120, "Job title").pipe(
    z.string().min(2, "Job title is too short").regex(ROLE_RE, "Job title can only use letters, numbers, spaces and & / ( ) . , ' + -"),
  ),
  department: line(80, "Department"),
  type: line(40, "Job type"),
  location: line(80, "Location"),
  experience: line(40, "Experience"),
  salary: line(60, "Salary"),
  description: text(1000, "Description"),
  published: z.boolean().optional(),
});

export const updateCareerJobSchema = careerJobSchema.partial().strict();

export const reorderCareerJobsSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(500),
});

export const DEFAULT_CAREERS_PAGE: CareersPageContent = {
  hero: {
    badge: "Careers at ProDesignity",
    title: "Build the Future of Digital Commerce",
    highlight: "With Elite Creators",
    subtitle:
      "We are looking for exceptional video editors, full-stack Shopify developers, brand strategists, and 3D artists ready to produce world-class creative output.",
    openingsButton: "Explore Open Positions",
    applyButton: "Direct Fast Apply",
  },
  form: {
    badge: "Direct Application",
    title: "Submit Your Candidacy",
    subtitle:
      "Fill out your details and upload your CV. It goes straight to our hiring team, who reply by email.",
  },
  perks: {
    title: "Why You'll Love Working Here",
    subtitle: "Zero micromanagement, autonomous workflows, and real impact.",
    items: [
      {
        icon: "Laptop",
        title: "100% Remote-First Culture",
        description:
          "Work comfortably from your home setup anywhere across Bangladesh with flexible core hours.",
      },
      {
        icon: "DollarSign",
        title: "Competitive USD-Pegged Pay",
        description:
          "Performance bonuses, yearly increments, and timely monthly payouts with zero delays.",
      },
      {
        icon: "Globe",
        title: "Tier-1 Global Brands",
        description:
          "Direct portfolio exposure building assets for international enterprise clients and funded startups.",
      },
      {
        icon: "Clock",
        title: "Paid Time Off & Festival Bonuses",
        description:
          "Generous leave policy, Eid festival allowances, and designated mental health wellness days.",
      },
    ],
  },
  openings: {
    eyebrow: "Current Opportunities",
    title: "Open Positions",
    hint: "Select any role below to prefill the application form.",
    emptyText:
      "We have no open roles right now, but we always want to meet great people. Send a general application and we will keep your CV on file.",
  },
};

export const DEFAULT_CAREER_JOBS: z.infer<typeof careerJobSchema>[] = [
  {
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
