import { asArr, asStr } from "@/components/homepage/helpers";
import type { SectionFormProps } from "@/components/homepage/types";
import { TEXTAREA_CLASS } from "@/components/homepage/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProcessSectionForm({ content, onChange }: SectionFormProps) {
  const steps = asArr<{
    number?: string;
    stepFraction?: string;
    badge?: string;
    title?: string;
    description?: string;
    icon?: string;
  }>(content.steps);
  const set = (patch: Record<string, unknown>) =>
    onChange({ ...content, ...patch });

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Pill</Label>
          <Input
            value={asStr(content.pill)}
            onChange={(e) => set({ pill: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Headline</Label>
          <Input
            value={asStr(content.headline)}
            onChange={(e) => set({ headline: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Headline accent</Label>
          <Input
            value={asStr(content.headlineAccent)}
            onChange={(e) => set({ headlineAccent: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <textarea
          className={TEXTAREA_CLASS}
          value={asStr(content.description)}
          onChange={(e) => set({ description: e.target.value })}
        />
      </div>
      <Label>Steps</Label>
      {steps.map((step, index) => (
        <div key={index} className="grid gap-2 rounded-xl border p-3">
          <div className="grid gap-2 sm:grid-cols-4">
            <Input
              value={asStr(step.number)}
              onChange={(e) => {
                const next = [...steps];
                next[index] = { ...step, number: e.target.value };
                set({ steps: next });
              }}
              placeholder="01"
            />
            <Input
              value={asStr(step.stepFraction)}
              onChange={(e) => {
                const next = [...steps];
                next[index] = { ...step, stepFraction: e.target.value };
                set({ steps: next });
              }}
              placeholder="1/5"
            />
            <Input
              value={asStr(step.badge)}
              onChange={(e) => {
                const next = [...steps];
                next[index] = { ...step, badge: e.target.value };
                set({ steps: next });
              }}
              placeholder="Badge"
            />
            <Input
              value={asStr(step.icon)}
              onChange={(e) => {
                const next = [...steps];
                next[index] = { ...step, icon: e.target.value };
                set({ steps: next });
              }}
              placeholder="Icon"
            />
          </div>
          <Input
            value={asStr(step.title)}
            onChange={(e) => {
              const next = [...steps];
              next[index] = { ...step, title: e.target.value };
              set({ steps: next });
            }}
            placeholder="Title"
          />
          <textarea
            className={TEXTAREA_CLASS}
            value={asStr(step.description)}
            onChange={(e) => {
              const next = [...steps];
              next[index] = { ...step, description: e.target.value };
              set({ steps: next });
            }}
            placeholder="Description"
          />
        </div>
      ))}
    </div>
  );
}
