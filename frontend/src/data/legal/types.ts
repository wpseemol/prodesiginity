/**
 * data/legal/types.ts
 * ---------------------------------------------------------------------------
 * The content model for every legal document on the site.
 *
 * Why a typed model instead of JSX or MDX:
 *  - Non-developers can edit prose without touching markup.
 *  - TypeScript catches a malformed section at build time, not in production.
 *  - The same structured data feeds the page, the JSON-LD and llms.txt, so an
 *    edit can never leave the machine-readable copy out of sync with the page.
 *
 * Any string field supports {{tokens}} resolved from config/site.ts
 * (see lib/legal.ts) — e.g. "Email {{email}}" or "a {{legal.deposit}} deposit".
 */

export type LegalBlock =
    | { type: "paragraph"; text: string }
    | { type: "list"; items: string[]; ordered?: boolean }
    | { type: "definitions"; items: { term: string; description: string }[] }
    | {
          type: "table";
          caption?: string;
          head: string[];
          rows: string[][];
      }
    | {
          type: "callout";
          tone?: "info" | "warning";
          title?: string;
          text: string;
      };

export interface LegalSection {
    /** URL anchor and table-of-contents key. Keep stable — people link to these. */
    id: string;
    title: string;
    /**
     * Answer-first one-liner. Shown under the heading, used as the section
     * summary in llms.txt, and it is the sentence an AI assistant is most
     * likely to quote. Write it so it stands alone without the heading.
     */
    summary?: string;
    blocks: LegalBlock[];
}

export interface LegalFaq {
    question: string;
    answer: string;
}

export interface LegalDocument {
    /** Route segment, e.g. "privacy-policy" → /privacy-policy */
    slug: string;
    title: string;
    /** Small pill above the H1. */
    eyebrow: string;
    /** Meta description and page lede. Keep under ~155 characters. */
    description: string;
    /** ISO date (YYYY-MM-DD). */
    effectiveDate: string;
    /** ISO date (YYYY-MM-DD). Drives "Last updated" and sitemap lastModified. */
    lastUpdated: string;
    /** Bump on every material change so clients can cite a version. */
    version: string;
    /** Intro paragraphs, before the numbered sections. */
    intro: string[];
    sections: LegalSection[];
    /** Rendered as an accordion and emitted as FAQPage JSON-LD. */
    faq?: LegalFaq[];
    /** Closing note above the contact card. */
    closing?: string;
}
