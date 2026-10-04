import { siteOrigin } from "@/config";

export type JobRow = {
  id: number;
  title: string;
  department: string;
  type: string;
  location: string;
  experience: string;
  salary: string;
  description: string;
  published: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type JobInput = Omit<JobRow, "id" | "sortOrder" | "updatedAt">;

export type CareerPerk = { icon: string; title: string; description: string };

export type CareersPageContent = {
  hero: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    openingsButton: string;
    applyButton: string;
  };
  form: { badge: string; title: string; subtitle: string };
  perks: { title: string; subtitle: string; items: CareerPerk[] };
  openings: { eyebrow: string; title: string; hint: string; emptyText: string };
};

export type CareersContentResponse = {
  content: CareersPageContent;
  jobs: JobRow[];
};

export const EMPTY_JOB: JobInput = {
  title: "",
  department: "",
  type: "Full-Time",
  location: "Remote (BD)",
  experience: "2+ Years",
  salary: "Negotiate",
  description: "",
  published: true,
};

export const JOB_TYPE_SUGGESTIONS = ["Full-Time", "Part-Time", "Contract", "Internship", "Freelance"];

/** Same rule the apply form enforces on the role an applicant picks. */
export const JOB_TITLE_RE = /^[\p{L}\p{N}][\p{L}\p{N} &/().,'+-]*$/u;

export const MAX_PERKS = 8;

export const careersPageUrl = `${siteOrigin.replace(/\/$/, "")}/careers/`;
