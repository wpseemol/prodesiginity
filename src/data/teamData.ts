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
        id: "Yeasin-Iqbal",
        name: "Yeasin Iqbal",
        role: "3D Product design & Modeling",
        photo: "/assets/images/team/yeasin.jpg",
    },
    {
        id: "Antor-Halder",
        name: "Antor Halder",
        role: "2D animator",
        photo: "/assets/images/team/antor.jpg",
    },
    {
        id: "Abdullah-Pitul",
        name: "Abdullah Pitul",
        role: "Founder & 3D Product Designer",
        tagline: "Building ProDesignity since 2019",
        photo: "/assets/images/team/pitul.jpg",
        lead: true,
    },
    {
        id: "Seemol-Chakroborti",
        name: "Seemol Chakroborti",
        role: "Web Developer & Designer",
        photo: "/assets/images/team/seemol.jpg",
    },
    {
        id: "Syedal-Nasif",
        name: "Syedal Nasif",
        role: "HR",
        photo: "/assets/images/team/nasif.jpg",
    },
    {
        id: "Asif-Iqbol-Suzon",
        name: "Asif Iqbol Suzon",
        role: "Graphic Designer",
        photo: "/assets/images/team/asif.jpg",
    },
];

/** Index the slider opens on: the founder, if there is one. */
export const TEAM_INITIAL_INDEX = Math.max(
    TEAM_MEMBERS.findIndex((m) => m.lead),
    0,
);
