import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
<<<<<<< HEAD
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import JsonLd from "@/components/home/JsonLd";
import { ThemeProvider } from "next-themes";
import { siteConfig } from "@/config/site";
import { siteSchema } from "@/lib/seo";
=======
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
>>>>>>> seemol

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
});

<<<<<<< HEAD
export const metadata: Metadata = {
    /**
     * metadataBase is required for canonical URLs and Open Graph images to
     * resolve to absolute URLs. Without it Next emits relative paths, which
     * most crawlers — and every social preview — will not resolve.
     */
    metadataBase: new URL(siteConfig.url),

    title: {
        default: `${siteConfig.name} | E-commerce Growth Partner`,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    alternates: { canonical: "/" },

    openGraph: {
        type: "website",
        url: siteConfig.url,
        siteName: siteConfig.name,
        title: `${siteConfig.name} | E-commerce Growth Partner`,
        description: siteConfig.description,
        locale: "en_US",
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: `${siteConfig.name} | E-commerce Growth Partner`,
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: `${siteConfig.name} | E-commerce Growth Partner`,
        site: "@prodesignity",
        creator: "@prodesignity",
        description: siteConfig.description,
        images: [siteConfig.ogImage],
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

    // TODO: paste the verification tokens from each console, then remove the
    // ones you don't use. Empty strings render empty tags — delete instead.
    // verification: { google: "", other: { "msvalidate.01": "" } },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
=======
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

>>>>>>> seemol
    return (
        <html
            lang="en"
            suppressHydrationWarning
            data-scroll-behavior="smooth"
            className={`${poppins.variable} scroll-smooth`}
        >
            <body className="">
                {/* Site-wide entity graph: Organization + WebSite + FAQPage. */}
<<<<<<< HEAD
                <JsonLd data={siteSchema()} />
=======
                <JsonLd data={siteSchema(config)} />
>>>>>>> seemol

                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={true}
                >
<<<<<<< HEAD
                    <Header />

                    <PageTransition>
                        {children}
                    </PageTransition>

                    <ScrollToTop />
                    <Footer />
=======
                    <SiteChrome>
                        <PageTransition>{children}</PageTransition>
                    </SiteChrome>
>>>>>>> seemol
                </ThemeProvider>
            </body>
        </html>
    );
}
