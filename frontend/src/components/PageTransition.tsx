"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const container = useRef(null);

    useEffect(() => {
        if (container.current) {
            // Set initial state before animation to avoid flash of content
            gsap.set(container.current, { opacity: 0, y: 15 });
            
            // Animate page content in
            gsap.to(container.current, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out",
                delay: 0.1, // Small delay to allow Next.js to finish rendering
            });
        }
    }, [pathname]);

    return (
        <div ref={container} className="w-full opacity-0">
            {children}
        </div>
    );
}
