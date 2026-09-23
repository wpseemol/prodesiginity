import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Loader2Icon,
  SaveIcon,
  RotateCcwIcon,
  LayoutTemplateIcon,
} from "lucide-react";
import { toast } from "sonner";
import { SectionEditor } from "@/components/homepage/SectionEditor";
import {
  HOMEPAGE_SECTION_KEYS,
  SECTION_HINTS,
  type HomepageSectionKey,
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
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchHomepageSections,
  resetDraft,
  saveHomepageSection,
  selectHomepageDirty,
  setActiveKey,
  setDraft,
} from "@/lib/store/homepageSlice";
import { cn } from "@/lib/utils";

function HomepageCmsManager() {
  const dispatch = useAppDispatch();
  const {
    sections,
    activeKey,
    draft,
    loading,
    saving,
    loadError,
  } = useAppSelector((s) => s.homepage);
  const dirty = useAppSelector(selectHomepageDirty);

  const active = sections[activeKey];
  const activeLabel = active?.label ?? activeKey;

  useEffect(() => {
    void dispatch(fetchHomepageSections());
  }, [dispatch]);

  const handleSave = async () => {
    const result = await dispatch(saveHomepageSection());
    if (saveHomepageSection.fulfilled.match(result)) {
      toast.success(`Saved “${activeLabel}”. Live site refreshes within ~60s.`);
      return;
    }
    const message =
      typeof result.payload === "string"
        ? result.payload
        : "Could not reach the server.";
    toast.error(message);
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
            onClick={() => void dispatch(fetchHomepageSections())}
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
              onClick={() => dispatch(resetDraft())}
              disabled={!dirty || saving}
            >
              <RotateCcwIcon />
              Reset
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
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
                  onClick={() =>
                    dispatch(setActiveKey(key as HomepageSectionKey))
                  }
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
            onChange={(next) => dispatch(setDraft(next))}
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
