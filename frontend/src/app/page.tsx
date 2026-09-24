import HomePageFromCms from "@/components/home/HomePageFromCms";
import JsonLd from "@/components/home/JsonLd";
import { homeSchema } from "@/lib/seo";

export default function Home() {
    return (
        <main className="">
            <JsonLd data={homeSchema()} />
            <HomePageFromCms />
        </main>
    );
}
