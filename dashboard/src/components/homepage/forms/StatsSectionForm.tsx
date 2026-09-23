import { Trash2Icon } from "lucide-react";
import { asArr, asStr } from "@/components/homepage/helpers";
import {
  ContentCard,
  Field,
  FieldGrid,
  ItemCard,
  SectionToolbar,
} from "@/components/homepage/FormUi";
import type { SectionFormProps } from "@/components/homepage/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StatsSectionForm({ content, onChange }: SectionFormProps) {
  const items = asArr<{
    icon?: string;
    value?: string;
    label?: string;
    description?: string;
    accent?: string;
  }>(content.items);
  const set = (patch: Record<string, unknown>) =>
    onChange({ ...content, ...patch });

  return (
    <div className="grid gap-4">
      <ContentCard title="Section header">
        <Field label="Pill">
          <Input
            className="h-9"
            value={asStr(content.pill)}
            onChange={(e) => set({ pill: e.target.value })}
          />
        </Field>
      </ContentCard>

      <div className="grid gap-3">
        <SectionToolbar
          countLabel={`${items.length} tile${items.length === 1 ? "" : "s"}`}
          addLabel="Add tile"
          onAdd={() =>
            set({
              items: [
                ...items,
                {
                  icon: "Video",
                  value: "New",
                  label: "Label",
                  description: "",
                  accent: "emerald",
                },
              ],
            })
          }
        />

        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item, index) => (
            <ItemCard key={index}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">
                  {asStr(item.label) || `Tile ${index + 1}`}
                </p>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    set({ items: items.filter((_, i) => i !== index) })
                  }
                  aria-label="Delete tile"
                >
                  <Trash2Icon />
                </Button>
              </div>
              <FieldGrid cols={2}>
                <Field label="Icon">
                  <Input
                    className="h-9"
                    value={asStr(item.icon)}
                    onChange={(e) => {
                      const next = [...items];
                      next[index] = { ...item, icon: e.target.value };
                      set({ items: next });
                    }}
                  />
                </Field>
                <Field label="Value">
                  <Input
                    className="h-9"
                    value={asStr(item.value)}
                    onChange={(e) => {
                      const next = [...items];
                      next[index] = { ...item, value: e.target.value };
                      set({ items: next });
                    }}
                  />
                </Field>
                <Field label="Label">
                  <Input
                    className="h-9"
                    value={asStr(item.label)}
                    onChange={(e) => {
                      const next = [...items];
                      next[index] = { ...item, label: e.target.value };
                      set({ items: next });
                    }}
                  />
                </Field>
                <Field label="Accent">
                  <Input
                    className="h-9"
                    value={asStr(item.accent)}
                    onChange={(e) => {
                      const next = [...items];
                      next[index] = { ...item, accent: e.target.value };
                      set({ items: next });
                    }}
                    placeholder="emerald"
                  />
                </Field>
              </FieldGrid>
              <div className="mt-3">
                <Field label="Description">
                  <Input
                    className="h-9"
                    value={asStr(item.description)}
                    onChange={(e) => {
                      const next = [...items];
                      next[index] = { ...item, description: e.target.value };
                      set({ items: next });
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
