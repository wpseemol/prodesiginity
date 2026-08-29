import HeroSection from "@/components/home/hero/HeroSection";
import JsonLd from "@/components/home/JsonLd";
import StatsSection from "@/components/home/StatsSection";
import { homeSchema } from "@/lib/seo";

export default function Home() {
    return (
        <main className="">
            <JsonLd data={homeSchema()} />
            <HeroSection />
            <StatsSection />
        </main>
    );
}
