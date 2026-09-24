import BrandsMarquee from "@/components/home/BrandsMarquee";
import HeroSection from "@/components/home/hero/HeroSection";
import JsonLd from "@/components/home/JsonLd";
// import FeaturedWorksSection from "@/components/home/portfolio";
import PricingSection from "@/components/home/PricingSection";
import ProcessSection from "@/components/home/ProcessSection";
import RecentProjects from "@/components/home/recent-projects/RecentProjects";
import ServicesMarquee from "@/components/home/ServicesMarquee";
import StatsSection from "@/components/home/StatsSection";
import TeamSection from "@/components/home/team/TeamSection";
import { homeSchema } from "@/lib/seo";

export default function Home() {
    return (
        <main className="">
            <JsonLd data={homeSchema()} />
            <HeroSection />
            <StatsSection />
            <BrandsMarquee />
            {/* <FeaturedWorksSection /> */}
            <ServicesMarquee />
            <ProcessSection />
            <RecentProjects />
            <PricingSection />
            <TeamSection />
        </main>
    );
}
