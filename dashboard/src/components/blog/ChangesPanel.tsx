import { useMemo } from "react";
import { useWatch, type Control } from "react-hook-form";
import { ArrowRightIcon, CheckIcon, PencilLineIcon, Undo2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SECTION_FIELDS,
  changedKeys,
  diffPost,
  type Change,
  type ChangeContext,
  type FieldKey,
} from "./blogChanges";
import type { BlogPostFormValues } from "./blogTypes";

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Before → after rows. `onUndo` adds a per-row undo button. */
export function ChangeList({
  changes,
  onUndo,
  jump = true,
}: {
  changes: Change[];
  onUndo?: (key: FieldKey) => void;
  jump?: boolean;
}) {
  return (
    <ul className="grid gap-1.5">
      {changes.map((change) => (
        <li key={change.key} className="group/change rounded-lg border bg-background px-2.5 py-2">
          <div className="flex items-center gap-2">
            {jump ? (
              <button
                type="button"
                onClick={() => goTo(change.section)}
                className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:text-primary"
                title="Go to this field"
              >
                {change.label}
              </button>
            ) : (
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{change.label}</span>
            )}
            {onUndo ? (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => onUndo(change.key)}
                aria-label={`Undo change to ${change.label}`}
              >
                <Undo2Icon />
                Undo
              </Button>
            ) : null}
          </div>
          {change.summary ? (
            <p className="text-xs text-muted-foreground">{change.summary}</p>
          ) : (
            <div className="mt-1 grid gap-1 text-xs">
              <span className="line-clamp-2 break-words rounded bg-red-500/10 px-1.5 py-0.5 text-red-700 line-through decoration-red-500/50 dark:text-red-300">
                {change.before}
              </span>
              <span className="flex items-start gap-1">
                <ArrowRightIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                <span className="line-clamp-2 min-w-0 break-words rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-300">
                  {change.after}
                </span>
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Live list of what differs from the saved version of the article. */
export function ChangesPanel({
  control,
  baseline,
  context,
  onUndo,
  onUndoAll,
}: {
  control: Control<BlogPostFormValues>;
  baseline: BlogPostFormValues;
  context: ChangeContext;
  onUndo: (key: FieldKey) => void;
  onUndoAll: () => void;
}) {
  const values = useWatch({ control }) as BlogPostFormValues;
  const changes = useMemo(() => diffPost(baseline, values, context), [baseline, values, context]);

  return (
    <Card
      id={CHANGES_PANEL_ID}
      className={cn("scroll-mt-32", changes.length > 0 && "border-amber-500/40 ring-1 ring-amber-500/20")}
    >
      <CardHeader className="gap-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <PencilLineIcon className="size-4" />
            Your changes
          </CardTitle>
          {changes.length > 0 ? (
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            >
              {changes.length} unsaved
            </Badge>
          ) : null}
        </div>
        <CardDescription>
          {changes.length > 0
            ? "Compared with the last saved version. Click a name to jump to it."
            : "Anything you edit shows up here until you save."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {changes.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckIcon className="size-4 text-emerald-500" />
            Matches the saved version.
          </p>
        ) : (
          <>
            <ChangeList changes={changes} onUndo={onUndo} />
            <Button type="button" size="sm" variant="outline" onClick={onUndoAll}>
              <Undo2Icon />
              Undo all changes
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export const CHANGES_PANEL_ID = "post-changes-panel";

/** "3 unsaved changes" link for the sticky header; jumps to the panel. */
export function UnsavedCount({
  control,
  baseline,
  context,
}: {
  control: Control<BlogPostFormValues>;
  baseline: BlogPostFormValues;
  context: ChangeContext;
}) {
  const values = useWatch({ control }) as BlogPostFormValues;
  const count = useMemo(() => diffPost(baseline, values, context).length, [baseline, values, context]);
  if (count === 0) return <>No unsaved changes</>;
  return (
    <button
      type="button"
      onClick={() => goTo(CHANGES_PANEL_ID)}
      className="font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-400"
    >
      {count} unsaved change{count === 1 ? "" : "s"} — review
    </button>
  );
}

/** Small "Edited" tag for a section heading while it has unsaved changes. */
export function SectionEdited({
  control,
  baseline,
  section,
}: {
  control: Control<BlogPostFormValues>;
  baseline: BlogPostFormValues | null;
  section: string;
}) {
  const keys = SECTION_FIELDS[section] ?? [];
  const watched = useWatch({ control, name: keys });
  if (!baseline) return null;
  const current = Object.fromEntries(keys.map((key, i) => [key, watched[i]])) as Partial<BlogPostFormValues>;
  if (changedKeys(baseline, current, keys).length === 0) return null;
  return (
    <Badge
      variant="outline"
      className="ml-2 border-amber-500/40 bg-amber-500/10 align-middle text-[10px] text-amber-700 dark:text-amber-300"
    >
      Edited
    </Badge>
  );
}
