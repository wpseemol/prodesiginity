"use client";

import { useEffect, useState } from "react";
import BrandsMarquee from "@/components/home/BrandsMarquee";
import HeroSection from "@/components/home/hero/HeroSection";
import PricingSection from "@/components/home/PricingSection";
import ProcessSection from "@/components/home/ProcessSection";
import RecentProjects from "@/components/home/recent-projects/RecentProjects";
import ServicesMarquee from "@/components/home/ServicesMarquee";
import StatsSection from "@/components/home/StatsSection";
import TeamSection from "@/components/home/team/TeamSection";
import { apiBaseUrl } from "@/config/api";
import type { TeamMember } from "@/data/teamData";
import {
  fetchHomepageSections,
  sectionContent,
  type BrandsCmsContent,
  type HeroCmsContent,
  type HomepageSectionsMap,
  type PricingCmsContent,
  type ProcessCmsContent,
  type RecentProjectsCmsContent,
  type StatsCmsContent,
} from "@/lib/homepage";

/**
 * Client shell that loads homepage CMS + team from the API and feeds sections.
 * Static fallbacks inside each section keep the page usable if the API is down.
 */
export default function HomePageFromCms() {
  const [sections, setSections] = useState<HomepageSectionsMap | null>(null);
  const [team, setTeam] = useState<TeamMember[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [homepage, teamRes] = await Promise.all([
        fetchHomepageSections(),
        fetch(`${apiBaseUrl}/team`, { cache: "no-store" })
          .then(async (res) => {
            if (!res.ok) return null;
            const data = (await res.json()) as { members?: TeamMember[] };
            return data.members?.length ? data.members : null;
          })
          .catch(() => null),
      ]);
      if (cancelled) return;
      setSections(homepage);
      setTeam(teamRes);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hero = sectionContent<HeroCmsContent>(sections, "hero");
  const stats = sectionContent<StatsCmsContent>(sections, "stats");
  const brands = sectionContent<BrandsCmsContent>(sections, "brands");
  const process = sectionContent<ProcessCmsContent>(sections, "process");
  const recent = sectionContent<RecentProjectsCmsContent>(
    sections,
    "recentProjects",
  );
  const pricing = sectionContent<PricingCmsContent>(sections, "pricing");

  return (
    <>
      <HeroSection content={hero ?? undefined} />
      <StatsSection content={stats ?? undefined} />
      <BrandsMarquee content={brands ?? undefined} />
      <ServicesMarquee />
      <ProcessSection content={process ?? undefined} />
      <RecentProjects
        eyebrow={recent?.eyebrow}
        headline={recent?.headline}
        headlineAccent={recent?.headlineAccent}
        description={recent?.description}
        projects={recent?.projects}
      />
      <PricingSection content={pricing ?? undefined} />
      <TeamSection members={team} />
    </>
  );
}
