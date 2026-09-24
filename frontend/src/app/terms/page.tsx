import type { Metadata } from "next";

import { termsOfService } from "@/data/legal";
import { resolveTokens } from "@/lib/legal";
import { buildMetadata, legalPageSchema } from "@/lib/seo";
import LegalDocumentView from "./_components/LegalDocumentView";
import JsonLd from "@/components/home/JsonLd";

export const metadata: Metadata = buildMetadata({
    title: termsOfService.title,
    description: resolveTokens(termsOfService.description),
    path: `/${termsOfService.slug}`,
    publishedTime: termsOfService.effectiveDate,
    modifiedTime: termsOfService.lastUpdated,
});

export default function TermsOfServicePage() {
    return (
        <>
            <JsonLd data={legalPageSchema(termsOfService)} />
            <LegalDocumentView doc={termsOfService} />
        </>
    );
}
