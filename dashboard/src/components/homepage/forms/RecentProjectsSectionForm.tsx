import { useRef, useState } from "react";
import {
  CheckIcon,
  FilmIcon,
  ImagePlusIcon,
  Loader2Icon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { IMAGE_SPECS } from "@/lib/imageSpecs";
import { asArr, asStr } from "@/components/homepage/helpers";
import {
  ContentCard,
  EditorPanel,
  EmptyState,
  FIELD_TEXTAREA,
  Field,
  FieldGrid,
  ItemCard,
  SectionToolbar,
} from "@/components/homepage/FormUi";
import type { SectionFormProps } from "@/components/homepage/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ProjectDraft = {
  id: string;
  title: string;
  videoUrl: string;
  youtubeId: string;
  thumbnail: string;
};

const emptyProject = (): ProjectDraft => ({
  id: `project-${Date.now()}`,
  title: "",
  videoUrl: "",
  youtubeId: "",
  thumbnail: "",
});

function normalizeProject(raw: {
  id?: string;
  title?: string;
  videoUrl?: string;
  youtubeId?: string;
  thumbnail?: string;
}): ProjectDraft {
  return {
    id: asStr(raw.id, `project-${Date.now()}`),
    title: asStr(raw.title),
    videoUrl: asStr(raw.videoUrl),
    youtubeId: asStr(raw.youtubeId),
    thumbnail: asStr(raw.thumbnail),
  };
}

