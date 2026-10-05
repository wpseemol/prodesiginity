/**
 * /team — the staff directory. Every card links to that member's profile
 * (/team/<slug>), and each one is styled for their craft (see
 * data/staffStyles.ts), so the grid previews the profile it leads to.
 *
 * The roster is baked in at build time, then refreshed in the browser from
 * GET /api/team (TeamDirectory), so dashboard edits apply without a redeploy.
 */

import { HeaderPill } from "@/components/HeaderPill";
import JsonLd from "@/components/home/JsonLd";
import TeamDirectory, { TeamSpecialities } from "@/components/team/TeamDirectory";
import { siteConfig } from "@/config/site";
import { breadcrumbSchema, buildMetadata, graph } from "@/lib/seo";
import { getTeamData, TEAM_BASE_PATH } from "@/lib/team-api";

import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
    title: "Our Team — the specialists behind every project",
    description: `Meet the ${siteConfig.name} team: 3D product designers, graphic designers, developers, animators and marketers. You work directly with the people doing the work.`,
    path: TEAM_BASE_PATH,
});

export default async function TeamPage() {
    const team = await getTeamData();

    return (
        <div className="relative overflow-x-clip bg-white font-sans text-slate-900 transition-colors duration-300 dark:bg-[#070B14] dark:text-slate-100">
            <JsonLd
                data={graph(
                    breadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Team", path: TEAM_BASE_PATH },
                    ]),
                )}
            />

            <header className="relative px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8">
                <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-linear-to-tr from-brand-violet/20 via-primary/10 to-cyan-400/20 blur-3xl" />
                <div className="container relative mx-auto max-w-3xl px-4">
                    <HeaderPill text="The Crew Behind It" className="sm:mb-6" />
                    <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                        Specialists, not{" "}
                        <span className="bg-linear-to-r from-primary via-brand-violet to-cyan-500 bg-clip-text text-transparent dark:from-primary dark:via-dark-primary dark:to-cyan-400">
                            account managers
                        </span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                        Small studio, specialist roles. Open any profile to see what
                        each person works on and where to find their work.
                    </p>

                    <TeamSpecialities initialTeam={team} />
                </div>
            </header>

            <section className="relative px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
                <TeamDirectory initialTeam={team} />
            </section>
        </div>
    );
}
