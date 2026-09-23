import { Trash2Icon } from "lucide-react";
import { asArr, asNum, asStr } from "@/components/homepage/helpers";
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

function asObjSafe(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

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
    <div className="grid gap-4">
      <ContentCard title="Copy">
        <div className="grid gap-3">
          <Field label="Pill / rating">
            <Input
              className="h-9"
              value={asStr(content.pillHtml)}
              onChange={(e) => set({ pillHtml: e.target.value })}
              placeholder='Rated <b>4.8</b> by 300+ store owners'
            />
          </Field>
          <Field label="Headline lines">
            <div className="grid gap-2">
              {[0, 1, 2].map((i) => (
                <Input
                  key={i}
                  className="h-9"
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
          </Field>
          <Field label="Supporting text">
            <textarea
              className={FIELD_TEXTAREA}
              value={asStr(content.lede)}
              onChange={(e) => set({ lede: e.target.value })}
            />
          </Field>
        </div>
      </ContentCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <ContentCard title="Primary CTA">
          <div className="grid gap-3">
            <Field label="Label">
              <Input
                className="h-9"
                value={asStr(primaryCta.label)}
                onChange={(e) =>
                  set({ primaryCta: { ...primaryCta, label: e.target.value } })
                }
              />
            </Field>
            <Field label="Link">
              <Input
                className="h-9"
                value={asStr(primaryCta.href)}
                onChange={(e) =>
                  set({ primaryCta: { ...primaryCta, href: e.target.value } })
                }
                placeholder="/#pricing"
              />
            </Field>
          </div>
        </ContentCard>
        <ContentCard title="Secondary CTA">
          <div className="grid gap-3">
            <Field label="Label">
              <Input
                className="h-9"
                value={asStr(secondaryCta.label)}
                onChange={(e) =>
                  set({
                    secondaryCta: { ...secondaryCta, label: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Link">
              <Input
                className="h-9"
                value={asStr(secondaryCta.href)}
                onChange={(e) =>
                  set({
                    secondaryCta: { ...secondaryCta, href: e.target.value },
                  })
                }
                placeholder="/#recent-projects-heading"
              />
            </Field>
          </div>
        </ContentCard>
      </div>

      <ContentCard title="Channels">
        <Field label="Comma-separated">
          <Input
            className="h-9"
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
        </Field>
      </ContentCard>

      <div className="grid gap-3">
        <SectionToolbar
          countLabel={`${sides.length} side card${sides.length === 1 ? "" : "s"}`}
          addLabel="Add card"
          onAdd={() =>
            set({
              sides: [
                ...sides,
                { slot: sides.length, name: "New service", note: "" },
              ],
            })
          }
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {sides.map((side, index) => (
            <ItemCard key={index}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Card {index + 1}
                </p>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    set({ sides: sides.filter((_, i) => i !== index) })
                  }
                  aria-label="Delete card"
                >
                  <Trash2Icon />
                </Button>
              </div>
              <FieldGrid cols={3}>
                <Field label="Slot">
                  <Input
                    className="h-9"
                    type="number"
                    value={asNum(side.slot, index)}
                    onChange={(e) => {
                      const next = [...sides];
                      next[index] = { ...side, slot: Number(e.target.value) };
                      set({ sides: next });
                    }}
                  />
                </Field>
                <Field label="Name">
                  <Input
                    className="h-9"
                    value={asStr(side.name)}
                    onChange={(e) => {
                      const next = [...sides];
                      next[index] = { ...side, name: e.target.value };
                      set({ sides: next });
                    }}
                  />
                </Field>
                <Field label="Note">
                  <Input
                    className="h-9"
                    value={asStr(side.note)}
                    onChange={(e) => {
                      const next = [...sides];
                      next[index] = { ...side, note: e.target.value };
                      set({ sides: next });
                    }}
                  />
                </Field>
              </FieldGrid>
            </ItemCard>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <SectionToolbar
          countLabel={`${stats.length} hero stat${stats.length === 1 ? "" : "s"}`}
          addLabel="Add stat"
          onAdd={() =>
            set({
              stats: [
                ...stats,
                { value: 0, prefix: "", suffix: "+", label: "New metric" },
              ],
            })
          }
        />
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat, index) => (
            <ItemCard key={index}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">
                  {asStr(stat.label) || `Stat ${index + 1}`}
                </p>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    set({ stats: stats.filter((_, i) => i !== index) })
                  }
                  aria-label="Delete stat"
                >
                  <Trash2Icon />
                </Button>
              </div>
              <FieldGrid cols={2}>
                <Field label="Value">
                  <Input
                    className="h-9"
                    type="number"
                    value={asNum(stat.value)}
                    onChange={(e) => {
                      const next = [...stats];
                      next[index] = {
                        ...stat,
                        value: Number(e.target.value),
                      };
                      set({ stats: next });
                    }}
                  />
                </Field>
                <Field label="Prefix">
                  <Input
                    className="h-9"
                    value={asStr(stat.prefix)}
                    onChange={(e) => {
                      const next = [...stats];
                      next[index] = { ...stat, prefix: e.target.value };
                      set({ stats: next });
                    }}
                    placeholder="$"
                  />
                </Field>
                <Field label="Suffix">
                  <Input
                    className="h-9"
                    value={asStr(stat.suffix)}
                    onChange={(e) => {
                      const next = [...stats];
                      next[index] = { ...stat, suffix: e.target.value };
                      set({ stats: next });
                    }}
                    placeholder="+"
                  />
                </Field>
                <Field label="Label">
                  <Input
                    className="h-9"
                    value={asStr(stat.label)}
                    onChange={(e) => {
                      const next = [...stats];
                      next[index] = { ...stat, label: e.target.value };
                      set({ stats: next });
                    }}
                  />
                </Field>
              </FieldGrid>
            </ItemCard>
          ))}
        </div>
      </div>
    </div>
  );
}
