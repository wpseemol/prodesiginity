import { useState } from "react";
import {
  CheckIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { asArr, asStr } from "@/components/homepage/helpers";
import { MediaUploadField } from "@/components/homepage/MediaUploadField";
import type { SectionFormProps } from "@/components/homepage/types";
import { TEXTAREA_CLASS } from "@/components/homepage/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const [mode, setMode] = useState<"idle" | "create" | "edit">("idle");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ProjectDraft>(emptyProject);

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
      toast.success("Video added — click Save section to publish.");
    } else if (mode === "edit" && editIndex !== null) {
      const next = [...projects];
      next[editIndex] = payload;
      setProjects(next);
      toast.success("Video updated — click Save section to publish.");
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
    toast.success("Video removed — click Save section to publish.");
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Eyebrow</Label>
          <Input
            value={asStr(content.eyebrow)}
            onChange={(e) => set({ eyebrow: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Headline</Label>
          <Input
            value={asStr(content.headline)}
            onChange={(e) => set({ headline: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Headline accent</Label>
          <Input
            value={asStr(content.headlineAccent)}
            onChange={(e) => set({ headlineAccent: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <textarea
          className={TEXTAREA_CLASS}
          value={asStr(content.description)}
          onChange={(e) => set({ description: e.target.value })}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div
          className={
            mode === "edit"
              ? "grid gap-4 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4"
              : mode === "create"
                ? "grid gap-4 rounded-xl border border-primary/40 bg-primary/5 p-4"
                : "grid gap-4 rounded-xl border border-dashed bg-muted/20 p-4"
          }
        >
          {mode === "idle" ? (
            <>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Videos</p>
                <p className="text-xs text-muted-foreground">
                  Create a new video, or Edit an existing one to change title,
                  file, or thumbnail.
                </p>
              </div>
              <Button type="button" onClick={openCreate}>
                <PlusIcon />
                Create video
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      {mode === "create" ? "Create video" : "Update video"}
                    </p>
                    <Badge
                      variant={mode === "create" ? "default" : "secondary"}
                    >
                      {mode === "create" ? "New" : "Editing"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mode === "create"
                      ? "Upload a video file and optional thumbnail."
                      : `Editing “${projects[editIndex ?? 0]?.title ?? "video"}”.`}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={cancelForm}
                >
                  <XIcon />
                </Button>
              </div>

              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Video title"
                />
              </div>
              <div className="grid gap-2">
                <Label>Id (slug)</Label>
                <Input
                  value={form.id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, id: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>YouTube id (optional)</Label>
                <Input
                  value={form.youtubeId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, youtubeId: e.target.value }))
                  }
                  placeholder="Leave empty if uploading a file"
                />
              </div>
              <MediaUploadField
                label="Video file"
                kind="video"
                value={form.videoUrl}
                hint="MP4 / WebM / MOV, or paste an external URL"
                onChange={(url) => setForm((f) => ({ ...f, videoUrl: url }))}
              />
              <MediaUploadField
                label="Thumbnail image"
                kind="image"
                value={form.thumbnail}
                hint="Poster shown before play"
                onChange={(url) => setForm((f) => ({ ...f, thumbnail: url }))}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={submitForm}>
                  <CheckIcon />
                  {mode === "create" ? "Add video" : "Update video"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Video roster</p>
              <p className="text-xs text-muted-foreground">
                {projects.length} video{projects.length === 1 ? "" : "s"}
              </p>
            </div>
            {mode === "idle" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={openCreate}
              >
                <PlusIcon />
                Create
              </Button>
            ) : null}
          </div>

          {projects.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No videos yet. Create the first one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumb</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[160px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project, index) => {
                  const isEditing = mode === "edit" && editIndex === index;
                  const thumb = mediaUrl(project.thumbnail);
                  return (
                    <TableRow
                      key={project.id}
                      className={isEditing ? "bg-amber-500/10" : undefined}
                    >
                      <TableCell>
                        <div className="size-14 overflow-hidden rounded-lg border bg-muted">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{project.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {project.videoUrl || project.youtubeId || "No media"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant={isEditing ? "secondary" : "outline"}
                            onClick={() => openEdit(index)}
                          >
                            <PencilIcon />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteProject(index)}
                          >
                            <Trash2Icon />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
