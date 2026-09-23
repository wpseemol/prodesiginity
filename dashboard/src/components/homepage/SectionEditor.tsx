import { BrandsSectionForm } from "@/components/homepage/forms/BrandsSectionForm";
import { HeroSectionForm } from "@/components/homepage/forms/HeroSectionForm";
import { PricingSectionForm } from "@/components/homepage/forms/PricingSectionForm";
import { ProcessSectionForm } from "@/components/homepage/forms/ProcessSectionForm";
import { RecentProjectsSectionForm } from "@/components/homepage/forms/RecentProjectsSectionForm";
import { StatsSectionForm } from "@/components/homepage/forms/StatsSectionForm";
import type {
  HomepageSectionKey,
  SectionFormProps,
} from "@/components/homepage/types";

type SectionEditorProps = SectionFormProps & {
  sectionKey: HomepageSectionKey;
};

export function SectionEditor({
  sectionKey,
  content,
  onChange,
}: SectionEditorProps) {
  switch (sectionKey) {
    case "hero":
      return <HeroSectionForm content={content} onChange={onChange} />;
    case "stats":
      return <StatsSectionForm content={content} onChange={onChange} />;
    case "brands":
      return <BrandsSectionForm content={content} onChange={onChange} />;
    case "process":
      return <ProcessSectionForm content={content} onChange={onChange} />;
    case "recentProjects":
      return (
        <RecentProjectsSectionForm content={content} onChange={onChange} />
      );
    case "pricing":
      return <PricingSectionForm content={content} onChange={onChange} />;
    default:
      return null;
  }
}
