import { asArr, asBool, asStr } from "@/components/homepage/helpers";
import type { SectionFormProps } from "@/components/homepage/types";
import { TEXTAREA_CLASS } from "@/components/homepage/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PricingSectionForm({ content, onChange }: SectionFormProps) {
  const plans = asArr<{
    id?: string;
    name?: string;
    price?: string;
    period?: string;
    description?: string;
    isPopular?: boolean;
    popularBadgeText?: string;
    features?: string[];
    ctaText?: string;
    ctaHref?: string;
  }>(content.plans);
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
      <div className="grid gap-2 sm:grid-cols-3">
        <Input
          value={asStr(content.footerPrompt)}
          onChange={(e) => set({ footerPrompt: e.target.value })}
          placeholder="Footer prompt"
        />
        <Input
          value={asStr(content.footerCtaLabel)}
          onChange={(e) => set({ footerCtaLabel: e.target.value })}
          placeholder="Footer CTA label"
        />
        <Input
          value={asStr(content.footerCtaHref)}
          onChange={(e) => set({ footerCtaHref: e.target.value })}
          placeholder="Footer CTA href"
        />
      </div>
      <Label>Plans</Label>
      {plans.map((plan, index) => (
        <div key={plan.id ?? index} className="grid gap-2 rounded-xl border p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <Input
              value={asStr(plan.name)}
              onChange={(e) => {
                const next = [...plans];
                next[index] = { ...plan, name: e.target.value };
                set({ plans: next });
              }}
              placeholder="Plan name"
            />
            <Input
              value={asStr(plan.price)}
              onChange={(e) => {
                const next = [...plans];
                next[index] = { ...plan, price: e.target.value };
                set({ plans: next });
              }}
              placeholder="Price"
            />
            <Input
              value={asStr(plan.period)}
              onChange={(e) => {
                const next = [...plans];
                next[index] = { ...plan, period: e.target.value };
                set({ plans: next });
              }}
              placeholder="/mo"
            />
          </div>
          <textarea
            className={TEXTAREA_CLASS}
            value={asStr(plan.description)}
            onChange={(e) => {
              const next = [...plans];
              next[index] = { ...plan, description: e.target.value };
              set({ plans: next });
            }}
            placeholder="Description"
          />
          <div className="grid gap-2">
            <Label>Features (one per line)</Label>
            <textarea
              className={TEXTAREA_CLASS}
              value={(plan.features ?? []).join("\n")}
              onChange={(e) => {
                const next = [...plans];
                next[index] = {
                  ...plan,
                  features: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                };
                set({ plans: next });
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={asBool(plan.isPopular)}
              onChange={(e) => {
                const next = [...plans];
                next[index] = { ...plan, isPopular: e.target.checked };
                set({ plans: next });
              }}
              className="size-4 rounded border"
            />
            Mark as popular
          </label>
        </div>
      ))}
    </div>
  );
}
