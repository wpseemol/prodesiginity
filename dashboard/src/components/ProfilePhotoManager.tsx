import { useEffect, useRef, useState, type FormEvent } from "react";
import { CameraIcon, CheckIcon, Loader2Icon, Trash2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { IMAGE_SPECS } from "@/lib/imageSpecs";
import {
  updateDashboardUser,
  type DashboardPhoto,
  type DashboardUser,
} from "@/lib/session";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProfilePhotoManagerProps = {
  user: DashboardUser;
  onUserUpdated: (user: DashboardUser) => void;
};

type AvatarPreset = { id: number; url: string; label: string | null };

function fallbackHint(user: DashboardUser) {
  if (user.avatarPreset) return "You're using one of the provided avatars.";
  if (user.teamMember?.photoUrl) return "Without a profile photo, your team photo is shown.";
  if (user.teamMember?.avatarUrl) return "Without a profile photo, your team avatar is shown.";
  return "Without a profile photo, your initials are shown.";
}

export function ProfilePhotoManager({
  user,
  onUserUpdated,
}: ProfilePhotoManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<DashboardPhoto[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DashboardPhoto | null>(null);
  const [presets, setPresets] = useState<AvatarPreset[]>([]);
  const [busyPresetId, setBusyPresetId] = useState<number | "none" | null>(null);

  const activePhotoId = user.photo?.id ?? null;
  const activePresetId = user.avatarPreset?.id ?? null;

  const applyUser = async (nextUser: DashboardUser) => {
    await updateDashboardUser(nextUser);
    onUserUpdated(nextUser);
  };

  const readError = (data: { message?: unknown }, fallback: string) =>
    typeof data.message === "string" ? data.message : fallback;

  const loadPhotos = async () => {
    setLoadingList(true);
    try {
      const res = await apiFetch("/auth/me/photos");
      const data = await res.json();
      if (!res.ok) {
        toast.error(readError(data, "Could not load photos."));
        return;
      }
      setPhotos((data.photos as DashboardPhoto[]) ?? []);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per user
  }, [user.id]);

  useEffect(() => {
    apiFetch("/auth/avatar-presets")
      .then((res) => (res.ok ? res.json() : { presets: [] }))
      .then((data: { presets?: AvatarPreset[] }) => setPresets(data.presets ?? []))
      .catch(() => setPresets([]));
  }, []);

  const handleChoosePreset = async (presetId: number | null) => {
    if (presetId !== null && presetId === activePresetId) return;
    setBusyPresetId(presetId ?? "none");
    try {
      const res = await apiFetch("/auth/me/avatar", {
        method: "PUT",
        body: JSON.stringify({ presetId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(readError(data, "Could not change your avatar."));
        return;
      }
      await applyUser(data.user as DashboardUser);
      toast.success(presetId === null ? "Avatar removed." : "Avatar updated.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setBusyPresetId(null);
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      toast.message("Choose an image first.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("photo", file);
      body.append("altText", `${user.fullName} profile photo`);
      const res = await apiFetch("/auth/me/photo", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        toast.error(readError(data, "Could not upload photo."));
        return;
      }
      await applyUser(data.user as DashboardUser);
      if (inputRef.current) inputRef.current.value = "";
      toast.success("Profile photo updated.");
      await loadPhotos();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (photoId: number) => {
    if (photoId === activePhotoId) return;
    setBusyId(photoId);
    try {
      const res = await apiFetch(`/auth/me/photos/${photoId}/activate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(readError(data, "Could not set active photo."));
        return;
      }
      await applyUser(data.user as DashboardUser);
      toast.success("Active photo changed.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveActive = async () => {
    setRemoving(true);
    try {
      const res = await apiFetch("/auth/me/photo", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(readError(data, "Could not remove photo."));
        return;
      }
      await applyUser(data.user as DashboardUser);
      toast.success("Profile photo removed.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setRemoving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const photo = pendingDelete;
    setBusyId(photo.id);
    try {
      const res = await apiFetch(`/auth/me/photos/${photo.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(readError(data, "Could not delete photo."));
        return;
      }
      await applyUser(data.user as DashboardUser);
      setPhotos((rows) => rows.filter((row) => row.id !== photo.id));
      setPendingDelete(null);
      toast.success("Image deleted.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile photo</CardTitle>
        <CardDescription>
          Shown in the dashboard. {fallbackHint(user)}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <UserAvatar account={user} className="size-24" fallbackClassName="text-lg" />

          <form className="grid w-full flex-1 gap-3" onSubmit={handleUpload}>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/15"
            />
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, or GIF · max 5 MB · {IMAGE_SPECS.profilePhoto.width}×{IMAGE_SPECS.profilePhoto.height}px
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <CameraIcon />
                    {user.photo ? "Change photo" : "Upload photo"}
                  </>
                )}
              </Button>
              {user.photo ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={removing}
                  onClick={() => void handleRemoveActive()}
                >
                  {removing ? <Loader2Icon className="animate-spin" /> : <XIcon />}
                  Remove photo
                </Button>
              ) : null}
            </div>
          </form>
        </div>

        {presets.length > 0 ? (
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Or choose an avatar</p>
              {user.avatarPreset ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busyPresetId !== null}
                  onClick={() => void handleChoosePreset(null)}
                >
                  {busyPresetId === "none" ? <Loader2Icon className="animate-spin" /> : <XIcon />}
                  Stop using avatar
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              {presets.map((preset) => {
                const selected = preset.id === activePresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={busyPresetId !== null}
                    onClick={() => void handleChoosePreset(preset.id)}
                    title={preset.label ?? "Use this avatar"}
                    aria-pressed={selected}
                    className={cn(
                      "relative size-16 overflow-hidden rounded-full border bg-muted/40 transition hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                  >
                    <img
                      src={mediaUrl(preset.url)}
                      alt={preset.label ?? "Avatar"}
                      className="size-full object-cover"
                    />
                    {busyPresetId === preset.id ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Loader2Icon className="size-4 animate-spin text-primary" />
                      </span>
                    ) : selected ? (
                      <span className="absolute bottom-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon className="size-3" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="grid gap-2">
          <p className="text-sm font-medium">Your images</p>
          {loadingList ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Loading…
            </div>
          ) : photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No uploaded images yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {photos.map((photo) => {
                const src = mediaUrl(photo.url);
                const isActive = photo.id === activePhotoId;
                return (
                  <div key={photo.id} className="group relative">
                    <button
                      type="button"
                      disabled={busyId === photo.id}
                      onClick={() => void handleActivate(photo.id)}
                      className={cn(
                        "relative block aspect-square w-full overflow-hidden rounded-xl border bg-muted/40 transition hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isActive && "ring-2 ring-primary",
                      )}
                      title={isActive ? "Active photo" : "Set as active"}
                    >
                      {src ? (
                        <img
                          src={src}
                          alt={photo.altText ?? "Uploaded"}
                          className="size-full object-cover"
                        />
                      ) : null}
                      {isActive ? (
                        <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <CheckIcon className="size-3" />
                        </span>
                      ) : null}
                      {busyId === photo.id ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                          <Loader2Icon className="size-5 animate-spin text-primary" />
                        </span>
                      ) : null}
                    </button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="destructive"
                      className="absolute bottom-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      aria-label="Delete image"
                      title="Delete image"
                      disabled={busyId === photo.id}
                      onClick={() => setPendingDelete(photo)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this image?"
        description={
          pendingDelete?.id === activePhotoId
            ? "This is your current profile photo. After deleting it, your team photo, avatar or initials are shown instead."
            : "The image is removed from your uploads permanently."
        }
        confirmLabel="Delete image"
        loading={pendingDelete !== null && busyId === pendingDelete.id}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
