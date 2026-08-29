"use client";

import { useEffect, useState } from "react";
import {
    ExternalLink,
    Gauge,
    Globe,
    Layers,
    Monitor,
    Smartphone,
    Tablet,
    ShoppingBag,
    Puzzle,
    Users,
    Hammer,
    Server,
} from "lucide-react";
import SmartImage from "./SmartImage";
import { ScoreDial } from "./portfolioTheme";
import {
    SectionHeading,
    StatGrid,
    ResultGrid,
    ChipRow,
    TickList,
    Overview,
    VisitLink,
} from "./shared";
import type { WebDevWork, ShopifyWork, WebAppWork } from "@/data/portfolioData";

/* Profile: LIVE — a real URL, real metrics, and screens you can inspect.
   Three disciplines share the profile but not the layout. */

/* ============================ WEB DEV ============================= */

const DEVICE_ICON = {
    Desktop: Monitor,
    Tablet: Tablet,
    Mobile: Smartphone,
} as const;

export function WebDevMedia({ item }: { item: WebDevWork }) {
    const [active, setActive] = useState(0);
    useEffect(() => setActive(0), [item.id]);

    const shot = item.deviceShots[active];
    const Icon = DEVICE_ICON[shot.device];

    return (
        <div className="w-full bg-slate-950">
            <div className="relative aspect-16/9 w-full overflow-hidden bg-black">
                <SmartImage
                    key={shot.src}
                    src={shot.src}
                    alt={`${item.title} — ${shot.device}`}
                    fallbackLabel={`${shot.device} view`}
                    fill
                    sizes="100vw"
                    className={
                        shot.device === "Desktop"
                            ? "object-cover object-top"
                            : "object-contain"
                    }
                    priority
                />
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur text-[10px] font-bold text-slate-200 border border-white/10">
                    <Icon className="w-3 h-3" />
                    {shot.device}
                </span>
            </div>

            {/* Device switcher + live scores */}
            <div className="flex items-center gap-2 p-3 bg-slate-900/90 border-t border-white/10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {item.deviceShots.map((s, i) => {
                    const DIcon = DEVICE_ICON[s.device];
                    return (
                        <button
                            key={s.device}
                            type="button"
                            onClick={() => setActive(i)}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                active === i
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                                    : "bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                        >
                            <DIcon className="w-3.5 h-3.5" />
                            {s.device}
                        </button>
                    );
                })}

                <span className="ml-auto flex items-center gap-2 shrink-0 pl-3">
                    <ScoreDial score={item.lighthouse.performance} size={40} />
                    <ScoreDial
                        score={item.lighthouse.accessibility}
                        size={40}
                    />
                    <ScoreDial
                        score={item.lighthouse.bestPractices}
                        size={40}
                    />
                    <ScoreDial score={item.lighthouse.seo} size={40} />
                </span>
            </div>
        </div>
    );
}

export function WebDevBody({ item }: { item: WebDevWork }) {
    return (
        <>
            <StatGrid
                stats={[
                    { label: "Client", value: item.client, icon: Globe },
                    { label: "Pages", value: String(item.pageCount) },
                    {
                        label: "Largest paint",
                        value: item.loadTime,
                        icon: Gauge,
                    },
                    { label: "Year", value: item.year },
                ]}
            />

            <Overview text={item.description} />

            <div className="space-y-3">
                <SectionHeading icon={Gauge}>Lighthouse</SectionHeading>
                <div className="flex flex-wrap gap-6 p-5 rounded-2xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color">
                    <ScoreDial
                        score={item.lighthouse.performance}
                        label="Performance"
                    />
                    <ScoreDial
                        score={item.lighthouse.accessibility}
                        label="Accessibility"
                    />
                    <ScoreDial
                        score={item.lighthouse.bestPractices}
                        label="Best practices"
                    />
                    <ScoreDial score={item.lighthouse.seo} label="SEO" />
                </div>
            </div>

            <div className="space-y-2.5">
                <SectionHeading icon={Hammer}>What we built</SectionHeading>
                <TickList items={item.buildScope} />
            </div>

            <div className="space-y-2.5">
                <SectionHeading icon={Server}>Stack</SectionHeading>
                <ChipRow items={item.stack} />
            </div>

            <div className="pt-1">
                <VisitLink href={item.siteUrl}>
                    Visit the site
                    <ExternalLink className="w-4 h-4" />
                </VisitLink>
            </div>
        </>
    );
}

