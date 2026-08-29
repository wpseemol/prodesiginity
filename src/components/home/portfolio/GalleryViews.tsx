"use client";

import { useState } from "react";
import {
    Box,
    Calendar,
    Gauge,
    Layers,
    Palette,
    Printer,
    Rotate3d,
    Ruler,
    Scissors,
    Package,
    Tag,
    Target,
    Megaphone,
    Filter,
} from "lucide-react";
import SmartImage from "./SmartImage";
import {
    SectionHeading,
    StatGrid,
    ResultGrid,
    ChipRow,
    TickList,
    Overview,
    HorizontalRail,
} from "./shared";
import type {
    PackagingWork,
    AmazonWork,
    Product3DWork,
    MarketingWork,
} from "@/data/portfolioData";

/* Profile: GALLERY — the deliverable is a set of stills. Four disciplines
   share that, and each presents the set differently: packaging scrolls
   artboards, Amazon stacks modules, 3D switches angles, marketing lines
   up variants against their results. */

/* =========================== PACKAGING ============================ */

export function PackagingMedia({ item }: { item: PackagingWork }) {
    return (
        <div className="w-full bg-slate-950 p-4">
            <p className="flex items-center gap-2 mb-2.5 text-xs font-bold text-slate-400">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                {item.artboards.length} artboards — scroll to view
            </p>

            <HorizontalRail>
                {item.artboards.map((a) => (
                    <figure
                        key={a.src}
                        className="shrink-0 snap-start w-[78%] sm:w-[58%] lg:w-[44%]"
                    >
                        <div className="relative aspect-4/5 w-full rounded-xl overflow-hidden bg-black border border-white/10">
                            <SmartImage
                                src={a.src}
                                alt={a.label}
                                fallbackLabel={a.label}
                                fill
                                sizes="(max-width: 640px) 78vw, 44vw"
                                className="object-cover"
                            />
                        </div>
                        <figcaption className="mt-2">
                            <span className="block text-[11px] font-black text-white">
                                {a.label}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                                {a.note}
                            </span>
                        </figcaption>
                    </figure>
                ))}

                {item.dieline && (
                    <figure className="shrink-0 snap-start w-[78%] sm:w-[58%] lg:w-[44%]">
                        <div className="relative aspect-4/5 w-full rounded-xl overflow-hidden bg-white border border-amber-400/40">
                            <SmartImage
                                src={item.dieline}
                                alt="Dieline"
                                fallbackLabel="Dieline"
                                fill
                                sizes="(max-width: 640px) 78vw, 44vw"
                                className="object-contain p-4"
                            />
                        </div>
                        <figcaption className="mt-2">
                            <span className="flex items-center gap-1.5 text-[11px] font-black text-amber-400">
                                <Scissors className="w-3 h-3" />
                                Dieline
                            </span>
                            <span className="block text-[10px] text-slate-400">
                                Cut, crease and bleed
                            </span>
                        </figcaption>
                    </figure>
                )}
            </HorizontalRail>
        </div>
    );
}

