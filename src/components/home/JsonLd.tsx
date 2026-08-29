/**
 * app/_components/JsonLd.tsx
 * ---------------------------------------------------------------------------
 * Renders a structured-data block into the HTML.
 *
 * A plain <script> in a server component is used rather than next/script,
 * because the markup must be present in the initial HTML response. Crawlers
 * that do not execute JavaScript — which includes several AI crawlers — never
 * see client-injected JSON-LD.
 */
export default function JsonLd({ data }: { data: object }) {
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
