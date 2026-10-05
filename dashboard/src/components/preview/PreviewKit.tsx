import type { MouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import {
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleCheckIcon,
  EyeIcon,
  ListChecksIcon,
  Maximize2Icon,
  MousePointerClickIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The minimum an editor's "things to do" item needs for the preview UI. */
export type PreviewIssue = {
  number: number;
  label: string;
  hint: string;
  required: boolean;
  spot: string;
};

export function Marker({ issue }: { issue: PreviewIssue }) {
  return (
    <span
      title={`${issue.label} — ${issue.hint}`}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ring-2 ring-card",
        issue.required ? "bg-red-500" : "bg-amber-500",
      )}
    >
      {issue.number}
    </span>
  );
}

/**
 * A clickable region of the preview: click (or Enter) calls `onEdit(spot)`.
 * Issues pinned to this spot show as numbered markers and an outline.
 */
export function PreviewSpot<S extends string>({
  spot,
  issues,
  onEdit,
  children,
  className,
}: {
  spot: S;
  issues: PreviewIssue[];
  onEdit: (spot: S) => void;
  children: ReactNode;
  className?: string;
}) {
  const pinned = issues.filter((i) => i.spot === spot);
  const required = pinned.some((i) => i.required);
  const edit = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (e && (e.target as HTMLElement).closest("video, summary, a")) return;
    onEdit(spot);
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={edit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          edit();
        }
      }}
      title="Click to edit"
      className={cn(
        "relative -mx-1.5 cursor-pointer rounded-lg px-1.5 py-1 outline-none transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/30 focus-visible:ring-2 focus-visible:ring-primary/50",
        pinned.length > 0 &&
          (required
            ? "bg-red-500/5 ring-1 ring-red-500/40"
            : "outline-1 outline-offset-0 outline-dashed outline-amber-500/60"),
        className,
      )}
    >
      {pinned.length ? (
        <span className="absolute -top-2 -right-1.5 z-10 flex gap-0.5">
          {pinned.map((issue) => (
            <Marker key={issue.number} issue={issue} />
          ))}
        </span>
      ) : null}
      {children}
    </div>
  );
}

export function IssuesList<I extends PreviewIssue>({
  issues,
  open,
  onToggle,
  onJump,
  readyText,
}: {
  issues: I[];
  open: boolean;
  onToggle: () => void;
  onJump: (issue: I) => void;
  readyText: string;
}) {
  const required = issues.filter((i) => i.required).length;
  const suggested = issues.length - required;

  if (issues.length === 0) {
    return (
      <p className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
        <CircleCheckIcon className="size-4 shrink-0" />
        {readyText}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "mb-4 rounded-xl border",
        required ? "border-red-500/30 bg-red-500/[0.03]" : "border-amber-500/30 bg-amber-500/[0.03]",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs"
      >
        <ListChecksIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 font-medium">
          {required ? `${required} to fix` : "Nothing required"}
          {suggested ? <span className="font-normal text-muted-foreground"> · {suggested} suggested</span> : null}
        </span>
        <ChevronDownIcon className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <ol className="grid gap-0.5 border-t px-1.5 py-1.5">
          {issues.map((issue) => (
            <li key={issue.number}>
              <button
                type="button"
                onClick={() => onJump(issue)}
                className="flex w-full items-start gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-muted"
              >
                <Marker issue={issue} />
                <span className="min-w-0">
                  <span className="block text-xs font-medium">
                    {issue.label}
                    {issue.required ? <span className="ml-1 font-normal text-red-600">required</span> : null}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">{issue.hint}</span>
                </span>
              </button>
            </li>
          ))}
          <li className="flex items-center gap-1.5 px-1.5 pt-1 text-[11px] text-muted-foreground">
            <MousePointerClickIcon className="size-3" />
            Click an item, a number or any part of the preview to edit it.
          </li>
        </ol>
      ) : null}
    </div>
  );
}