/* ============================ SHOPIFY ============================= */

export function ShopifyMedia({ item }: { item: ShopifyWork }) {
    return (
        <div className="w-full bg-slate-950">
            {/* Tall capture in a scrollable window — this is a storefront,
                so let people actually scroll it rather than crop it. */}
            <div className="relative h-[420px] sm:h-[520px] w-full overflow-y-auto [scrollbar-width:thin]">
                <div className="relative w-full min-h-[1400px]">
                    <SmartImage
                        src={item.longThumbnail}
                        alt={`${item.title} — full page`}
                        fallbackLabel={item.client}
                        fill
                        sizes="100vw"
                        className="object-cover object-top"
                        priority
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/90 border-t border-white/10">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {item.plan}
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">
                    {item.theme}
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">
                    {item.skuCount}
                </span>
                <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-black">
                        {item.speedScore}
                    </span>
                    speed score
                </span>
            </div>
        </div>
    );
}

export function ShopifyBody({ item }: { item: ShopifyWork }) {
    return (
        <>
            <ResultGrid results={item.results} />

            <Overview text={item.description} />

            <div className="space-y-2.5">
                <SectionHeading icon={Hammer}>Build scope</SectionHeading>
                <TickList items={item.buildScope} />
            </div>

            <div className="space-y-2.5">
                <SectionHeading icon={Puzzle}>
                    Apps & integrations
                </SectionHeading>
                <ChipRow items={item.apps} />
            </div>

            <div className="pt-1">
                <VisitLink href={item.storeUrl}>
                    Visit the store
                    <ExternalLink className="w-4 h-4" />
                </VisitLink>
            </div>
        </>
    );
}

/* ========================= WEB APPLICATION ======================== */

export function WebAppMedia({ item }: { item: WebAppWork }) {
    const [active, setActive] = useState(0);
    useEffect(() => setActive(0), [item.id]);

    const screen = item.screens[active];

    return (
        <div className="w-full bg-[#0b0f1a]">
            <div className="relative aspect-16/9 w-full overflow-hidden bg-black">
                <SmartImage
                    key={screen.src}
                    src={screen.src}
                    alt={`${item.title} — ${screen.label}`}
                    fallbackLabel={screen.label}
                    fill
                    sizes="100vw"
                    className="object-cover object-top"
                    priority
                />
                <span className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur text-[11px] font-semibold text-slate-200 border border-white/10">
                    {screen.caption}
                </span>
            </div>

            {/* Screen tabs */}
            <div className="flex gap-2 p-3 overflow-x-auto bg-[#070b14] border-t border-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {item.screens.map((s, i) => (
                    <button
                        key={s.label}
                        type="button"
                        onClick={() => setActive(i)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            active === i
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                                : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function WebAppBody({ item }: { item: WebAppWork }) {
    return (
        <>
            <StatGrid
                stats={item.scale.map((s) => ({
                    label: s.label,
                    value: s.value,
                }))}
            />

            <Overview text={item.description} />

            <div className="space-y-3">
                <SectionHeading icon={Layers}>Modules</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {item.modules.map((m) => (
                        <div
                            key={m.name}
                            className="p-3.5 rounded-xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color"
                        >
                            <p className="text-xs font-black text-slate-900 dark:text-white">
                                {m.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {m.detail}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2.5">
                <SectionHeading icon={Users}>Roles</SectionHeading>
                <ChipRow items={item.roles} />
            </div>

            <div className="space-y-2.5">
                <SectionHeading icon={Server}>Stack</SectionHeading>
                <ChipRow items={item.stack} />
            </div>

            <div className="pt-1">
                <VisitLink href={item.appUrl}>
                    Open the app
                    <ExternalLink className="w-4 h-4" />
                </VisitLink>
            </div>
        </>
    );
}
