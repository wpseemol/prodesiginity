"use client";

import type { ReactNode } from "react";

import PageLoader from "@/components/ui/PageLoader";
import { LIVE_ROUTES } from "@/lib/live-routes";

const PATTERNS = Object.values(LIVE_ROUTES)
    .map((pattern) => pattern.toString())
    .join(",");

const GATE_SCRIPT = `(function(){var p=location.pathname;if([${PATTERNS}].some(function(r){return r.test(p)}))document.currentScript.parentElement.setAttribute("data-live-lookup","")})()`;

/** `text/plain` on the client keeps React from warning about a script it would never run. */
function InlineScript({ html }: { html: string }) {
    return (
        <script
            type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

/**
 * The static host answers dashboard-created content with 404.html, and the
 * browser would paint its "404" before JavaScript loads and the live fallback
 * takes over. This inline script runs while the HTML is parsed: on a URL a
 * fallback may resolve it swaps the 404 for the loader before first paint.
 * After hydration the fallback replaces this whole element with its own state.
 */
export default function LiveRouteGate({ children }: { children: ReactNode }) {
    return (
        <div className="group" suppressHydrationWarning>
            <InlineScript html={GATE_SCRIPT} />
            <div className="hidden group-data-[live-lookup]:block">
                <PageLoader />
            </div>
            <div className="group-data-[live-lookup]:hidden">{children}</div>
        </div>
    );
}
