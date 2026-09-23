import type { ReactNode } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const FIELD_TEXTAREA =
  "min-h-[72px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor} className="text-xs">
      {children}
    </Label>
  );
}

export function SectionToolbar({
  countLabel,
  onAdd,
  addLabel = "Add",
  showAdd = true,
}: {
  countLabel: string;
  onAdd?: () => void;
  addLabel?: string;
  showAdd?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">{countLabel}</p>
      {showAdd && onAdd ? (
        <Button type="button" size="sm" onClick={onAdd}>
          <PlusIcon />
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function EditorPanel({
  mode,
  title,
  onClose,
  children,
}: {
  mode: "create" | "edit";
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        mode === "create" && "border-primary/50 bg-primary/5",
        mode === "edit" && "border-amber-500/40 bg-amber-500/5",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{title}</p>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onClose}
          aria-label="Close"
        >
          <XIcon />
        </Button>
      </div>
      {children}
    </div>
  );
}

export function ContentCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card/50 p-4", className)}>
      {title ? (
        <p className="mb-3 text-sm font-semibold">{title}</p>
      ) : null}
      {children}
    </div>
  );
}

export function ItemCard({
  active,
  children,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card/50 p-3 transition-colors",
        active && "border-amber-500/50 bg-amber-500/10",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-12">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button type="button" size="sm" onClick={onAction}>
        <PlusIcon />
        {actionLabel}
      </Button>
    </div>
  );
}

export function FieldGrid({
  children,
  cols = 2,
}: {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        cols === 1 && "grid-cols-1",
        cols === 2 && "sm:grid-cols-2",
        cols === 3 && "sm:grid-cols-3",
        cols === 4 && "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
    </div>
  );
}
