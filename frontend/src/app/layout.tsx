import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import PageTransition from "@/components/PageTransition";
import SiteChrome from "@/components/SiteChrome";
import JsonLd from "@/components/home/JsonLd";
import { ThemeProvider } from "next-themes";
import { siteSchema } from "@/lib/seo";
import {
  absoluteMediaUrl,
  getResolvedSiteConfig,
  seoTitle,
} from "@/lib/site-settings";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
    const config = await getResolvedSiteConfig();
    const title = seoTitle(config);
    const ogImage = absoluteMediaUrl(config.ogImage, config.url);

    return {
        /**
         * metadataBase is required for canonical URLs and Open Graph images to
         * resolve to absolute URLs. Without it Next emits relative paths, which
         * most crawlers — and every social preview — will not resolve.
         */
        metadataBase: new URL(config.url),

        title: {
            default: title,
            template: `%s | ${config.name}`,
        },
        description: config.description,
        applicationName: config.name,
        authors: [{ name: config.name, url: config.url }],
        creator: config.name,
        publisher: config.name,
        alternates: { canonical: "/" },

        openGraph: {
            type: "website",
            url: config.url,
            siteName: config.name,
            title,
            description: config.description,
            locale: "en_US",
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },

        twitter: {
            card: "summary_large_image",
            title,
            site: "@prodesignity",
            creator: "@prodesignity",
            description: config.description,
            images: [ogImage],
        },

        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-snippet": -1,
                "max-image-preview": "large",
                "max-video-preview": -1,
            },
        },
    };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
    const config = await getResolvedSiteConfig();

    return (
        <html
            lang="en"
            suppressHydrationWarning
            data-scroll-behavior="smooth"
            className={`${poppins.variable} scroll-smooth`}
        >
            <body className="">
                {/* Site-wide entity graph: Organization + WebSite + FAQPage. */}
                <JsonLd data={siteSchema(config)} />

                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={true}
                >
                    <SiteChrome>
                        <PageTransition>{children}</PageTransition>
                    </SiteChrome>
                </ThemeProvider>
            </body>
        </html>
    );
}