/** Header (title, counts, expand / hide), tabs and a scrolling body. */
export function LivePreviewPanel<T extends string, I extends PreviewIssue>({
  issues,
  tabs,
  tab,
  onTabChange,
  issuesOpen,
  onToggleIssues,
  onJump,
  readyText,
  onExpand,
  onCollapse,
  className,
  children,
}: {
  issues: I[];
  tabs: { id: T; label: string }[];
  tab: T;
  onTabChange: (tab: T) => void;
  issuesOpen: boolean;
  onToggleIssues: () => void;
  onJump: (issue: I) => void;
  readyText: string;
  onExpand?: () => void;
  onCollapse?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const required = issues.filter((i) => i.required).length;
  const suggested = issues.length - required;

  return (
    <div className={cn("flex min-h-0 flex-col rounded-2xl border bg-card shadow-sm", className)}>
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <EyeIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Live preview</span>
        {required ? (
          <span
            className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white"
            title={`${required} thing${required === 1 ? "" : "s"} to fix`}
          >
            {required}
          </span>
        ) : null}
        {suggested ? (
          <span
            className="rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white"
            title={`${suggested} suggestion${suggested === 1 ? "" : "s"}`}
          >
            {suggested}
          </span>
        ) : null}
        <span className="ml-auto flex items-center gap-0.5">
          {onExpand ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Open a larger preview"
              title="Open a larger preview"
              onClick={onExpand}
            >
              <Maximize2Icon />
            </Button>
          ) : null}
          {onCollapse ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Hide the preview"
              title="Hide the preview"
              onClick={onCollapse}
            >
              <ChevronsRightIcon />
            </Button>
          ) : null}
        </span>
      </div>
      <div className="flex gap-1 border-b bg-muted/30 p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => onTabChange(t.id)}
            className={cn(
              "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-3">
        <IssuesList
          issues={issues}
          open={issuesOpen}
          onToggle={onToggleIssues}
          onJump={onJump}
          readyText={readyText}
        />
        {children}
      </div>
    </div>
  );
}

/**
 * Drag handle for the left edge of a right-hand panel. Reports the live width
 * while dragging (`onDrag`, null when done) and the final one via `onCommit`.
 * Arrow keys nudge it; double-click calls `onReset`.
 */
export function ResizeHandle({
  width,
  min,
  max,
  dragging,
  onDrag,
  onCommit,
  onReset,
}: {
  width: number;
  min: number;
  max: number;
  dragging: boolean;
  onDrag: (width: number | null) => void;
  onCommit: (width: number) => void;
  onReset: () => void;
}) {
  const start = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const limit = Math.min(max, Math.round(window.innerWidth * 0.5));
    const widthAt = (x: number) => Math.round(Math.min(limit, Math.max(min, width + (startX - x))));
    let latest = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: PointerEvent) => {
      latest = widthAt(ev.clientX);
      onDrag(latest);
    };
    const onUp = () => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      onCommit(latest);
      onDrag(null);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the preview"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={width}
      tabIndex={0}
      title="Drag to resize · double-click to reset"
      onPointerDown={start}
      onDoubleClick={onReset}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onCommit(width + 24);
        else if (e.key === "ArrowRight") onCommit(width - 24);
        else return;
        e.preventDefault();
      }}
      className="group/resize absolute inset-y-0 -left-4 z-10 flex w-4 cursor-col-resize touch-none items-center justify-center outline-none"
    >
      <span
        className={cn(
          "h-14 w-1.5 rounded-full bg-border transition-colors group-hover/resize:bg-primary/60 group-focus-visible/resize:bg-primary",
          dragging && "bg-primary",
        )}
      />
    </div>
  );
}

/** What a hidden preview collapses to: a slim rail that opens it again. */
export function CollapsedPreviewRail({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title="Show the live preview"
      className="flex h-full w-full flex-col items-center gap-3 rounded-2xl border bg-card py-3 text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-foreground"
    >
      <ChevronsLeftIcon className="size-4" />
      <EyeIcon className="size-4" />
      <span className="text-xs font-medium [writing-mode:vertical-rl]">Live preview</span>
    </button>
  );
}
