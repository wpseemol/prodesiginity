"use client";

import { useState, useEffect } from "react";

interface CounterProps {
    target: number;
    duration?: number;
}

export default function Counter({ target, duration = 2000 }: CounterProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [target, duration]);

    return <span>{count}</span>;
}
