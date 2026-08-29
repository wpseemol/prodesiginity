"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

/* ------------------------------------------------------------------
 *  SmartImage
 *
 *  next/image renders nothing visible when a src 404s or when the host
 *  isn't whitelisted in next.config — which is exactly how you end up
 *  with a grid of empty boxes. This wrapper catches that and draws a
 *  labelled placeholder instead, so a missing asset looks like a missing
 *  asset rather than a broken layout.
 *
 *  It also handles the two other silent killers:
 *    · a `fill` image inside a parent with no position → we don't fix
 *      that here, but the fallback makes it obvious something's wrong
 *    · an empty string src → treated as a miss immediately
 * ------------------------------------------------------------------ */

type SmartImageProps = Omit<ImageProps, "onError" | "alt"> & {
    alt: string;
    /** Shown inside the placeholder when the image can't load. */
    fallbackLabel?: string;
};

export default function SmartImage({
    src,
    alt,
    fallbackLabel,
    className = "",
    fill,
    ...rest
}: SmartImageProps) {
    const [failed, setFailed] = useState(!src);

    // A new src deserves a fresh attempt.
    useEffect(() => setFailed(!src), [src]);

    if (failed) {
        return (
            <span
                aria-label={alt}
                role="img"
                className={`flex flex-col items-center justify-center gap-2 bg-linear-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 text-slate-400 dark:text-slate-600 ${
                    fill ? "absolute inset-0" : "w-full h-full"
                } ${className}`}
            >
                <ImageOff className="w-6 h-6" />
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-center line-clamp-2">
                    {fallbackLabel ?? "Image unavailable"}
                </span>
            </span>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill={fill}
            className={className}
            onError={() => setFailed(true)}
            {...rest}
        />
    );
}
