import type { LegalDocument } from "./types";
import { privacyPolicy } from "./privacy-policy";
import { termsOfService } from "./terms-of-service";

/**
 * data/legal/index.ts
 * ---------------------------------------------------------------------------
 * Registry of every legal document.
 *
 * To add a new one (Cookie Policy, Refund Policy, DPA…):
 *   1. Create data/legal/cookie-policy.ts using the LegalDocument type.
 *   2. Add it to LEGAL_DOCUMENTS below.
 *   3. Create app/cookie-policy/page.tsx — copy the 12-line privacy page.
 * The sitemap, llms.txt and footer link list update themselves.
 */
export const LEGAL_DOCUMENTS: LegalDocument[] = [privacyPolicy, termsOfService];

export function getLegalDocument(slug: string): LegalDocument | undefined {
    return LEGAL_DOCUMENTS.find((doc) => doc.slug === slug);
}

export { privacyPolicy, termsOfService };
export type { LegalDocument, LegalSection, LegalBlock } from "./types";