export function PackagingBody({ item }: { item: PackagingWork }) {
    return (
        <>
            <StatGrid
                stats={[
                    { label: "Client", value: item.client, icon: Package },
                    { label: "Substrate", value: item.printSpec.substrate },
                    {
                        label: "Size",
                        value: item.printSpec.dimensions,
                        icon: Ruler,
                    },
                    { label: "Year", value: item.year, icon: Calendar },
                ]}
            />

            <Overview text={item.description} />

            <div className="space-y-3">
                <SectionHeading icon={Palette}>Palette</SectionHeading>
                <div className="flex flex-wrap gap-3">
                    {item.palette.map((c) => (
                        <div key={c.hex} className="flex items-center gap-2.5">
                            <span
                                className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/15 shadow-sm"
                                style={{ backgroundColor: c.hex }}
                            />
                            <span>
                                <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                    {c.name}
                                </span>
                                <span className="block font-mono text-[10px] text-slate-400">
                                    {c.hex}
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <SectionHeading icon={Printer}>Print spec</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                        ["Substrate", item.printSpec.substrate],
                        ["Finish", item.printSpec.finish],
                        ["Dimensions", item.printSpec.dimensions],
                        ["Method", item.printSpec.printMethod],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="p-3 rounded-xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color"
                        >
                            <p className="text-[10px] font-bold uppercase text-slate-400">
                                {label}
                            </p>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2.5">
                <SectionHeading icon={Layers}>Delivered</SectionHeading>
                <TickList items={item.deliverables} />
            </div>
        </>
    );
}

/* ============================ AMAZON A+ =========================== */

export function AmazonMedia({ item }: { item: AmazonWork }) {
    return (
        <div className="w-full bg-slate-950 p-4">
            <p className="flex items-center gap-2 mb-2.5 text-xs font-bold text-slate-400">
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                A+ modules, in listing order
            </p>

            {/* Stacked, because that's how a shopper meets them */}
            <div className="space-y-3 max-h-105 overflow-y-auto pr-1 scrollbar-thin">
                {item.modules.map((m, i) => (
                    <figure
                        key={m.type}
                        className="rounded-xl overflow-hidden border border-white/10 bg-black"
                    >
                        <div className="relative aspect-1464/600 w-full">
                            <SmartImage
                                src={m.src}
                                alt={m.headline}
                                fallbackLabel={m.type}
                                fill
                                sizes="100vw"
                                className="object-cover"
                            />
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-orange-500 text-white text-[9px] font-black uppercase tracking-wide">
                                {String(i + 1).padStart(2, "0")} · {m.type}
                            </span>
                        </div>
                        <figcaption className="px-3 py-2.5 bg-slate-900">
                            <span className="block text-[11px] font-black text-white">
                                {m.headline}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                                {m.purpose}
                            </span>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </div>
    );
}

export function AmazonBody({ item }: { item: AmazonWork }) {
    return (
        <>
            <ResultGrid results={item.listingStats} />

            <Overview text={item.description} />

            <div className="space-y-3">
                <SectionHeading icon={Tag}>Target keywords</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.keywords.map((k) => (
                        <div
                            key={k}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color"
                        >
                            <span className="font-mono text-[10px] text-orange-400 shrink-0">
                                kw
                            </span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {k}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2.5">
                <SectionHeading icon={Package}>Delivered</SectionHeading>
                <TickList items={item.deliverables} />
            </div>
        </>
    );
}

/* ========================= 3D PRODUCT DESIGN ====================== */

export function Product3DMedia({ item }: { item: Product3DWork }) {
    const [active, setActive] = useState(0);
    const [showTurntable, setShowTurntable] = useState(false);

    const current = item.renders[active];

    return (
        <div className="w-full bg-slate-950">
            <div className="relative aspect-video w-full bg-black">
                {showTurntable && item.turntable ? (
                    <video
                        src={item.turntable}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <SmartImage
                        key={current.src}
                        src={current.src}
                        alt={`${item.title} — ${current.angle}`}
                        fallbackLabel={current.angle}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                )}

                {!showTurntable && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur text-[10px] font-semibold text-slate-300 border border-white/10">
                        {current.lighting}
                    </span>
                )}
            </div>

            {/* Angle switcher */}
            <div className="flex items-center gap-2 overflow-x-auto p-3 bg-slate-900/90 border-t border-white/10 scrollbar-none [&::-webkit-scrollbar]:hidden">
                <Rotate3d className="w-4 h-4 text-cyan-400 shrink-0" />
                {item.renders.map((r, i) => (
                    <button
                        key={r.angle}
                        type="button"
                        onClick={() => {
                            setActive(i);
                            setShowTurntable(false);
                        }}
                        className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            !showTurntable && active === i
                                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30"
                                : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                    >
                        {r.angle}
                    </button>
                ))}

                {item.turntable && (
                    <button
                        type="button"
                        onClick={() => setShowTurntable(true)}
                        className={`shrink-0 ml-auto px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            showTurntable
                                ? "bg-cyan-500 text-white"
                                : "bg-slate-800 text-cyan-400 hover:text-white"
                        }`}
                    >
                        360° turntable
                    </button>
                )}
            </div>
        </div>
    );
}

export function Product3DBody({ item }: { item: Product3DWork }) {
    return (
        <>
            <StatGrid
                stats={[
                    { label: "Client", value: item.client },
                    { label: "Engine", value: item.engine, icon: Box },
                    { label: "Geometry", value: item.polyCount },
                    { label: "Year", value: item.year, icon: Calendar },
                ]}
            />

            <Overview text={item.description} />

            <div className="space-y-3">
                <SectionHeading icon={Gauge}>Render settings</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {item.renderPasses.map((p) => (
                        <div
                            key={p.label}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color"
                        >
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {p.label}
                            </span>
                            <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                                {p.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2.5">
                <SectionHeading icon={Layers}>Texture maps</SectionHeading>
                <ChipRow items={item.textureMaps} />
            </div>

            <div className="space-y-2.5">
                <SectionHeading icon={Box}>Delivered</SectionHeading>
                <TickList items={item.deliverables} />
            </div>
        </>
    );
}

/* ============================ MARKETING =========================== */

export function MarketingMedia({ item }: { item: MarketingWork }) {
    return (
        <div className="w-full bg-slate-950 p-4">
            <p className="flex items-center gap-2 mb-2.5 text-xs font-bold text-slate-400">
                <Megaphone className="w-3.5 h-3.5 text-rose-400" />
                {item.creatives.length} creatives tested
            </p>

            <HorizontalRail>
                {item.creatives.map((c) => {
                    const won = !c.result.toLowerCase().includes("cut");
                    return (
                        <figure
                            key={c.label}
                            className="shrink-0 snap-start w-[62%] sm:w-[40%] lg:w-[30%]"
                        >
                            <div
                                className={`relative aspect-9/16 w-full rounded-xl overflow-hidden bg-black border ${
                                    won
                                        ? "border-emerald-500/40"
                                        : "border-white/10"
                                }`}
                            >
                                <SmartImage
                                    src={c.src}
                                    alt={c.label}
                                    fallbackLabel={c.label}
                                    fill
                                    sizes="(max-width: 640px) 62vw, 30vw"
                                    className="object-cover"
                                />
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[9px] font-black uppercase text-white border border-white/10">
                                    {c.platform}
                                </span>
                            </div>
                            <figcaption className="mt-2">
                                <span className="block text-[11px] font-black text-white">
                                    {c.label}
                                </span>
                                <span className="block text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                                    “{c.hook}”
                                </span>
                                <span
                                    className={`block text-[10px] font-black mt-1 ${
                                        won
                                            ? "text-emerald-400"
                                            : "text-slate-500"
                                    }`}
                                >
                                    {c.result}
                                </span>
                            </figcaption>
                        </figure>
                    );
                })}
            </HorizontalRail>
        </div>
    );
}

export function MarketingBody({ item }: { item: MarketingWork }) {
    return (
        <>
            <ResultGrid results={item.kpis} />

            <Overview text={item.description} />

            <div className="space-y-3">
                <SectionHeading icon={Filter}>Funnel</SectionHeading>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {item.funnel.map((f, i) => (
                        <div
                            key={f.stage}
                            className="p-3.5 rounded-xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color"
                            style={{ opacity: 1 - i * 0.08 }}
                        >
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                {f.stage}
                            </p>
                            <p className="text-sm font-black tabular-nums text-slate-900 dark:text-white mt-1">
                                {f.metric}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2.5">
                <SectionHeading icon={Target}>Objective</SectionHeading>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    {item.objective} · {item.spend}
                </p>
                <ChipRow items={item.channels} />
            </div>
        </>
    );
}
