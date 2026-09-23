import { asArr, asStr } from "@/components/homepage/helpers";
import type { SectionFormProps } from "@/components/homepage/types";
import { TEXTAREA_CLASS } from "@/components/homepage/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, Trash2Icon } from "lucide-react";

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
      <div className="grid gap-2">
        <Label>Pill</Label>
        <Input
          value={asStr(content.pill)}
          onChange={(e) => set({ pill: e.target.value })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Feature tiles</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
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
        >
          <PlusIcon />
          Add tile
        </Button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-xl border p-3">
          <div className="grid gap-2 sm:grid-cols-4">
            <Input
              value={asStr(item.icon)}
              onChange={(e) => {
                const next = [...items];
                next[index] = { ...item, icon: e.target.value };
                set({ items: next });
              }}
              placeholder="Icon"
            />
            <Input
              value={asStr(item.value)}
              onChange={(e) => {
                const next = [...items];
                next[index] = { ...item, value: e.target.value };
                set({ items: next });
              }}
              placeholder="Value"
            />
            <Input
              value={asStr(item.label)}
              onChange={(e) => {
                const next = [...items];
                next[index] = { ...item, label: e.target.value };
                set({ items: next });
              }}
              placeholder="Label"
            />
            <Input
              value={asStr(item.accent)}
              onChange={(e) => {
                const next = [...items];
                next[index] = { ...item, accent: e.target.value };
                set({ items: next });
              }}
              placeholder="Accent"
            />
          </div>
          <div className="flex gap-2">
            <Input
              className="flex-1"
              value={asStr(item.description)}
              onChange={(e) => {
                const next = [...items];
                next[index] = { ...item, description: e.target.value };
                set({ items: next });
              }}
              placeholder="Description"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                set({ items: items.filter((_, i) => i !== index) })
              }
            >
              <Trash2Icon />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
