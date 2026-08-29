import type { Metadata } from "next";
import JsonLd from "@/components/home/JsonLd";
import LegalDocumentView from "@/app/terms/_components/LegalDocumentView";
import { privacyPolicy } from "@/data/legal";
import { resolveTokens } from "@/lib/legal";
import { buildMetadata, legalPageSchema } from "@/lib/seo";

/**
 * app/privacy-policy/page.tsx
 * ---------------------------------------------------------------------------
 * Content lives in data/legal/privacy-policy.ts. This file only wires it up.
 * Adding another legal page is a copy of these twelve lines.
 */

export const metadata: Metadata = buildMetadata({
    title: privacyPolicy.title,
    description: resolveTokens(privacyPolicy.description),
    path: `/${privacyPolicy.slug}`,
    publishedTime: privacyPolicy.effectiveDate,
    modifiedTime: privacyPolicy.lastUpdated,
});

export default function PrivacyPolicyPage() {
    return (
        <>
            <JsonLd data={legalPageSchema(privacyPolicy)} />
            <LegalDocumentView doc={privacyPolicy} />
        </>
    );
}
