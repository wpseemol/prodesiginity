import { Trash2Icon } from "lucide-react";
import { asArr, asStr } from "@/components/homepage/helpers";
import {
  ContentCard,
  FIELD_TEXTAREA,
  Field,
  FieldGrid,
  ItemCard,
  SectionToolbar,
} from "@/components/homepage/FormUi";
import type { SectionFormProps } from "@/components/homepage/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <ContentCard title="Section header">
        <FieldGrid cols={2}>
          <Field label="Pill">
            <Input
              className="h-9"
              value={asStr(content.pill)}
              onChange={(e) => set({ pill: e.target.value })}
            />
          </Field>
          <Field label="Headline">
            <Input
              className="h-9"
              value={asStr(content.headline)}
              onChange={(e) => set({ headline: e.target.value })}
            />
          </Field>
          <Field label="Headline accent">
            <Input
              className="h-9"
              value={asStr(content.headlineAccent)}
              onChange={(e) => set({ headlineAccent: e.target.value })}
            />
          </Field>
        </FieldGrid>
        <div className="mt-3">
          <Field label="Description">
            <textarea
              className={FIELD_TEXTAREA}
              value={asStr(content.description)}
              onChange={(e) => set({ description: e.target.value })}
            />
          </Field>
        </div>
      </ContentCard>

      <div className="grid gap-3">
        <SectionToolbar
          countLabel={`${steps.length} step${steps.length === 1 ? "" : "s"}`}
          addLabel="Add step"
          onAdd={() => {
            const n = steps.length + 1;
            set({
              steps: [
                ...steps,
                {
                  number: String(n).padStart(2, "0"),
                  stepFraction: `${n}/${n}`,
                  badge: "NEW",
                  title: "New step",
                  description: "",
                  icon: "Search",
                },
              ],
            });
          }}
        />

        <div className="grid gap-2">
          {steps.map((step, index) => (
            <ItemCard key={index}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">
                  {asStr(step.number)} · {asStr(step.title) || `Step ${index + 1}`}
                </p>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    set({ steps: steps.filter((_, i) => i !== index) })
                  }
                  aria-label="Delete step"
                >
                  <Trash2Icon />
                </Button>
              </div>
              <FieldGrid cols={4}>
                <Field label="Number">
                  <Input
                    className="h-9"
                    value={asStr(step.number)}
                    onChange={(e) => {
                      const next = [...steps];
                      next[index] = { ...step, number: e.target.value };
                      set({ steps: next });
                    }}
                  />
                </Field>
                <Field label="Fraction">
                  <Input
                    className="h-9"
                    value={asStr(step.stepFraction)}
                    onChange={(e) => {
                      const next = [...steps];
                      next[index] = { ...step, stepFraction: e.target.value };
                      set({ steps: next });
                    }}
                  />
                </Field>
                <Field label="Badge">
                  <Input
                    className="h-9"
                    value={asStr(step.badge)}
                    onChange={(e) => {
                      const next = [...steps];
                      next[index] = { ...step, badge: e.target.value };
                      set({ steps: next });
                    }}
                  />
                </Field>
                <Field label="Icon">
                  <Input
                    className="h-9"
                    value={asStr(step.icon)}
                    onChange={(e) => {
                      const next = [...steps];
                      next[index] = { ...step, icon: e.target.value };
                      set({ steps: next });
                    }}
                  />
                </Field>
              </FieldGrid>
              <div className="mt-3 grid gap-3">
                <Field label="Title">
                  <Input
                    className="h-9"
                    value={asStr(step.title)}
                    onChange={(e) => {
                      const next = [...steps];
                      next[index] = { ...step, title: e.target.value };
                      set({ steps: next });
                    }}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    className={FIELD_TEXTAREA}
                    value={asStr(step.description)}
                    onChange={(e) => {
                      const next = [...steps];
                      next[index] = { ...step, description: e.target.value };
                      set({ steps: next });
                    }}
                  />
                </Field>
              </div>
            </ItemCard>
          ))}
        </div>
      </div>
    </div>
  );
}
