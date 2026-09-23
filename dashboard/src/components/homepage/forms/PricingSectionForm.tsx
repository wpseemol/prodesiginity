import { asArr, asBool, asStr } from "@/components/homepage/helpers";
import {
  ContentCard,
  FIELD_TEXTAREA,
  Field,
  FieldGrid,
  ItemCard,
  SectionToolbar,
} from "@/components/homepage/FormUi";
import type { SectionFormProps } from "@/components/homepage/types";
import { Input } from "@/components/ui/input";

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

      <ContentCard title="Footer CTA">
        <FieldGrid cols={3}>
          <Field label="Prompt">
            <Input
              className="h-9"
              value={asStr(content.footerPrompt)}
              onChange={(e) => set({ footerPrompt: e.target.value })}
            />
          </Field>
          <Field label="Button label">
            <Input
              className="h-9"
              value={asStr(content.footerCtaLabel)}
              onChange={(e) => set({ footerCtaLabel: e.target.value })}
            />
          </Field>
          <Field label="Button link">
            <Input
              className="h-9"
              value={asStr(content.footerCtaHref)}
              onChange={(e) => set({ footerCtaHref: e.target.value })}
            />
          </Field>
        </FieldGrid>
      </ContentCard>

      <div className="grid gap-3">
        <SectionToolbar
          countLabel={`${plans.length} plan${plans.length === 1 ? "" : "s"}`}
          showAdd={false}
        />

        <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, index) => (
            <ItemCard key={plan.id ?? index}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">
                  {asStr(plan.name) || `Plan ${index + 1}`}
                </p>
                {asBool(plan.isPopular) ? (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Popular
                  </span>
                ) : null}
              </div>
              <FieldGrid cols={2}>
                <Field label="Name">
                  <Input
                    className="h-9"
                    value={asStr(plan.name)}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, name: e.target.value };
                      set({ plans: next });
                    }}
                  />
                </Field>
                <Field label="Price">
                  <Input
                    className="h-9"
                    value={asStr(plan.price)}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, price: e.target.value };
                      set({ plans: next });
                    }}
                  />
                </Field>
                <Field label="Period">
                  <Input
                    className="h-9"
                    value={asStr(plan.period)}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, period: e.target.value };
                      set({ plans: next });
                    }}
                    placeholder="/mo"
                  />
                </Field>
                <Field label="CTA label">
                  <Input
                    className="h-9"
                    value={asStr(plan.ctaText)}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, ctaText: e.target.value };
                      set({ plans: next });
                    }}
                  />
                </Field>
              </FieldGrid>
              <div className="mt-3 grid gap-3">
                <Field label="Description">
                  <textarea
                    className={FIELD_TEXTAREA}
                    value={asStr(plan.description)}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, description: e.target.value };
                      set({ plans: next });
                    }}
                  />
                </Field>
                <Field label="Features (one per line)">
                  <textarea
                    className={FIELD_TEXTAREA}
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
                </Field>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={asBool(plan.isPopular)}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, isPopular: e.target.checked };
                      set({ plans: next });
                    }}
                    className="size-3.5 rounded border"
                  />
                  Mark as popular
                </label>
              </div>
            </ItemCard>
          ))}
        </div>
      </div>
    </div>
  );
}
