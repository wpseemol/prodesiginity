import { z } from "zod";

const optionalString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const editableSiteConfigSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  legalName: z.string().trim().min(1).max(160).optional(),
  domain: z.string().trim().min(1).max(120).optional(),
  url: z
    .union([z.literal(""), z.string().trim().url().max(255)])
    .optional(),
  logo: optionalString(512),
  ogImage: optionalString(512),
  founded: optionalString(20),
  tagline: optionalString(255),
  description: optionalString(1000),
  email: optionalString(160),
  privacyEmail: optionalString(160),
  phone: optionalString(60),
  whatsapp: optionalString(255),
  contactPath: optionalString(120),
  address: z
    .object({
      street: optionalString(160),
      city: optionalString(80),
      region: optionalString(80),
      postalCode: optionalString(40),
      country: optionalString(8),
      countryName: optionalString(80),
    })
    .optional(),
  social: z
    .object({
      linkedin: optionalString(255),
      instagram: optionalString(255),
      behance: optionalString(255),
      dribbble: optionalString(255),
      youtube: optionalString(255),
    })
    .optional(),
  serviceAreas: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
  languages: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  priceRange: optionalString(20),
  legal: z
    .object({
      jurisdiction: optionalString(120),
      governingLaw: optionalString(160),
      courts: optionalString(160),
      deposit: optionalString(40),
      revisionRounds: optionalString(40),
      refundWindowDays: optionalString(20),
      approvalWindowDays: optionalString(20),
      latePaymentTerms: optionalString(40),
      dataRetentionMonths: optionalString(20),
      minimumAge: optionalString(20),
      noticeDays: optionalString(20),
    })
    .optional(),
});

export type EditableSiteConfig = z.infer<typeof editableSiteConfigSchema>;

/** Defaults seeded into DB / used when fields are empty. */
export const DEFAULT_SITE_CONFIG: Required<
  Omit<EditableSiteConfig, "address" | "social" | "legal" | "serviceAreas" | "languages">
> & {
  address: Required<NonNullable<EditableSiteConfig["address"]>>;
  social: Required<NonNullable<EditableSiteConfig["social"]>>;
  legal: Required<NonNullable<EditableSiteConfig["legal"]>>;
  serviceAreas: string[];
  languages: string[];
} = {
  name: "ProDesignity",
  legalName: "ProDesignity",
  domain: "prodesignity.com",
  url: "https://prodesignity.com",
  logo: "/uploads/assets/logo/prodesignity-logo.png",
  ogImage: "/uploads/assets/images/Prodesignity-hero-image-change.jpg",
  founded: "2021",
  tagline:
    "3D product visualization, packaging design and product CGI studio",
  description:
    "ProDesignity creates photorealistic 3D product renders, CGI animations, and packaging designs that drive conversions for DTC, Shopify, and Amazon brands.",
  email: "info@prodesignity.com",
  privacyEmail: "info@prodesignity.com",
  phone: "+880 1738-142398",
  whatsapp: "https://wa.me/8801738142398",
  contactPath: "/contact",
  address: {
    street: "",
    city: "Khulna",
    region: "Khulna Division",
    postalCode: "",
    country: "BD",
    countryName: "Bangladesh",
  },
  social: {
    linkedin: "",
    instagram: "",
    behance: "",
    dribbble: "",
    youtube: "",
  },
  serviceAreas: [
    "United States",
    "United Kingdom",
    "European Union",
    "Worldwide",
  ],
  languages: ["English"],
  priceRange: "$$",
  legal: {
    jurisdiction: "Bangladesh",
    governingLaw: "the laws of Bangladesh",
    courts: "the courts of Khulna, Bangladesh",
    deposit: "50%",
    revisionRounds: "two (2)",
    refundWindowDays: "7",
    approvalWindowDays: "7",
    latePaymentTerms: "15 days",
    dataRetentionMonths: "24",
    minimumAge: "16",
    noticeDays: "30",
  },
};

export function mergeSiteConfig(
  stored: unknown,
): typeof DEFAULT_SITE_CONFIG {
  const parsed = editableSiteConfigSchema.safeParse(
    stored && typeof stored === "object" ? stored : {},
  );
  const patch = parsed.success ? parsed.data : {};
  return {
    ...DEFAULT_SITE_CONFIG,
    ...patch,
    address: {
      ...DEFAULT_SITE_CONFIG.address,
      ...(patch.address ?? {}),
    },
    social: {
      ...DEFAULT_SITE_CONFIG.social,
      ...(patch.social ?? {}),
    },
    legal: {
      ...DEFAULT_SITE_CONFIG.legal,
      ...(patch.legal ?? {}),
    },
    serviceAreas: patch.serviceAreas?.length
      ? patch.serviceAreas
      : DEFAULT_SITE_CONFIG.serviceAreas,
    languages: patch.languages?.length
      ? patch.languages
      : DEFAULT_SITE_CONFIG.languages,
  };
}