async function uploadMedia(
  file: File,
  kind: "image" | "video",
): Promise<string | null> {
  if (kind === "image" && !file.type.startsWith("image/")) {
    toast.error("Choose an image file.");
    return null;
  }
  if (kind === "video" && !file.type.startsWith("video/")) {
    toast.error("Choose a video file (MP4, WebM, or MOV).");
    return null;
  }
  const body = new FormData();
  body.append("file", file);
  const res = await apiFetch("/admin/homepage/media", {
    method: "POST",
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    toast.error(
      typeof data.message === "string" ? data.message : "Upload failed.",
    );
    return null;
  }
  return String(data.url ?? "");
}

export function RecentProjectsSectionForm({
  content,
  onChange,
}: SectionFormProps) {
  const projects = asArr<{
    id?: string;
    title?: string;
    videoUrl?: string;
    youtubeId?: string;
    thumbnail?: string;
  }>(content.projects).map(normalizeProject);

  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"idle" | "create" | "edit">("idle");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ProjectDraft>(emptyProject);
  const [uploading, setUploading] = useState<"video" | "thumb" | null>(null);

  const set = (patch: Record<string, unknown>) =>
    onChange({ ...content, ...patch });

  const setProjects = (next: ProjectDraft[]) => set({ projects: next });

  const openCreate = () => {
    setMode("create");
    setEditIndex(null);
    setForm(emptyProject());
  };

  const openEdit = (index: number) => {
    setMode("edit");
    setEditIndex(index);
    setForm({ ...projects[index] });
  };

  const cancelForm = () => {
    setMode("idle");
    setEditIndex(null);
    setForm(emptyProject());
    if (videoRef.current) videoRef.current.value = "";
    if (thumbRef.current) thumbRef.current.value = "";
  };

  const onUpload = async (
    file: File | undefined,
    kind: "video" | "thumb",
  ) => {
    if (!file) return;
    setUploading(kind);
    try {
      const url = await uploadMedia(file, kind === "video" ? "video" : "image");
      if (url) {
        setForm((f) =>
          kind === "video" ? { ...f, videoUrl: url } : { ...f, thumbnail: url },
        );
        toast.success(kind === "video" ? "Video uploaded." : "Thumbnail uploaded.");
      }
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setUploading(null);
      if (kind === "video" && videoRef.current) videoRef.current.value = "";
      if (kind === "thumb" && thumbRef.current) thumbRef.current.value = "";
    }
  };

  const submitForm = () => {
    if (!form.title.trim()) {
      toast.message("Video title is required.");
      return;
    }
    if (!form.videoUrl.trim() && !form.youtubeId.trim()) {
      toast.message("Upload a video or enter a YouTube id.");
      return;
    }

    const payload: ProjectDraft = {
      id: form.id.trim() || `project-${Date.now()}`,
      title: form.title.trim(),
      videoUrl: form.videoUrl.trim(),
      youtubeId: form.youtubeId.trim(),
      thumbnail: form.thumbnail.trim(),
    };

    if (mode === "create") {
      setProjects([...projects, payload]);
      toast.success("Video added — Save section to publish.");
    } else if (mode === "edit" && editIndex !== null) {
      const next = [...projects];
      next[editIndex] = payload;
      setProjects(next);
      toast.success("Video updated — Save section to publish.");
    }
    cancelForm();
  };

  const deleteProject = (index: number) => {
    const project = projects[index];
    if (!window.confirm(`Delete “${project.title}”?`)) return;
    if (editIndex === index) cancelForm();
    else if (editIndex !== null && editIndex > index) {
      setEditIndex(editIndex - 1);
    }
    setProjects(projects.filter((_, i) => i !== index));
    toast.success("Video removed — Save section to publish.");
  };

  const showForm = mode === "create" || mode === "edit";
  const thumbPreview = mediaUrl(form.thumbnail);
  const videoPreview = mediaUrl(form.videoUrl);

  return (
    <div className="grid gap-4">
      <ContentCard title="Section header">
        <FieldGrid cols={2}>
          <Field label="Eyebrow">
            <Input
              className="h-9"
              value={asStr(content.eyebrow)}
              onChange={(e) => set({ eyebrow: e.target.value })}
            />
          </Field>
          <Field label="Headline">
            <Input
              className="h-9"
              value={asStr(content.headline)}
              onChange={(e) => set({ headline: e.target.value })}
            />
          </Field>
          <Field label="Headline accent">
            <Input
              className="h-9"
              value={asStr(content.headlineAccent)}
              onChange={(e) => set({ headlineAccent: e.target.value })}
            />
          </Field>
        </FieldGrid>
        <div className="mt-3">
          <Field label="Description">
            <textarea
              className={FIELD_TEXTAREA}
              value={asStr(content.description)}
              onChange={(e) => set({ description: e.target.value })}
            />
          </Field>
        </div>
      </ContentCard>

      <SectionToolbar
        countLabel={`${projects.length} video${projects.length === 1 ? "" : "s"}`}
        addLabel="Add video"
        showAdd={!showForm}
        onAdd={openCreate}
      />

      {showForm ? (
        <EditorPanel
          mode={mode === "edit" ? "edit" : "create"}
          title={mode === "create" ? "New video" : "Edit video"}
          onClose={cancelForm}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex shrink-0 flex-col gap-3">
              <button
                type="button"
                disabled={uploading === "video"}
                onClick={() => videoRef.current?.click()}
                className={cn(
                  "group relative flex size-28 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-dashed bg-background/60 transition-colors hover:border-primary hover:bg-primary/5",
                  uploading === "video" && "pointer-events-none opacity-60",
                )}
              >
                {videoPreview ? (
                  <video
                    src={videoPreview}
                    className="size-full object-cover"
                    muted
                    playsInline
                  />
                ) : uploading === "video" ? (
                  <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <FilmIcon className="size-6 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      Video
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={uploading === "thumb"}
                onClick={() => thumbRef.current?.click()}
                className={cn(
                  "group relative flex size-28 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-dashed bg-background/60 transition-colors hover:border-primary hover:bg-primary/5",
                  uploading === "thumb" && "pointer-events-none opacity-60",
                )}
              >
                {thumbPreview ? (
                  <img
                    src={thumbPreview}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : uploading === "thumb" ? (
                  <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <ImagePlusIcon className="size-6 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      Thumb
                    </span>
                  </>
                )}
              </button>
              <p className="max-w-28 text-[10px] leading-snug text-muted-foreground">
                Video {IMAGE_SPECS.projectVideo.width}×
                {IMAGE_SPECS.projectVideo.height} · thumb{" "}
                {IMAGE_SPECS.projectThumb.width}×
                {IMAGE_SPECS.projectThumb.height}px
              </p>
              <input
                ref={videoRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="sr-only"
                onChange={(e) => void onUpload(e.target.files?.[0], "video")}
              />
              <input
                ref={thumbRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => void onUpload(e.target.files?.[0], "thumb")}
              />
            </div>

            <div className="grid min-w-0 flex-1 gap-3">
              <Field label="Title">
                <Input
                  className="h-9"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </Field>
              <FieldGrid cols={2}>
                <Field label="Id">
                  <Input
                    className="h-9"
                    value={form.id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, id: e.target.value }))
                    }
                  />
                </Field>
                <Field label="YouTube id">
                  <Input
                    className="h-9"
                    value={form.youtubeId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, youtubeId: e.target.value }))
                    }
                    placeholder="Optional"
                  />
                </Field>
              </FieldGrid>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={submitForm}
                  disabled={Boolean(uploading)}
                >
                  <CheckIcon />
                  {mode === "create" ? "Add" : "Save"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={cancelForm}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </EditorPanel>
      ) : null}

      {projects.length === 0 && !showForm ? (
        <EmptyState
          message="No videos yet"
          actionLabel="Add first video"
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => {
            const isEditing = mode === "edit" && editIndex === index;
            const thumb = mediaUrl(project.thumbnail);
            return (
              <ItemCard key={project.id} active={isEditing}>
                <div className="flex items-center gap-3">
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <FilmIcon className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {project.title}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {project.videoUrl || project.youtubeId || "No media"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={isEditing ? "secondary" : "ghost"}
                      onClick={() => openEdit(index)}
                      aria-label={`Edit ${project.title}`}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteProject(index)}
                      aria-label={`Delete ${project.title}`}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </div>
              </ItemCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
