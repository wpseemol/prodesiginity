/**
 * The people shown in the team slider on the homepage.
 *
 * Exactly one member should carry `lead: true` — that entry gets the founder
 * treatment (gradient frame, crown badge, tagline line) and every other card
 * renders identically to the rest. If you mark two, the slider still works,
 * you just lose the "one card stands out" effect.
 *
 * TODO: the names and photos below are placeholders. Swap `photo` for files in
 * /public/assets/team/ once you have real headshots — portrait crops around
 * 800x1000 look best in the 4:5 frame.
 */

export interface TeamMember {
    id: string;
    name: string;
    /** Job title, shown under the name. */
    role: string;
    /** One extra line. Only rendered on the lead card. */
    tagline?: string;
    photo: string;
    lead?: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
    {
        id: "team-nadia",
        name: "Nadia Rahman",
        role: "Head of Design",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "team-marcus",
        name: "Marcus Vance",
        role: "Creative Director",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "team-parves",
        name: "Parves Sikder",
        role: "Founder & CEO",
        tagline: "Building ProDesignity since 2017",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
        lead: true,
    },
    {
        id: "team-sarah",
        name: "Sarah Jenkins",
        role: "Head of Marketing",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "team-david",
        name: "David Okoye",
        role: "Lead 3D Artist",
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "team-amira",
        name: "Amira Haddad",
        role: "Motion Designer",
        photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
    },
];

/** Index the slider opens on: the founder, if there is one. */
export const TEAM_INITIAL_INDEX = Math.max(
    TEAM_MEMBERS.findIndex((m) => m.lead),
    0,
);
