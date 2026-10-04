/**
 * Careers page data — what the dashboard's Admin → Careers page manages.
 *
 * Reads `GET /api/careers/page` (page copy + published openings). The static
 * copy in data/careerData.ts fills any gap and is used whole when the API is
 * unreachable, so the page still exports.
 *
 * Safe to import from server and client components.
 */

import { apiBaseUrl } from "@/config/api";
import {
    CAREERS_CONTENT,
    OPEN_POSITIONS,
    type CareerPerk,
    type CareersContent,
    type JobPosition,
} from "@/data/careerData";

export interface CareersData {
    content: CareersContent;
    jobs: JobPosition[];
}

export const STATIC_CAREERS: CareersData = {
    content: CAREERS_CONTENT,
    jobs: OPEN_POSITIONS,
};

type Json = Record<string, unknown>;

const str = (value: unknown, fallback = ""): string =>
    typeof value === "string" && value.trim() ? value.trim() : fallback;

const obj = (value: unknown): Json =>
    value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : {};

function pick<T extends Record<string, string>>(raw: unknown, fallback: T): T {
    const source = obj(raw);
    const out = { ...fallback };
    for (const key of Object.keys(fallback) as (keyof T)[]) {
        out[key] = str(source[key as string], fallback[key]) as T[keyof T];
    }
    return out;
}

function toContent(raw: unknown): CareersContent {
    const source = obj(raw);
    const perks = obj(source.perks);
    const fallback = CAREERS_CONTENT;
    const items: CareerPerk[] = Array.isArray(perks.items)
        ? perks.items
              .map(obj)
              .map((item) => ({
                  icon: str(item.icon, "Sparkles"),
                  title: str(item.title),
                  description: str(item.description),
              }))
              .filter((item) => item.title)
        : fallback.perks.items;

    return {
        hero: pick(source.hero, fallback.hero),
        form: pick(source.form, fallback.form),
        perks: {
            title: str(perks.title, fallback.perks.title),
            subtitle: str(perks.subtitle, fallback.perks.subtitle),
            items,
        },
        openings: pick(source.openings, fallback.openings),
    };
}

function toJob(raw: Json): JobPosition | null {
    const title = str(raw.title);
    if (!title) return null;
    return {
        id: String(raw.id ?? title),
        title,
        department: str(raw.department),
        type: str(raw.type),
        location: str(raw.location),
        experience: str(raw.experience),
        salary: str(raw.salary),
        description: str(raw.description),
    };
}

/** `null` when the API is unreachable or returns something unusable. */
export async function fetchCareersData(init?: RequestInit): Promise<CareersData | null> {
    try {
        const res = await fetch(`${apiBaseUrl}/careers/page`, {
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
            ...init,
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { content?: unknown; jobs?: unknown };
        if (!Array.isArray(data.jobs)) return null;
        return {
            content: toContent(data.content),
            jobs: data.jobs
                .map(obj)
                .map(toJob)
                .filter((job): job is JobPosition => job !== null),
        };
    } catch {
        return null;
    }
}

/** Build-time / server loader. Never throws. */
export async function getCareersData(): Promise<CareersData> {
    return (await fetchCareersData()) ?? STATIC_CAREERS;
}
