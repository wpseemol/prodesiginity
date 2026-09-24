"use client";

import type { PortfolioItem } from "@/data/portfolioData";
import VideoCard from "./VideoCard";
import WebDevCard from "./WebDevCard";
import ShopifyCard from "./ShopifyCard";
import AmazonCard from "./AmazonCard";
import SeoCard from "./SeoCard";
import Product3DCard from "./Product3DCard";
import MarketingCard from "./MarketingCard";
import PackagingCard from "./PackagingCard";
import WebAppCard from "./WebAppCard";

/* One switch, nine looks. Each branch narrows the union, so every card
   component receives exactly its own type — add a field to ShopifyWork
   and only ShopifyCard has to care. */

export default function PortfolioCard({
    item,
    onOpen,
}: {
    item: PortfolioItem;
    onOpen: (item: PortfolioItem) => void;
}) {
    switch (item.kind) {
        // case "video":
        //     return <VideoCard item={item} onOpen={onOpen} />;
        case "webdev":
            return <WebDevCard item={item} onOpen={onOpen} />;
        case "shopify":
            return <ShopifyCard item={item} onOpen={onOpen} />;
        case "amazon":
            return <AmazonCard item={item} onOpen={onOpen} />;
        case "seo":
            return <SeoCard item={item} onOpen={onOpen} />;
        case "product3d":
            return <Product3DCard item={item} onOpen={onOpen} />;
        case "marketing":
            return <MarketingCard item={item} onOpen={onOpen} />;
        case "packaging":
            return <PackagingCard item={item} onOpen={onOpen} />;
        case "webapp":
            return <WebAppCard item={item} onOpen={onOpen} />;
        default:
            return null;
    }
}

export {
    VideoCard,
    WebDevCard,
    ShopifyCard,
    AmazonCard,
    SeoCard,
    Product3DCard,
    MarketingCard,
    PackagingCard,
    WebAppCard,
};
