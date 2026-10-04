import type { Metadata } from "next";
import CareersPageView from "@/components/career/CareersPageView";
import { getCareersData } from "@/lib/careers";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const { content } = await getCareersData();
    return buildMetadata({
        title: `Careers — ${content.hero.title} ${content.hero.highlight}`,
        description: content.hero.subtitle,
        path: "/careers",
    });
}

export default async function CareerPage() {
    const data = await getCareersData();
    return <CareersPageView initial={data} />;
}
