"use client";

import { Rotate3d, Boxes } from "lucide-react";
import SmartImage from "./SmartImage";
import { ACCENTS, CardShell, CardBadge } from "./portfolioTheme";
import type { Product3DWork } from "@/data/portfolioData";

/* 3D: the deliverable is an array, not a picture. So the card shows the
   hero render with the rest of the angle set as a filmstrip along the
   bottom — you can see there are five of them before opening anything. */

export default function Product3DCard({
    item,
    onOpen,
}: {
    item: Product3DWork;
    onOpen: (item: Product3DWork) => void;
}) {
    const accent = ACCENTS[item.accent];

    return (
        <CardShell
            accent={accent}
            label={`Open case study: ${item.title}`}
            onClick={() => onOpen(item)}
        >
            <span className="relative block aspect-16/10 w-full overflow-hidden bg-slate-950">
                <SmartImage
                    src={item.renders[0]?.src ?? item.thumbnail}
                    alt={`${item.title} — ${item.renders[0]?.angle ?? "hero"}`}
                    fallbackLabel={item.client}
                    fill
                    sizes="(max-width: 768px) 90vw, 45vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 motion-reduce:transition-none"
                />

                {/* Wireframe hint on hover — the 3D tell */}
                <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none motion-reduce:transition-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(34,211,238,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.18) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />

                <span className="absolute top-4 left-4 z-10">
                    <CardBadge accent={accent}>
                        <Boxes className="w-3 h-3" />
                        {item.badge}
                    </CardBadge>
                </span>

                <span className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-md border border-cyan-400/25 text-cyan-300 text-[10px] font-black tracking-wider">
                    <Rotate3d className="w-3 h-3" />
                    {item.renders.length} ANGLES
                </span>

                <span className="absolute inset-x-0 bottom-0 block px-4 pb-3 pt-10 bg-linear-to-t from-black/95 to-transparent z-10">
                    <span className="block text-sm sm:text-base font-black text-white leading-snug line-clamp-2">
                        {item.title}
                    </span>
                    <span className="block font-mono text-[10px] text-cyan-300/80 mt-1">
                        {item.engine} · {item.polyCount}
                    </span>
                </span>
            </span>

            {/* Angle filmstrip */}
            <span className="flex gap-1.5 p-3 bg-slate-950">
                {item.renders.slice(0, 5).map((r, i) => (
                    <span
                        key={r.angle}
                        className={`relative block flex-1 aspect-square rounded-md overflow-hidden border transition-all duration-300 motion-reduce:transition-none ${
                            i === 0
                                ? "border-cyan-400/70"
                                : "border-white/10 opacity-60 group-hover:opacity-100"
                        }`}
                    >
                        <SmartImage
                            src={r.src}
                            alt={r.angle}
                            fallbackLabel={r.angle}
                            fill
                            sizes="80px"
                            className="object-cover"
                        />
                    </span>
                ))}
            </span>
        </CardShell>
    );
}
