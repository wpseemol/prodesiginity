/**
 * src/components/home/JsonLd.tsx (or app/_components/JsonLd.tsx)
 * ---------------------------------------------------------------------------
 * Renders a structured-data block into the HTML.
 *
 * A plain <script> in a server component is used rather than next/script,
 * because the markup must be present in the initial HTML response. Crawlers
 * that do not execute JavaScript — which includes several AI crawlers — never
 * see client-injected JSON-LD.
 */

export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://prodesignity.com/#organization",
    name: "ProDesignity",
    url: "https://prodesignity.com",
    logo: "https://prodesignity.com/assets/logo/prodesignity-logo.png",
    sameAs: [
        "https://www.linkedin.com/company/prodesignity",
        "https://www.instagram.com/prodesignity",
        "https://x.com/prodesignity",
        "https://www.facebook.com/prodesignity",
    ],
    contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-XXX-XXX-XXXX", // update with your business contact
        contactType: "customer service",
        availableLanguage: ["English"],
    },
    address: {
        "@type": "PostalAddress",
        streetAddress: "Your Street Address",
        addressLocality: "City",
        addressRegion: "State/Region",
        postalCode: "Postal Code",
        addressCountry: "US",
    },
};

export default function JsonLd({
    data = organizationSchema,
}: {
    data?: object;
}) {
    return (
        <script
            type="application/ld+json"
            // Content is generated from our own config, never user input.
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, "\\u003c"),
            }}
        />
    );
}
