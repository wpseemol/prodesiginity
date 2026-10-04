import { CameraIcon, SmileIcon, Trash2Icon, Undo2Icon } from "lucide-react";
import { mediaUrl } from "@/config";
import type { ImagePick } from "@/hooks/useImagePick";
import { initials } from "@/lib/accountImage";
import { formatImageHint, IMAGE_SPECS } from "@/lib/imageSpecs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** The image a slot will show after saving: new pick → saved file (unless removed). */
function slotImageSrc(
  preview: string | null,
  savedUrl: string | null | undefined,
  removed: boolean,
): string | undefined {
  return preview || (!removed ? mediaUrl(savedUrl) : undefined);
}

type SlotProps = {
  kind: "photo" | "avatar";
  pick: ImagePick;
  savedUrl: string | null | undefined;
  removed: boolean;
  onRemovedChange: (removed: boolean) => void;
  name: string;
  compact: boolean;
};

const SLOT_COPY = {
  photo: {
    title: "Photo",
    empty: "Photo",
    hint: "Optional. Without a photo, the avatar is shown.",
    spec: IMAGE_SPECS.teamPhoto,
    Icon: CameraIcon,
    frame: "h-32 w-26 rounded-2xl",
  },
  avatar: {
    title: "Avatar",
    empty: "Avatar",
    hint: "Optional. Without an avatar, the photo is used.",
    spec: IMAGE_SPECS.teamAvatar,
    Icon: SmileIcon,
    frame: "size-26 rounded-full",
  },
} as const;

function ImageSlot({
  kind,
  pick,
  savedUrl,
  removed,
  onRemovedChange,
  name,
  compact,
}: SlotProps) {
  const { inputRef, file, preview, clear } = pick;
  const copy = SLOT_COPY[kind];
  const src = slotImageSrc(preview, savedUrl, removed);
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
        aria-label={`${src ? "Change" : "Upload"} ${kind}`}
        className={cn(
          "group relative shrink-0 overflow-hidden border border-dashed border-primary/30 bg-primary/5 shadow-inner transition hover:border-primary/50 dark:bg-primary/10",
          copy.frame,
        )}
      >
        {src ? (
          <img
            src={src}
            alt={kind === "photo" ? name || "Team photo" : `${name || "Profile"} avatar`}
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <copy.Icon className="size-5 opacity-70" />
            <span className="text-[10px] font-medium uppercase tracking-wide">
              {copy.empty}
            </span>
          </div>
        )}
      </button>

      <div className={cn("min-w-0 space-y-1.5", compact && "w-full")}>
        <p className="text-sm font-medium">{copy.title}</p>
        <p className="text-xs text-muted-foreground">
          {file
            ? `New file: ${file.name}`
            : removed
              ? "Will be removed when you save."
              : copy.hint}
        </p>
        {!compact && !file && !removed ? (
          <p className="text-[11px] text-muted-foreground/80">
            {formatImageHint(copy.spec)}
          </p>
        ) : null}
        <div
          className={cn("flex flex-wrap gap-1.5", compact && "justify-center")}
        >
          <Button type="button" variant="outline" size="sm" onClick={choose}>
            <copy.Icon />
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

type TeamImageFieldsProps = {
  name: string;
  photo: ImagePick;
  avatar: ImagePick;
  savedPhotoUrl?: string | null;
  savedAvatarUrl?: string | null;
  removePhoto: boolean;
  onRemovePhotoChange: (removed: boolean) => void;
  removeAvatar: boolean;
  onRemoveAvatarChange: (removed: boolean) => void;
  /** Stacked slots for the narrow admin form. */
  compact?: boolean;
};

/**
 * Portrait photo + avatar for a public team profile. Both are optional: the
 * website shows the photo, falls back to the avatar, then to initials.
 */
export function TeamImageFields({
  name,
  photo,
  avatar,
  savedPhotoUrl,
  savedAvatarUrl,
  removePhoto,
  onRemovePhotoChange,
  removeAvatar,
  onRemoveAvatarChange,
  compact = false,
}: TeamImageFieldsProps) {
  const noImage =
    !slotImageSrc(photo.preview, savedPhotoUrl, removePhoto) &&
    !slotImageSrc(avatar.preview, savedAvatarUrl, removeAvatar);

  return (
    <div className="grid gap-3">
      <div className={cn("grid gap-4", compact ? "grid-cols-2" : "sm:grid-cols-2")}>
        <ImageSlot
          kind="photo"
          pick={photo}
          savedUrl={savedPhotoUrl}
          removed={removePhoto}
          onRemovedChange={onRemovePhotoChange}
          name={name}
          compact={compact}
        />
        <ImageSlot
          kind="avatar"
          pick={avatar}
          savedUrl={savedAvatarUrl}
          removed={removeAvatar}
          onRemovedChange={onRemoveAvatarChange}
          name={name}
          compact={compact}
        />
      </div>
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
