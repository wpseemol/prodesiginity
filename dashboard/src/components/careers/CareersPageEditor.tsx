import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExternalLinkIcon,
  Loader2Icon,
  PlusIcon,
  RotateCcwIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { IconPicker, ServiceIcon } from "@/components/ServiceIcon";
import { readMessage } from "@/components/services/serviceTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_PERKS,
  careersPageUrl,
  type CareerPerk,
  type CareersContentResponse,
  type CareersPageContent,
} from "./careerContentTypes";

function TextField({
  id,
  label,
  value,
  max,
  multiline,
  help,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  max: number;
  multiline?: boolean;
  help?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {multiline ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {value.length}/{max}
          </span>
        ) : null}
      </div>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          maxLength={max}
          aria-invalid={!value.trim()}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-20"
        />
      ) : (
        <Input
          id={id}
          value={value}
          maxLength={max}
          aria-invalid={!value.trim()}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {help ? <p className="text-xs text-muted-foreground">{help}</p> : null}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  );
}

function firstEmptyField(content: CareersPageContent): string | null {
  const checks: [string, string][] = [
    ["Hero badge", content.hero.badge],
    ["Hero title", content.hero.title],
    ["Hero highlighted line", content.hero.highlight],
    ["Hero intro", content.hero.subtitle],
    ["Openings button", content.hero.openingsButton],
    ["Apply button", content.hero.applyButton],
    ["Form badge", content.form.badge],
    ["Form title", content.form.title],
    ["Form intro", content.form.subtitle],
    ["Perks title", content.perks.title],
    ["Perks intro", content.perks.subtitle],
    ["Openings label", content.openings.eyebrow],
    ["Openings title", content.openings.title],
    ["Openings hint", content.openings.hint],
    ["No openings message", content.openings.emptyText],
  ];
  content.perks.items.forEach((perk, i) => {
    checks.push([`Perk ${i + 1} title`, perk.title], [`Perk ${i + 1} description`, perk.description]);
  });
  return checks.find(([, value]) => !value.trim())?.[0] ?? null;
}

