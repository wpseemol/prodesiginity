import { asArr, asNum, asStr } from "@/components/homepage/helpers";
import type { SectionFormProps } from "@/components/homepage/types";
import { TEXTAREA_CLASS } from "@/components/homepage/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, Trash2Icon } from "lucide-react";

export function HeroSectionForm({ content, onChange }: SectionFormProps) {
  const sides = asArr<{ slot?: number; name?: string; note?: string }>(
    content.sides,
  );
  const channels = asArr<string>(content.channels);
  const stats = asArr<{
    value?: number;
    prefix?: string;
    suffix?: string;
    label?: string;
  }>(content.stats);
  const headlineLines = asArr<string>(content.headlineLines);
  const primaryCta = asObjSafe(content.primaryCta);
  const secondaryCta = asObjSafe(content.secondaryCta);

  const set = (patch: Record<string, unknown>) =>
    onChange({ ...content, ...patch });

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <Label>Pill / rating line (HTML allowed)</Label>
        <Input
          value={asStr(content.pillHtml)}
          onChange={(e) => set({ pillHtml: e.target.value })}
          placeholder='Rated <b>4.8</b> by 300+ store owners'
        />
      </div>
      <div className="grid gap-2">
        <Label>Headline lines</Label>
        {[0, 1, 2].map((i) => (
          <Input
            key={i}
            value={headlineLines[i] ?? ""}
            onChange={(e) => {
              const next = [...headlineLines];
              while (next.length < 3) next.push("");
              next[i] = e.target.value;
              set({ headlineLines: next });
            }}
            placeholder={`Line ${i + 1}`}
          />
        ))}
      </div>
      <div className="grid gap-2">
        <Label>Supporting text</Label>
        <textarea
          className={TEXTAREA_CLASS}
          value={asStr(content.lede)}
          onChange={(e) => set({ lede: e.target.value })}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2 rounded-xl border p-3">
          <p className="text-sm font-medium">Primary CTA</p>
          <Input
            value={asStr(primaryCta.label)}
            onChange={(e) =>
              set({ primaryCta: { ...primaryCta, label: e.target.value } })
            }
            placeholder="Label"
          />
          <Input
            value={asStr(primaryCta.href)}
            onChange={(e) =>
              set({ primaryCta: { ...primaryCta, href: e.target.value } })
            }
            placeholder="/#pricing"
          />
        </div>
        <div className="grid gap-2 rounded-xl border p-3">
          <p className="text-sm font-medium">Secondary CTA</p>
          <Input
            value={asStr(secondaryCta.label)}
            onChange={(e) =>
              set({
                secondaryCta: { ...secondaryCta, label: e.target.value },
              })
            }
            placeholder="Label"
          />
          <Input
            value={asStr(secondaryCta.href)}
            onChange={(e) =>
              set({
                secondaryCta: { ...secondaryCta, href: e.target.value },
              })
            }
            placeholder="/#recent-projects-heading"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Channels (comma-separated)</Label>
        <Input
          value={channels.join(", ")}
          onChange={(e) =>
            set({
              channels: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="Amazon, Shopify, Google Ads"
        />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <Label>Side cards</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              set({
                sides: [
                  ...sides,
                  { slot: sides.length, name: "New service", note: "" },
                ],
              })
            }
          >
            <PlusIcon />
            Add card
          </Button>
        </div>
        {sides.map((side, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[80px_1fr_1fr_auto]"
          >
            <Input
              type="number"
              value={asNum(side.slot, index)}
              onChange={(e) => {
                const next = [...sides];
                next[index] = { ...side, slot: Number(e.target.value) };
                set({ sides: next });
              }}
              placeholder="Slot"
            />
            <Input
              value={asStr(side.name)}
              onChange={(e) => {
                const next = [...sides];
                next[index] = { ...side, name: e.target.value };
                set({ sides: next });
              }}
              placeholder="Name"
            />
            <Input
              value={asStr(side.note)}
              onChange={(e) => {
                const next = [...sides];
                next[index] = { ...side, note: e.target.value };
                set({ sides: next });
              }}
              placeholder="Note"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                set({ sides: sides.filter((_, i) => i !== index) })
              }
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>
      <div className="grid gap-3">
        <Label>Hero stats</Label>
        {stats.map((stat, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-xl border p-3 sm:grid-cols-4"
          >
            <Input
              type="number"
              value={asNum(stat.value)}
              onChange={(e) => {
                const next = [...stats];
                next[index] = { ...stat, value: Number(e.target.value) };
                set({ stats: next });
              }}
              placeholder="Value"
            />
            <Input
              value={asStr(stat.prefix)}
              onChange={(e) => {
                const next = [...stats];
                next[index] = { ...stat, prefix: e.target.value };
                set({ stats: next });
              }}
              placeholder="Prefix ($)"
            />
            <Input
              value={asStr(stat.suffix)}
              onChange={(e) => {
                const next = [...stats];
                next[index] = { ...stat, suffix: e.target.value };
                set({ stats: next });
              }}
              placeholder="Suffix (+)"
            />
            <Input
              value={asStr(stat.label)}
              onChange={(e) => {
                const next = [...stats];
                next[index] = { ...stat, label: e.target.value };
                set({ stats: next });
              }}
              placeholder="Label"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function asObjSafe(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}
