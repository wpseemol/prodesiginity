import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2Icon,
  SaveIcon,
  RotateCcwIcon,
  LayoutTemplateIcon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "stats",
  "brands",
  "process",
  "recentProjects",
  "pricing",
  "team",
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

type SectionPayload = {
  label: string;
  content: unknown;
  updatedAt: string;
};

const SECTION_HINTS: Record<HomepageSectionKey, string> = {
  hero: "Headline, CTAs, side cards, channel chips, hero stats",
  stats: "Numbers / feature tiles under the hero",
  brands: "Brand logos marquee",
  process: "How we work steps",
  recentProjects: "Recent projects carousel copy + items",
  pricing: "Pricing plans and footer CTA",
  team: "Team section members",
};

function HomepageCmsManager() {
  const [sections, setSections] = useState<Record<string, SectionPayload>>(
    {},
  );
  const [activeKey, setActiveKey] = useState<HomepageSectionKey>("hero");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const active = sections[activeKey];
  const activeLabel = active?.label ?? activeKey;

  const dirty = useMemo(() => {
    if (!active) return false;
    try {
      return JSON.stringify(JSON.parse(draft)) !== JSON.stringify(active.content);
    } catch {
      return true;
    }
  }, [draft, active]);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetch("/admin/homepage");
      const data = await res.json();
      if (!res.ok) {
        setLoadError(
          typeof data.message === "string"
            ? data.message
            : "Could not load homepage sections.",
        );
        return;
      }
      const next = (data.sections ?? {}) as Record<string, SectionPayload>;
      setSections(next);
      const content = next[activeKey]?.content ?? {};
      setDraft(JSON.stringify(content, null, 2));
    } catch {
      setLoadError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, []);

  useEffect(() => {
    const content = sections[activeKey]?.content;
    if (content !== undefined) {
      setDraft(JSON.stringify(content, null, 2));
    }
  }, [activeKey, sections]);

  const resetDraft = () => {
    if (active) setDraft(JSON.stringify(active.content, null, 2));
  };

  const save = async () => {
    setSaving(true);
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(draft);
      } catch {
        toast.error("JSON is invalid — fix syntax before saving.");
        return;
      }
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        toast.error("Root value must be a JSON object.");
        return;
      }

      const res = await apiFetch(`/admin/homepage/${activeKey}`, {
        method: "PUT",
        body: JSON.stringify({ content: parsed }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(
          typeof body.message === "string" ? body.message : "Save failed.",
        );
        return;
      }

      setSections((prev) => ({
        ...prev,
        [activeKey]: {
          label: body.label ?? prev[activeKey]?.label ?? activeKey,
          content: body.content,
          updatedAt: body.updatedAt,
        },
      }));
      setDraft(JSON.stringify(body.content, null, 2));
      toast.success(`Saved “${activeLabel}”. Live site refreshes within ~60s.`);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2Icon className="size-5 animate-spin" />
        Loading homepage sections…
      </div>
    );
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load homepage CMS</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>{loadError}</span>
          <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="border-border/70 bg-card/90">
        <CardHeader className="gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplateIcon className="size-5 text-primary" />
              Homepage content
            </CardTitle>
            <CardDescription>
              Customize marketing site sections. Edits replace the JSON for that
              block; the public homepage reads them from the API.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetDraft}
              disabled={!dirty || saving}
            >
              <RotateCcwIcon />
              Reset
            </Button>
            <Button type="button" onClick={() => void save()} disabled={saving || !dirty}>
              {saving ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <SaveIcon />
                  Save section
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            {HOMEPAGE_SECTION_KEYS.map((key) => {
              const label = sections[key]?.label ?? key;
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveKey(key)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">
                {activeLabel}{" "}
                <span className="font-normal text-muted-foreground">
                  ({activeKey})
                </span>
              </Label>
              <p className="text-xs text-muted-foreground">
                {SECTION_HINTS[activeKey]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {dirty ? <Badge variant="secondary">Unsaved</Badge> : null}
              {active?.updatedAt ? (
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(active.updatedAt).toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
            className="min-h-[420px] w-full resize-y rounded-xl border border-border bg-muted/30 p-4 font-mono text-sm leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${activeLabel} JSON editor`}
          />

          <p className="text-xs text-muted-foreground">
            Tip: keep the same field names the site already expects (e.g.{" "}
            <code className="rounded bg-muted px-1">headlineLines</code>,{" "}
            <code className="rounded bg-muted px-1">plans</code>,{" "}
            <code className="rounded bg-muted px-1">members</code>). Invalid JSON
            will not save.
          </p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Preview the live site after saving.{" "}
        <Link
          to="/admin"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to overview
        </Link>
      </p>
    </div>
  );
}

export default function AdminHomepagePage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="Homepage"
      description="Customize frontend homepage sections"
    >
      {() => <HomepageCmsManager />}
    </DashboardLayout>
  );
}
