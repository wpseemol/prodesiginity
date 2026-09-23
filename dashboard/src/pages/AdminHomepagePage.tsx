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
import { asObj, cloneContent } from "@/components/homepage/helpers";
import { SectionEditor } from "@/components/homepage/SectionEditor";
import {
  HOMEPAGE_SECTION_KEYS,
  SECTION_HINTS,
  type HomepageSectionKey,
  type SectionPayload,
} from "@/components/homepage/types";
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

function HomepageCmsManager() {
  const [sections, setSections] = useState<Record<string, SectionPayload>>({});
  const [activeKey, setActiveKey] = useState<HomepageSectionKey>("hero");
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const active = sections[activeKey];
  const activeLabel = active?.label ?? activeKey;

  const dirty = useMemo(() => {
    if (!active) return false;
    try {
      return JSON.stringify(draft) !== JSON.stringify(active.content);
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
      const raw = (data.sections ?? {}) as Record<
        string,
        { label: string; content: unknown; updatedAt: string }
      >;
      const next: Record<string, SectionPayload> = {};
      for (const [key, value] of Object.entries(raw)) {
        next[key] = {
          label: value.label,
          content: asObj(value.content),
          updatedAt: value.updatedAt,
        };
      }
      setSections(next);
      setDraft(cloneContent(next[activeKey]?.content));
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
      setDraft(cloneContent(content));
    }
  }, [activeKey, sections]);

  const resetDraft = () => {
    if (active) setDraft(cloneContent(active.content));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`/admin/homepage/${activeKey}`, {
        method: "PUT",
        body: JSON.stringify({ content: draft }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(
          typeof body.message === "string" ? body.message : "Save failed.",
        );
        return;
      }

      const saved = asObj(body.content);
      setSections((prev) => ({
        ...prev,
        [activeKey]: {
          label: body.label ?? prev[activeKey]?.label ?? activeKey,
          content: saved,
          updatedAt: body.updatedAt,
        },
      }));
      setDraft(cloneContent(saved));
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
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void load()}
          >
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
              Each tab has its own editor. Create and edit flows are separate —
              remember to Save section after changes.
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
            <Button
              type="button"
              onClick={() => void save()}
              disabled={saving || !dirty}
            >
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

          <SectionEditor
            sectionKey={activeKey}
            content={draft}
            onChange={setDraft}
          />
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
