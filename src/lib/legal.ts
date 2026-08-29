import { siteConfig } from "@/config/site";
import type { LegalBlock, LegalDocument } from "@/data/legal/types";

/**
 * lib/legal.ts
 * ---------------------------------------------------------------------------
 * Token resolution for legal copy.
 *
 * Policy text uses {{tokens}} instead of hardcoded values, so changing an email
 * address or a deposit percentage in config/site.ts rewrites every sentence
 * that mentions it. No find-and-replace across two 400-line documents.
 */

const addressParts = [
    siteConfig.address.street,
    siteConfig.address.city,
    siteConfig.address.region,
    siteConfig.address.postalCode,
    siteConfig.address.countryName,
].filter(Boolean);

const TOKENS: Record<string, string> = {
    brand: siteConfig.name,
    legalName: siteConfig.legalName,
    domain: siteConfig.domain,
    url: siteConfig.url,
    email: siteConfig.email,
    privacyEmail: siteConfig.privacyEmail,
    phone: siteConfig.phone,
    addressLine: addressParts.join(", "),
    addressCountry: siteConfig.address.countryName,
    ...Object.fromEntries(
        Object.entries(siteConfig.legal).map(([key, value]) => [
            `legal.${key}`,
            String(value),
        ])
    ),
};

/** Replaces {{token}} with its configured value. Unknown tokens are left as-is. */
export function resolveTokens(input: string): string {
    return input.replace(/\{\{([\w.]+)\}\}/g, (match, key: string) =>
        key in TOKENS ? TOKENS[key] : match
    );
}

/** Stable date formatting. Fixed locale and UTC so SSR and client agree. */
export function formatLegalDate(isoDate: string): string {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** Rough reading time, shown in the document header. */
export function estimateReadingTime(doc: LegalDocument): number {
    const blockText = (block: LegalBlock): string => {
        switch (block.type) {
            case "paragraph":
                return block.text;
            case "list":
                return block.items.join(" ");
            case "definitions":
                return block.items
                    .map((item) => `${item.term} ${item.description}`)
                    .join(" ");
            case "table":
                return [...block.head, ...block.rows.flat()].join(" ");
            case "callout":
                return `${block.title ?? ""} ${block.text}`;
        }
    };

    const words = [
        ...doc.intro,
        ...doc.sections.flatMap((section) => [
            section.title,
            section.summary ?? "",
            ...section.blocks.map(blockText),
        ]),
        ...(doc.faq?.flatMap((item) => [item.question, item.answer]) ?? []),
    ]
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;

    return Math.max(1, Math.round(words / 220));
}