export function CareersPageEditor() {
  const [saved, setSaved] = useState<CareersPageContent | null>(null);
  const [draft, setDraft] = useState<CareersPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [iconPickerFor, setIconPickerFor] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch("/admin/careers");
      if (!res.ok) {
        setError(await readMessage(res, "Could not load the careers page."));
        return;
      }
      const { content } = (await res.json()) as CareersContentResponse;
      setSaved(content);
      setDraft(content);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !draft || !saved) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load the careers page</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>{error}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setLoading(true);
              void load();
            }}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const update = <S extends keyof CareersPageContent>(section: S, patch: Partial<CareersPageContent[S]>) =>
    setDraft((prev) => (prev ? { ...prev, [section]: { ...prev[section], ...patch } } : prev));

  const setPerks = (items: CareerPerk[]) => update("perks", { items });
  const perks = draft.perks.items;

  const updatePerk = (index: number, patch: Partial<CareerPerk>) =>
    setPerks(perks.map((perk, i) => (i === index ? { ...perk, ...patch } : perk)));

  const movePerk = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= perks.length) return;
    const next = [...perks];
    [next[index], next[target]] = [next[target], next[index]];
    setPerks(next);
    setIconPickerFor(null);
  };

  const save = async () => {
    const missing = firstEmptyField(draft);
    if (missing) {
      toast.error(`${missing} can't be empty.`);
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch("/admin/careers/page", {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not save the careers page."));
        return;
      }
      const data = (await res.json()) as { content: CareersPageContent };
      setSaved(data.content);
      setDraft(data.content);
      toast.success("Careers page saved. It's live on the website now.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 pb-20">
      <Section title="Hero" description="The first thing visitors see at the top of the careers page.">
        <TextField
          id="hero-badge"
          label="Badge"
          value={draft.hero.badge}
          max={60}
          onChange={(badge) => update("hero", { badge })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="hero-title"
            label="Title"
            value={draft.hero.title}
            max={120}
            onChange={(title) => update("hero", { title })}
          />
          <TextField
            id="hero-highlight"
            label="Highlighted line"
            value={draft.hero.highlight}
            max={120}
            help="Second line, shown in the brand gradient."
            onChange={(highlight) => update("hero", { highlight })}
          />
        </div>
        <TextField
          id="hero-subtitle"
          label="Intro"
          value={draft.hero.subtitle}
          max={400}
          multiline
          onChange={(subtitle) => update("hero", { subtitle })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="hero-openings-button"
            label="Openings button"
            value={draft.hero.openingsButton}
            max={40}
            help="The number of visible openings is added automatically."
            onChange={(openingsButton) => update("hero", { openingsButton })}
          />
          <TextField
            id="hero-apply-button"
            label="Apply button"
            value={draft.hero.applyButton}
            max={40}
            onChange={(applyButton) => update("hero", { applyButton })}
          />
        </div>
      </Section>

      <Section title="Application form" description="Heading above the CV upload form.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="form-badge"
            label="Badge"
            value={draft.form.badge}
            max={60}
            onChange={(badge) => update("form", { badge })}
          />
          <TextField
            id="form-title"
            label="Title"
            value={draft.form.title}
            max={120}
            onChange={(title) => update("form", { title })}
          />
        </div>
        <TextField
          id="form-subtitle"
          label="Intro"
          value={draft.form.subtitle}
          max={400}
          multiline
          onChange={(subtitle) => update("form", { subtitle })}
        />
      </Section>

      <Section
        title="Perks"
        description={`Benefit cards under “${draft.perks.title || "Why you'll love working here"}”. Up to ${MAX_PERKS}; remove them all to hide the section.`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="perks-title"
            label="Section title"
            value={draft.perks.title}
            max={120}
            onChange={(title) => update("perks", { title })}
          />
          <TextField
            id="perks-subtitle"
            label="Section intro"
            value={draft.perks.subtitle}
            max={300}
            onChange={(subtitle) => update("perks", { subtitle })}
          />
        </div>

        <ol className="grid gap-3">
          {perks.map((perk, index) => (
            <li key={index} className="grid gap-3 rounded-xl border bg-muted/10 p-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setIconPickerFor(iconPickerFor === index ? null : index)}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-primary/30 transition hover:ring-2"
                  aria-label={`Change icon for perk ${index + 1}`}
                  aria-expanded={iconPickerFor === index}
                  title="Change icon"
                >
                  <ServiceIcon name={perk.icon} className="size-5" />
                </button>
                <div className="grid min-w-0 flex-1 gap-3">
                  <TextField
                    id={`perk-${index}-title`}
                    label={`Perk ${index + 1} title`}
                    value={perk.title}
                    max={80}
                    onChange={(title) => updatePerk(index, { title })}
                  />
                  <TextField
                    id={`perk-${index}-description`}
                    label="Description"
                    value={perk.description}
                    max={300}
                    multiline
                    onChange={(description) => updatePerk(index, { description })}
                  />
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    aria-label={`Move perk ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => movePerk(index, -1)}
                  >
                    <ArrowUpIcon />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    aria-label={`Move perk ${index + 1} down`}
                    disabled={index === perks.length - 1}
                    onClick={() => movePerk(index, 1)}
                  >
                    <ArrowDownIcon />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive hover:text-destructive"
                    aria-label={`Remove perk ${index + 1}`}
                    onClick={() => {
                      setPerks(perks.filter((_, i) => i !== index));
                      setIconPickerFor(null);
                    }}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
              {iconPickerFor === index ? (
                <IconPicker value={perk.icon} onChange={(icon) => updatePerk(index, { icon })} />
              ) : null}
            </li>
          ))}
        </ol>

        <Button
          variant="outline"
          className="justify-self-start"
          disabled={perks.length >= MAX_PERKS}
          onClick={() => {
            setPerks([...perks, { icon: "Sparkles", title: "", description: "" }]);
            setIconPickerFor(perks.length);
          }}
        >
          <PlusIcon />
          Add perk
        </Button>
      </Section>

      <Section title="Open positions" description="Heading of the job list. Manage the jobs themselves in the Job openings tab.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="openings-eyebrow"
            label="Small label"
            value={draft.openings.eyebrow}
            max={60}
            onChange={(eyebrow) => update("openings", { eyebrow })}
          />
          <TextField
            id="openings-title"
            label="Title"
            value={draft.openings.title}
            max={120}
            onChange={(title) => update("openings", { title })}
          />
        </div>
        <TextField
          id="openings-hint"
          label="Hint"
          value={draft.openings.hint}
          max={160}
          onChange={(hint) => update("openings", { hint })}
        />
        <TextField
          id="openings-empty"
          label="Message when there are no openings"
          value={draft.openings.emptyText}
          max={300}
          multiline
          help="Shown with a “Send a general application” button."
          onChange={(emptyText) => update("openings", { emptyText })}
        />
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur">
        <p className="px-1 text-sm text-muted-foreground">
          {dirty ? "You have unsaved changes." : "All changes saved."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" render={<a href={careersPageUrl} target="_blank" rel="noreferrer" />}>
            <ExternalLinkIcon />
            View page
          </Button>
          <Button
            variant="outline"
            disabled={!dirty || saving}
            onClick={() => {
              setDraft(saved);
              setIconPickerFor(null);
            }}
          >
            <RotateCcwIcon />
            Discard
          </Button>
          <Button disabled={!dirty || saving} onClick={() => void save()}>
            {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
