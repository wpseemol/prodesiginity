import { Link } from "react-router-dom";
import {
  BanIcon,
  CameraIcon,
  CheckIcon,
  SmileIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";
import { mediaUrl } from "@/config";
import type { ImagePick } from "@/hooks/useImagePick";
import { useAvatarPresets, type AvatarPreset } from "@/hooks/useAvatarPresets";
import type { AvatarChoice } from "@/lib/avatarChoice";
import { initials } from "@/lib/accountImage";
import { formatImageHint, IMAGE_SPECS } from "@/lib/imageSpecs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** The image the photo slot will show after saving: new pick → saved file (unless removed). */
function photoSrc(
  preview: string | null,
  savedUrl: string | null | undefined,
  removed: boolean,
): string | undefined {
  return preview || (!removed ? mediaUrl(savedUrl) : undefined);
}

/** The avatar URL after saving, before resolving it to a full media URL. */
function avatarUrlFor(
  choice: AvatarChoice,
  savedUrl: string | null | undefined,
  presets: AvatarPreset[] | null,
): string | null | undefined {
  if (choice === "none") return null;
  if (choice === "keep") return savedUrl;
  return presets?.find((preset) => preset.id === choice)?.url ?? null;
}

type PhotoSlotProps = {
  pick: ImagePick;
  savedUrl: string | null | undefined;
  removed: boolean;
  onRemovedChange: (removed: boolean) => void;
  name: string;
  compact: boolean;
};

function PhotoSlot({
  pick,
  savedUrl,
  removed,
  onRemovedChange,
  name,
  compact,
}: PhotoSlotProps) {
  const { inputRef, file, preview, clear } = pick;
  const src = photoSrc(preview, savedUrl, removed);
  const hasSaved = Boolean(savedUrl);

  const choose = () => inputRef.current?.click();

  return (
    <div
      className={cn(
        "flex gap-3",
        compact ? "flex-col items-center text-center" : "items-start",
      )}
    >
      <button
        type="button"
        onClick={choose}
        aria-label={`${src ? "Change" : "Upload"} photo`}
        className="group relative h-32 w-26 shrink-0 overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-primary/5 shadow-inner transition hover:border-primary/50 dark:bg-primary/10"
      >
        {src ? (
          <img
            src={src}
            alt={name || "Team photo"}
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <CameraIcon className="size-5 opacity-70" />
            <span className="text-[10px] font-medium uppercase tracking-wide">
              Photo
            </span>
          </div>
        )}
      </button>

      <div className={cn("min-w-0 space-y-1.5", compact && "w-full")}>
        <p className="text-sm font-medium">Photo</p>
        <p className="text-xs text-muted-foreground">
          {file
            ? `New file: ${file.name}`
            : removed
              ? "Will be removed when you save."
              : "Optional. Without a photo, the avatar is shown."}
        </p>
        {!compact && !file && !removed ? (
          <p className="text-[11px] text-muted-foreground/80">
            {formatImageHint(IMAGE_SPECS.teamPhoto)}
          </p>
        ) : null}
        <div className={cn("flex flex-wrap gap-1.5", compact && "justify-center")}>
          <Button type="button" variant="outline" size="sm" onClick={choose}>
            <CameraIcon />
            {src || hasSaved ? "Change" : "Upload"}
          </Button>
          {file ? (
            <Button type="button" variant="ghost" size="sm" onClick={clear}>
              <Undo2Icon />
              Undo
            </Button>
          ) : hasSaved && !removed ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onRemovedChange(true)}
            >
              <Trash2Icon />
              Remove
            </Button>
          ) : removed ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemovedChange(false)}
            >
              <Undo2Icon />
              Keep
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const next = e.target.files?.[0];
          if (next?.type.startsWith("image/")) onRemovedChange(false);
          pick.pick(next);
        }}
      />
    </div>
  );
}

type AvatarSlotProps = {
  name: string;
  savedUrl: string | null | undefined;
  choice: AvatarChoice;
  onChoiceChange: (choice: AvatarChoice) => void;
  presets: AvatarPreset[] | null;
  compact: boolean;
};

