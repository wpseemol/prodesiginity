// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 * @param inputs - Class names or objects
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Derangement shuffle algorithm: guarantees NO item stays in its previous index
export function shiftAndShuffle<T>(array: T[]): T[] {
    if (array.length <= 1) return array;
    const len = array.length;
    // Step 1: Force offset every element by at least 1-3 slots
    const shiftOffset = Math.floor(Math.random() * (len - 1)) + 1;
    const shifted = array.map((_, i) => array[(i + shiftOffset) % len]);

    // Step 2: Swap adjacent pairs to add natural randomness while preserving positional change
    for (let i = 0; i < len - 1; i += 2) {
        const temp = shifted[i];
        shifted[i] = shifted[i + 1];
        shifted[i + 1] = temp;
    }
    return shifted;
}
