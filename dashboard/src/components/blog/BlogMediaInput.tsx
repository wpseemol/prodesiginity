import { useRef, useState, type DragEvent } from "react";
import { FilmIcon, ImageIcon, Loader2Icon, UploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readMessage } from "@/components/services/serviceTypes";

type BlogMediaInputProps = {
  id?: string;
  value: string;
  onChange: (url: string) => void;
  onBlur?: () => void;
  kind: "image" | "video";
  invalid?: boolean;
  /** Smaller preview for in-article blocks. */
  compact?: boolean;
};

const ACCEPT = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  video: "video/mp4,video/webm,video/quicktime",
};

const MAX_BYTES = { image: 5 * 1024 * 1024, video: 120 * 1024 * 1024 };

function youTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match?.[1] ?? null;
}

export function BlogMediaInput({
  id,
  value,
  onChange,
  onBlur,
  kind,
  invalid,
  compact,
}: BlogMediaInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPT[kind].split(",").includes(file.type)) {
      toast.error(kind === "image" ? "Choose a JPEG, PNG, WebP or GIF image." : "Choose an MP4, WebM or MOV video.");
      return;
    }
    if (file.size > MAX_BYTES[kind]) {
      toast.error(kind === "image" ? "Images must be 5 MB or smaller." : "Videos must be 120 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await apiFetch("/manage/blog/media", { method: "POST", body });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not upload the file."));
        return;
      }
      const data = (await res.json()) as { url?: string };
      onChange(String(data.url ?? ""));
      toast.success(kind === "video" ? "Video uploaded." : "Image uploaded.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const preview = mediaUrl(value);
  const ytId = kind === "video" ? youTubeId(value) : null;
  const Icon = kind === "video" ? FilmIcon : ImageIcon;
  const dropProps = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      void upload(e.dataTransfer.files?.[0]);
    },
  };

  return (
    <div className="grid gap-2">
      {value ? (
        <div className={`relative overflow-hidden rounded-lg border bg-muted ${compact ? "h-20 w-32" : "aspect-video w-full"}`}>
          {preview && kind === "image" ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : ytId ? (
            <img src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`} alt="" className="size-full object-cover" />
          ) : preview && kind === "video" && /\.(mp4|webm|mov)(\?|$)/i.test(value) ? (
            <video src={preview} className="size-full object-cover" muted playsInline controls={!compact} />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Icon className="size-6" />
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={`Remove ${kind}`}
            className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          {...dropProps}
          className={`flex w-full items-center gap-3 rounded-lg border border-dashed px-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 ${
            compact ? "py-2.5" : "py-5"
          } ${dragging ? "border-primary bg-primary/10" : "bg-muted/30"}`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
            {uploading ? <Loader2Icon className="size-4 animate-spin" /> : <Icon className="size-4" />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium">
              {uploading ? "Uploading…" : dragging ? "Drop to upload" : `Drag & drop or click to upload`}
            </span>
            <span className="block text-xs text-muted-foreground">
              {kind === "image" ? "JPEG, PNG, WebP or GIF · up to 5 MB" : "MP4, WebM or MOV · up to 120 MB"}
            </span>
          </span>
        </button>
      )}

      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={invalid || undefined}
          placeholder={kind === "video" ? "Upload, or paste a YouTube / Vimeo link" : "Upload, or paste an https:// link"}
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
          Upload
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT[kind]}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => void upload(e.target.files?.[0])}
      />
    </div>
  );
}
