import { useRef, useState } from "react";
import { CameraIcon, FilmIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import {
  formatImageHint,
  IMAGE_SPECS,
  type ImageSpec,
} from "@/lib/imageSpecs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MediaKind = "image" | "video" | "any";

type MediaUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  kind?: MediaKind;
  /** Override free-form hint. Defaults to recommended dimensions. */
  hint?: string;
  /** Recommended size shown under the control. */
  spec?: ImageSpec;
};

const ACCEPT: Record<MediaKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  video: "video/mp4,video/webm,video/quicktime",
  any: "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime",
};

export function MediaUploadField({
  label,
  value,
  onChange,
  kind = "image",
  hint,
  spec = kind === "video" ? IMAGE_SPECS.projectVideo : IMAGE_SPECS.homepageImage,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const preview = mediaUrl(value);
  const looksVideo =
    kind === "video" ||
    /\.(mp4|webm|mov)(\?|$)/i.test(value) ||
    value.includes("/video/");

  const sizeHint = hint ?? formatImageHint(spec);

  const upload = async (file: File | undefined) => {
    if (!file) return;

    if (kind === "image" && !file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (kind === "video" && !file.type.startsWith("video/")) {
      toast.error("Please choose a video file (MP4, WebM, or MOV).");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await apiFetch("/admin/homepage/media", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Could not upload file.",
        );
        return;
      }
      onChange(String(data.url ?? ""));
      toast.success(
        file.type.startsWith("video/") ? "Video uploaded." : "Image uploaded.",
      );
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-2 rounded-xl border bg-muted/20 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Label>{label}</Label>
        <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {spec.width}×{spec.height}px
        </span>
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {preview && !looksVideo ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : preview && looksVideo ? (
            <video
              src={preview}
              className="size-full object-cover"
              muted
              playsInline
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              {kind === "video" ? (
                <FilmIcon className="size-6" />
              ) : (
                <CameraIcon className="size-6" />
              )}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs text-muted-foreground">{sizeHint}</p>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              kind === "video"
                ? "/uploads/homepage/… or https://…"
                : "/uploads/… or https://…"
            }
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <UploadIcon />
              )}
              {kind === "video"
                ? "Upload video"
                : value
                  ? "Change image"
                  : "Upload image"}
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT[kind]}
            className="sr-only"
            onChange={(e) => void upload(e.target.files?.[0])}
          />
        </div>
      </div>
    </div>
  );
}
