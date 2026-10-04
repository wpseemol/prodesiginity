/**
 * Careers form schema. Mirrors the API's rules (backend-api/src/lib/zod/careers.ts)
 * so mistakes show inline; the API re-validates everything and also checks the
 * CV's real file signature.
 */
import { z } from "zod";
import { BD_CITIES } from "@/data/careerData";

export const GENERAL_ROLE = "General Consideration / Other";
export const EXPERIENCE_LEVELS = ["0-1 years", "1-3 years", "3-5 years", "5+ years"] as const;

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_ACCEPT = ".pdf,.doc,.docx";
const RESUME_TYPES: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const COVER_MAX = 1500;

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const PHONE_RE = /^\+?[0-9]{10,15}$/;
const UNSAFE_RE = /<[^>]*>|javascript:|data:text\/html/i;

const isFile = (value: unknown): value is File =>
    typeof File !== "undefined" && value instanceof File;

export const careerSchema = z.object({
    jobTitle: z.string().min(1, "Select the role you are applying for"),
    name: z
        .string()
        .trim()
        .min(2, "Enter your full name")
        .max(80, "Name is too long")
        .regex(NAME_RE, "Use letters only (spaces, dots, apostrophes and hyphens are fine)"),
    email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address").max(254)),
    phone: z
        .string()
        .trim()
        .min(1, "Enter your WhatsApp number")
        .transform((v) => v.replace(/[\s().-]/g, ""))
        .pipe(z.string().regex(PHONE_RE, "Enter a valid number, e.g. +8801XXXXXXXXX")),
    city: z
        .string()
        .min(1, "Select your city")
        .refine((v) => (BD_CITIES as readonly string[]).includes(v), "Select a city from the list"),
    experience: z.enum(EXPERIENCE_LEVELS, "Select your experience"),
    portfolioUrl: z
        .string()
        .trim()
        .max(300, "Link is too long")
        .refine(
            (v) => v === "" || (/^https:\/\/[^\s<>"']+\.[^\s<>"']+$/i.test(v) && z.url().safeParse(v).success),
            "Use a full https:// link, e.g. https://behance.net/you",
        ),
    coverLetter: z
        .string()
        .trim()
        .max(COVER_MAX, `Keep it under ${COVER_MAX} characters`)
        .refine((v) => !UNSAFE_RE.test(v), "HTML and scripts are not allowed"),
    resume: z
        .custom<File | undefined>((v) => v === undefined || isFile(v))
        .refine((file): file is File => isFile(file), "Attach your CV")
        .refine((file) => !isFile(file) || file.size > 0, "That file is empty")
        .refine((file) => !isFile(file) || file.size <= RESUME_MAX_BYTES, "Your CV must be 5 MB or smaller")
        .refine((file) => {
            if (!isFile(file)) return true;
            const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
            const expected = RESUME_TYPES[ext];
            return Boolean(expected) && (file.type === "" || file.type === expected);
        }, "Upload a PDF, DOC or DOCX file"),
    consent: z.boolean().refine((v) => v, "Please confirm you agree to the privacy notice"),
});

/** Openings are managed in the dashboard, so the allowed roles arrive at runtime. */
export function careerSchemaFor(roles: readonly string[]) {
    return careerSchema.extend({
        jobTitle: careerSchema.shape.jobTitle.refine(
            (v) => v === GENERAL_ROLE || roles.includes(v),
            "Select a role from the list",
        ),
    });
}

export type CareerFormInput = z.input<typeof careerSchema>;
export type CareerFormValues = z.output<typeof careerSchema>;

export const CAREER_DEFAULTS: CareerFormInput = {
    jobTitle: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    experience: "1-3 years",
    portfolioUrl: "",
    coverLetter: "",
    resume: undefined,
    consent: false,
};
