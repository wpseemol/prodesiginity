import HomePageFromCms from "@/components/home/HomePageFromCms";
import JsonLd from "@/components/home/JsonLd";
import { getServicesCatalog } from "@/lib/services-catalog";
import { homeSchema } from "@/lib/seo";

export default async function Home() {
    const servicesCatalog = await getServicesCatalog();

    return (
        <main className="">
            <JsonLd data={homeSchema(servicesCatalog)} />
            <HomePageFromCms servicesCatalog={servicesCatalog} />
        </main>
    );
}
