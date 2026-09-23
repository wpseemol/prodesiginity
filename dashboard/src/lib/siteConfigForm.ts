/** Mirrors backend DEFAULT_SITE_CONFIG for dashboard forms. */
export type SiteConfigForm = {
  name: string;
  legalName: string;
  domain: string;
  url: string;
  logo: string;
  ogImage: string;
  founded: string;
  tagline: string;
  description: string;
  email: string;
  privacyEmail: string;
  phone: string;
  whatsapp: string;
  contactPath: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    countryName: string;
  };
  social: {
    linkedin: string;
    instagram: string;
    behance: string;
    dribbble: string;
    youtube: string;
  };
  serviceAreas: string[];
  languages: string[];
  priceRange: string;
  legal: {
    jurisdiction: string;
    governingLaw: string;
    courts: string;
    deposit: string;
    revisionRounds: string;
    refundWindowDays: string;
    approvalWindowDays: string;
    latePaymentTerms: string;
    dataRetentionMonths: string;
    minimumAge: string;
    noticeDays: string;
  };
};

export const EMPTY_SITE_CONFIG: SiteConfigForm = {
  name: "ProDesignity",
  legalName: "ProDesignity",
  domain: "prodesignity.com",
  url: "https://prodesignity.com",
  logo: "/uploads/assets/logo/prodesignity-logo.png",
  ogImage: "/uploads/assets/images/Prodesignity-hero-image-change.jpg",
  founded: "2021",
  tagline: "",
  description: "",
  email: "",
  privacyEmail: "",
  phone: "",
  whatsapp: "",
  contactPath: "/contact",
  address: {
    street: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    countryName: "",
  },
  social: {
    linkedin: "",
    instagram: "",
    behance: "",
    dribbble: "",
    youtube: "",
  },
  serviceAreas: [],
  languages: ["English"],
  priceRange: "$$",
  legal: {
    jurisdiction: "",
    governingLaw: "",
    courts: "",
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

export function normalizeSiteConfig(raw: unknown): SiteConfigForm {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<SiteConfigForm>;
  return {
    ...EMPTY_SITE_CONFIG,
    ...r,
    address: { ...EMPTY_SITE_CONFIG.address, ...(r.address ?? {}) },
    social: { ...EMPTY_SITE_CONFIG.social, ...(r.social ?? {}) },
    legal: { ...EMPTY_SITE_CONFIG.legal, ...(r.legal ?? {}) },
    serviceAreas: Array.isArray(r.serviceAreas) ? r.serviceAreas : [],
    languages: Array.isArray(r.languages) ? r.languages : ["English"],
  };
}
