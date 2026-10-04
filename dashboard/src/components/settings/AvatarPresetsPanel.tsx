import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ImagePlusIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type AvatarPreset = {
  id: number;
  url: string;
  label: string | null;
  sortOrder: number;
  usedBy: number;
};

async function readMessage(res: Response, fallback: string) {
  const data = (await res.json().catch(() => ({}))) as { message?: unknown };
  return typeof data.message === "string" ? data.message : fallback;
}

export function AvatarPresetsPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [presets, setPresets] = useState<AvatarPreset[]>([]);
  const [max, setMax] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [labels, setLabels] = useState<Record<number, string>>({});
  const [pendingDelete, setPendingDelete] = useState<AvatarPreset | null>(null);

  const apply = (rows: AvatarPreset[]) => {
    setPresets(rows);
    setLabels(Object.fromEntries(rows.map((row) => [row.id, row.label ?? ""])));
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/avatar-presets");
      if (!res.ok) throw new Error(await readMessage(res, "Could not load avatars"));
      const data = (await res.json()) as { presets: AvatarPreset[]; max: number };
      apply(data.presets);
      setMax(data.max);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load avatars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await apiFetch("/admin/avatar-presets", { method: "POST", body });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not add the avatar"));
        return;
      }
      toast.success("Avatar added");
      await load();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const saveLabel = async (preset: AvatarPreset) => {
    const label = (labels[preset.id] ?? "").trim();
    if (label === (preset.label ?? "")) return;
    setBusyId(preset.id);
    try {
      const res = await apiFetch(`/admin/avatar-presets/${preset.id}`, {
        method: "PATCH",
        body: JSON.stringify({ label: label || null }),
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not rename the avatar"));
        return;
      }
      setPresets((rows) =>
        rows.map((row) => (row.id === preset.id ? { ...row, label: label || null } : row)),
      );
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, by: number) => {
    const target = index + by;
    if (target < 0 || target >= presets.length) return;
    const previous = presets;
    const next = [...presets];
    [next[index], next[target]] = [next[target], next[index]];
    setPresets(next);
    try {
      const res = await apiFetch("/admin/avatar-presets/order", {
        method: "PUT",
        body: JSON.stringify({ ids: next.map((row) => row.id) }),
      });
      if (!res.ok) {
        setPresets(previous);
        toast.error(await readMessage(res, "Could not save the order"));
      }
    } catch {
      setPresets(previous);
      toast.error("Could not reach the server.");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const preset = pendingDelete;
    setBusyId(preset.id);
    try {
      const res = await apiFetch(`/admin/avatar-presets/${preset.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not delete the avatar"));
        return;
      }
      setPendingDelete(null);
      toast.success("Avatar deleted");
      await load();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading && presets.length === 0 && !error) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load avatars</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => void load()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const full = presets.length >= max;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Profile avatars</p>
          <p className="text-xs text-muted-foreground">
            Staff (on their Profile page) and website clients (on their account page) can pick one of these as
            their profile picture. They're also the avatar choices for public team profiles. Square images work
            best — at least 256×256px, max 2 MB.
          </p>
        </div>
        <Badge variant="secondary" className="font-normal">
          {presets.length} of {max}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {presets.map((preset, index) => (
          <div key={preset.id} className="grid gap-2 rounded-2xl border bg-card p-3">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/40">
              <img
                src={mediaUrl(preset.url)}
                alt={preset.label ?? "Avatar"}
                className="size-full object-cover"
              />
              {busyId === preset.id ? (
                <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2Icon className="size-5 animate-spin text-primary" />
                </span>
              ) : null}
            </div>
            <Input
              value={labels[preset.id] ?? ""}
              onChange={(e) => setLabels((prev) => ({ ...prev, [preset.id]: e.target.value }))}
              onBlur={() => void saveLabel(preset)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              placeholder="Name (optional)"
              maxLength={80}
              className="h-8 text-xs"
            />
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] text-muted-foreground">
                {preset.usedBy === 0 ? "Not used" : `Used by ${preset.usedBy}`}
              </span>
              <div className="flex gap-0.5">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Move left"
                  disabled={index === 0}
                  onClick={() => void move(index, -1)}
                >
                  <ArrowLeftIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Move right"
                  disabled={index === presets.length - 1}
                  onClick={() => void move(index, 1)}
                >
                  <ArrowRightIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Delete avatar"
                  className="text-destructive hover:text-destructive"
                  disabled={busyId === preset.id}
                  onClick={() => setPendingDelete(preset)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {!full ? (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:opacity-60"
          >
            {uploading ? (
              <Loader2Icon className="size-6 animate-spin" />
            ) : (
              <ImagePlusIcon className="size-6" />
            )}
            {uploading ? "Uploading…" : "Add avatar"}
          </button>
        ) : null}
      </div>

      {full ? (
        <p className="text-xs text-muted-foreground">
          You have the maximum of {max} avatars. Delete one to add another.
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && busyId === null) setPendingDelete(null);
        }}
        title="Delete this avatar?"
        description={
          pendingDelete && pendingDelete.usedBy > 0
            ? `${pendingDelete.usedBy} ${pendingDelete.usedBy === 1 ? "person uses" : "people use"} it. They'll go back to their own photo, Google picture or initials.`
            : "It will no longer be available to choose."
        }
        confirmLabel="Delete avatar"
        destructive
        loading={pendingDelete !== null && busyId === pendingDelete.id}
        onConfirm={remove}
      />
    </div>
  );
}