function AvatarPreview({
  name,
  savedUrl,
  choice,
  onChoiceChange,
  presets,
  compact,
}: AvatarSlotProps) {
  const url = avatarUrlFor(choice, savedUrl, presets);
  const src = mediaUrl(url);
  const isCustom =
    choice === "keep" &&
    Boolean(savedUrl) &&
    presets !== null &&
    !presets.some((preset) => preset.url === savedUrl);

  const hint =
    choice === "none" && savedUrl
      ? "Will be removed when you save."
      : typeof choice === "number" && url !== savedUrl
        ? "New avatar — saved with the form."
        : isCustom
          ? "Uploaded earlier. Pick one below to replace it."
          : "Optional. Pick one below. Without an avatar, the photo is used.";

  return (
    <div
      className={cn(
        "flex gap-3",
        compact ? "flex-col items-center text-center" : "items-start",
      )}
    >
      <div className="relative size-26 shrink-0 overflow-hidden rounded-full border border-dashed border-primary/30 bg-primary/5 shadow-inner dark:bg-primary/10">
        {src ? (
          <img
            src={src}
            alt={`${name || "Profile"} avatar`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <SmileIcon className="size-5 opacity-70" />
            <span className="text-[10px] font-medium uppercase tracking-wide">
              Avatar
            </span>
          </div>
        )}
      </div>

      <div className={cn("min-w-0 space-y-1.5", compact && "w-full")}>
        <p className="text-sm font-medium">Avatar</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <div className={cn("flex flex-wrap gap-1.5", compact && "justify-center")}>
          {choice !== "keep" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChoiceChange("keep")}
            >
              <Undo2Icon />
              Undo
            </Button>
          ) : savedUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onChoiceChange("none")}
            >
              <Trash2Icon />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AvatarPicker({
  savedUrl,
  choice,
  onChoiceChange,
  presets,
  canManagePresets,
}: Omit<AvatarSlotProps, "name" | "compact"> & { canManagePresets: boolean }) {
  const selectedUrl = avatarUrlFor(choice, savedUrl, presets);

  if (presets === null) {
    return (
      <div className="flex gap-2.5">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="size-11 rounded-full" />
        ))}
      </div>
    );
  }

  if (presets.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
        No avatars to choose from yet.{" "}
        {canManagePresets ? (
          <>
            Add up to 5 in{" "}
            <Link
              to="/admin/settings?tab=avatars"
              className="font-medium text-primary hover:underline"
            >
              Settings → Avatars
            </Link>
            .
          </>
        ) : (
          "Ask an admin to add some."
        )}
      </p>
    );
  }

  const tileClass =
    "relative size-11 shrink-0 overflow-hidden rounded-full border bg-muted/40 transition hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  const selectedClass = "ring-2 ring-primary ring-offset-2 ring-offset-background";

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">Choose an avatar</p>
        {canManagePresets ? (
          <Link
            to="/admin/settings?tab=avatars"
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Manage avatars
          </Link>
        ) : null}
      </div>
      <div role="group" aria-label="Avatar" className="flex flex-wrap gap-2.5">
        {presets.map((preset, index) => {
          const selected = preset.url === selectedUrl;
          const label = preset.label || `Avatar ${index + 1}`;
          return (
            <button
              key={preset.id}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={selected}
              onClick={() =>
                onChoiceChange(
                  choice === "keep" && preset.url === savedUrl ? "keep" : preset.id,
                )
              }
              className={cn(tileClass, selected && selectedClass)}
            >
              <img src={mediaUrl(preset.url)} alt="" className="size-full object-cover" />
              {selected ? (
                <span className="absolute inset-0 flex items-center justify-center bg-primary/35">
                  <CheckIcon className="size-4 text-white drop-shadow" />
                </span>
              ) : null}
            </button>
          );
        })}
        <button
          type="button"
          title="No avatar"
          aria-label="No avatar"
          aria-pressed={!selectedUrl}
          onClick={() => onChoiceChange(savedUrl ? "none" : "keep")}
          className={cn(
            tileClass,
            "flex items-center justify-center border-dashed text-muted-foreground",
            !selectedUrl && selectedClass,
          )}
        >
          <BanIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

type TeamImageFieldsProps = {
  name: string;
  photo: ImagePick;
  savedPhotoUrl?: string | null;
  removePhoto: boolean;
  onRemovePhotoChange: (removed: boolean) => void;
  savedAvatarUrl?: string | null;
  avatarChoice: AvatarChoice;
  onAvatarChoiceChange: (choice: AvatarChoice) => void;
  /** Show links to Settings → Avatars (admins only). */
  canManagePresets?: boolean;
  /** Stacked slots for the narrow admin form. */
  compact?: boolean;
};

/**
 * Portrait photo + avatar for a public team profile. The photo is uploaded;
 * the avatar is one of the admin's presets. Both are optional: the website
 * shows the photo, falls back to the avatar, then to initials.
 */
export function TeamImageFields({
  name,
  photo,
  savedPhotoUrl,
  removePhoto,
  onRemovePhotoChange,
  savedAvatarUrl,
  avatarChoice,
  onAvatarChoiceChange,
  canManagePresets = false,
  compact = false,
}: TeamImageFieldsProps) {
  const presets = useAvatarPresets();
  const noImage =
    !photoSrc(photo.preview, savedPhotoUrl, removePhoto) &&
    !avatarUrlFor(avatarChoice, savedAvatarUrl, presets);

  return (
    <div className="grid gap-4">
      <div className={cn("grid gap-4", compact ? "grid-cols-2" : "sm:grid-cols-2")}>
        <PhotoSlot
          pick={photo}
          savedUrl={savedPhotoUrl}
          removed={removePhoto}
          onRemovedChange={onRemovePhotoChange}
          name={name}
          compact={compact}
        />
        <AvatarPreview
          name={name}
          savedUrl={savedAvatarUrl}
          choice={avatarChoice}
          onChoiceChange={onAvatarChoiceChange}
          presets={presets}
          compact={compact}
        />
      </div>

      <AvatarPicker
        savedUrl={savedAvatarUrl}
        choice={avatarChoice}
        onChoiceChange={onAvatarChoiceChange}
        presets={presets}
        canManagePresets={canManagePresets}
      />

      {noImage ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border/80 bg-muted/30 px-3 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-xs font-bold text-white">
            {initials(name) || "?"}
          </span>
          <p className="text-xs text-muted-foreground">
            No photo or avatar. The initials avatar is shown instead.
          </p>
        </div>
      ) : null}
    </div>
  );
}
