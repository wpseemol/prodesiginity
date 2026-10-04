/**
 * Team data for the staff directory (/team) and profiles (/team/<slug>).
 *
 * Reads `GET /api/team` (what the dashboard's Team members + "My public
 * profile" pages manage) and normalises it onto `TeamMember`. When the API is
 * unreachable at build time the static roster in data/teamData.ts is used, so
 * the pages still export.
 *
 * Safe to import from server and client components.
 */

import { apiBaseUrl, mediaUrl } from "@/config/api";
import type { BlogPost } from "@/data/blog/types";
import {
    TEAM_MEMBERS,
    type AvatarShape,
    type SocialNetwork,
    type TeamMember,
} from "@/data/teamData";

export const TEAM_BASE_PATH = "/team";

const SOCIAL_NETWORKS: SocialNetwork[] = [
    "facebook",
    "instagram",
    "linkedin",
    "behance",
    "dribbble",
    "artstation",
    "x",
    "github",
    "youtube",
    "website",
];

type Json = Record<string, unknown>;

const str = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const optStr = (value: unknown): string | undefined => str(value) || undefined;

/** URL segment for a member. Seeded slugs are mixed-case ("Abdullah-Pitul"). */
export function staffSlug(member: Pick<TeamMember, "id">): string {
    return member.id.toLowerCase();
}

export function staffHref(member: Pick<TeamMember, "id"> | string): string {
    const slug = typeof member === "string" ? member.toLowerCase() : staffSlug(member);
    return `${TEAM_BASE_PATH}/${slug}`;
}

function toSocials(value: unknown): TeamMember["socials"] {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const out: TeamMember["socials"] = {};
    for (const network of SOCIAL_NETWORKS) {
        const url = str((value as Json)[network]);
        if (/^https?:\/\//i.test(url)) out[network] = url;
    }
    return out;
}

function toMember(raw: Json): TeamMember | null {
    const id = str(raw.slug) || str(raw.id);
    const name = str(raw.name);
    const photo = str(raw.photo);
    if (!id || !name) return null;

    return {
        id,
        name,
        role: str(raw.role) || "Team member",
        tagline: optStr(raw.tagline),
        description: optStr(raw.description),
        photo: mediaUrl(photo) ?? photo,
        photoAlt: optStr(raw.photoAlt),
        avatar: mediaUrl(optStr(raw.avatar)),
        avatarShape: (optStr(raw.avatarShape) as AvatarShape | undefined) ?? undefined,
        profileStyle: optStr(raw.profileStyle),
        socials: toSocials(raw.socials),
        skills: Array.isArray(raw.skills)
            ? raw.skills.map(str).filter(Boolean).slice(0, 12)
            : [],
        lead: raw.lead === true,
    };
}

const STATIC_TEAM: TeamMember[] = TEAM_MEMBERS.map((member) => ({
    ...member,
    photo: mediaUrl(member.photo) ?? member.photo,
    avatar: mediaUrl(member.avatar),
}));

/** `null` when the API is unreachable or returns something unusable. */
export async function fetchTeamFromApi(init?: RequestInit): Promise<TeamMember[] | null> {
    try {
        const res = await fetch(`${apiBaseUrl}/team`, {
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
            ...init,
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { members?: unknown };
        if (!Array.isArray(data.members)) return null;
        const members = data.members
            .filter((m): m is Json => !!m && typeof m === "object")
            .map(toMember)
            .filter((m): m is TeamMember => m !== null);
        return members.length > 0 ? members : null;
    } catch {
        return null;
    }
}

/** One profile straight from the API (used by the client 404 fallback). */
export async function fetchLiveStaff(slug: string): Promise<TeamMember | null> {
    try {
        const res = await fetch(`${apiBaseUrl}/team/${encodeURIComponent(slug)}`, {
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { member?: unknown };
        return data.member && typeof data.member === "object"
            ? toMember(data.member as Json)
            : null;
    } catch {
        return null;
    }
}

let buildCache: { at: number; promise: Promise<TeamMember[]> } | null = null;

/**
 * Build-time / server loader. Never throws. Shared for a few seconds so a
 * static build makes one API call instead of one per profile page.
 */
export function getTeamData(): Promise<TeamMember[]> {
    if (typeof window === "undefined" && buildCache && Date.now() - buildCache.at < 30_000) {
        return buildCache.promise;
    }
    const promise = fetchTeamFromApi().then((live) => live ?? STATIC_TEAM);
    if (typeof window === "undefined") buildCache = { at: Date.now(), promise };
    return promise;
}

export function findStaff(team: TeamMember[], slug: string): TeamMember | undefined {
    const wanted = slug.toLowerCase();
    return team.find((member) => staffSlug(member) === wanted);
}

export function findStaffByName(team: TeamMember[], name: string): TeamMember | undefined {
    const wanted = name.trim().toLowerCase();
    return team.find((member) => member.name.trim().toLowerCase() === wanted);
}

/** Articles whose byline is this member (by profile slug, else by name). */
export function postsByMember(posts: BlogPost[], member: TeamMember): BlogPost[] {
    const slug = staffSlug(member);
    const name = member.name.trim().toLowerCase();
    return posts.filter((post) =>
        post.author.slug
            ? post.author.slug.toLowerCase() === slug
            : post.author.name.trim().toLowerCase() === name,
    );
}

export function firstName(member: Pick<TeamMember, "name">): string {
    return member.name.trim().split(/\s+/)[0] ?? member.name;
}
