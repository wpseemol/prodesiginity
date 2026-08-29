export interface Review {
    id: string;
    quote: string;
    author: string;
    role: string;
    avatar: string;
}

export const REVIEWS_DATA: Review[] = [
    {
        id: "review-1",
        quote: "Parves Sikder is an outstanding video editor! His creativity, precision, and fast turnaround truly impressed me. Every project comes out professional and engaging. Highly recommend his services!",
        author: "Joseph Montemorano",
        role: "CEO & FOUNDER",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    },
    {
        id: "review-2",
        quote: "The Shopify redesign and motion ads generated an instant 38% increase in conversions within the first 3 weeks. Communication was seamless throughout the whole process.",
        author: "Sarah Jenkins",
        role: "HEAD OF MARKETING",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
    },
    {
        id: "review-3",
        quote: "Exceptional quality on our 3D product animations and short-form video content. ProDesignity felt like an authentic extension of our internal team.",
        author: "Marcus Vance",
        role: "CREATIVE DIRECTOR",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
    },
];
