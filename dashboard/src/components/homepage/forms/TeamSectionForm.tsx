import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { asArr, asBool, asStr } from "@/components/homepage/helpers";
import { MediaUploadField } from "@/components/homepage/MediaUploadField";
import type { SectionFormProps } from "@/components/homepage/types";
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

type MemberDraft = {
  id: string;
  name: string;
  role: string;
  tagline: string;
  photo: string;
  lead: boolean;
};

const emptyMember = (): MemberDraft => ({
  id: `member-${Date.now()}`,
  name: "",
  role: "",
  tagline: "",
  photo: "",
  lead: false,
});

function normalizeMember(raw: {
  id?: string;
  name?: string;
  role?: string;
  tagline?: string;
  photo?: string;
  lead?: boolean;
}): MemberDraft {
  return {
    id: asStr(raw.id, `member-${Date.now()}`),
    name: asStr(raw.name),
    role: asStr(raw.role),
    tagline: asStr(raw.tagline),
    photo: asStr(raw.photo),
    lead: asBool(raw.lead),
  };
}

export function TeamSectionForm({ content, onChange }: SectionFormProps) {
  const members = asArr<{
    id?: string;
    name?: string;
    role?: string;
    tagline?: string;
    photo?: string;
    lead?: boolean;
  }>(content.members).map(normalizeMember);

  const [mode, setMode] = useState<"idle" | "create" | "edit">("idle");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<MemberDraft>(emptyMember);

  const set = (patch: Record<string, unknown>) =>
    onChange({ ...content, ...patch });

  const setMembers = (next: MemberDraft[]) => set({ members: next });

  const openCreate = () => {
    setMode("create");
    setEditIndex(null);
    setForm(emptyMember());
  };

  const openEdit = (index: number) => {
    setMode("edit");
    setEditIndex(index);
    setForm({ ...members[index] });
  };

  const cancelForm = () => {
    setMode("idle");
    setEditIndex(null);
    setForm(emptyMember());
  };

  const submitForm = () => {
    if (!form.name.trim()) {
      toast.message("Name is required.");
      return;
    }
    if (!form.role.trim()) {
      toast.message("Role is required.");
      return;
    }
    if (!form.photo.trim()) {
      toast.message("Upload a member photo.");
      return;
    }

    const payload: MemberDraft = {
      id: form.id.trim() || `member-${Date.now()}`,
      name: form.name.trim(),
      role: form.role.trim(),
      tagline: form.tagline.trim(),
      photo: form.photo.trim(),
      lead: form.lead,
    };

    if (mode === "create") {
      setMembers([...members, payload]);
      toast.success("Member added — click Save section to publish.");
    } else if (mode === "edit" && editIndex !== null) {
      const next = [...members];
      next[editIndex] = payload;
      setMembers(next);
      toast.success("Member updated — click Save section to publish.");
    }
    cancelForm();
  };

  const deleteMember = (index: number) => {
    const member = members[index];
    if (!window.confirm(`Delete “${member.name}”?`)) return;
    if (editIndex === index) cancelForm();
    else if (editIndex !== null && editIndex > index) {
      setEditIndex(editIndex - 1);
    }
    setMembers(members.filter((_, i) => i !== index));
    toast.success("Member removed — click Save section to publish.");
  };

  return (
    <div className="grid gap-6">
      <p className="text-xs text-muted-foreground">
        Prefer the dedicated{" "}
        <Link
          to="/admin/team"
          className="text-primary underline-offset-4 hover:underline"
        >
          Team members
        </Link>{" "}
        page for roster CRUD. Headings and homepage card photos can still be
        managed here.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Pill</Label>
          <Input
            value={asStr(content.pill)}
            onChange={(e) => set({ pill: e.target.value })}
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

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
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
                <p className="text-sm font-semibold">Homepage team cards</p>
                <p className="text-xs text-muted-foreground">
                  Create a new card, or Edit to change name, role, and photo.
                </p>
              </div>
              <Button type="button" onClick={openCreate}>
                <PlusIcon />
                Create member
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      {mode === "create" ? "Create member" : "Update member"}
                    </p>
                    <Badge
                      variant={mode === "create" ? "default" : "secondary"}
                    >
                      {mode === "create" ? "New" : "Editing"}
                    </Badge>
                  </div>
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
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Input
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Tagline</Label>
                <Input
                  value={form.tagline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tagline: e.target.value }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.lead}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lead: e.target.checked }))
                  }
                  className="size-4 rounded border"
                />
                Lead card
              </label>
              <MediaUploadField
                label="Photo"
                kind="image"
                value={form.photo}
                hint="Change member photo"
                onChange={(url) => setForm((f) => ({ ...f, photo: url }))}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={submitForm}>
                  <CheckIcon />
                  {mode === "create" ? "Add member" : "Update member"}
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
              <p className="text-sm font-semibold">Member roster</p>
              <p className="text-xs text-muted-foreground">
                {members.length} member{members.length === 1 ? "" : "s"}
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

          {members.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No members yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[160px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member, index) => {
                  const isEditing = mode === "edit" && editIndex === index;
                  const photo = mediaUrl(member.photo);
                  return (
                    <TableRow
                      key={member.id}
                      className={isEditing ? "bg-amber-500/10" : undefined}
                    >
                      <TableCell>
                        <div className="size-10 overflow-hidden rounded-full border bg-muted">
                          {photo ? (
                            <img
                              src={photo}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{member.name}</p>
                        {member.lead ? (
                          <Badge variant="secondary" className="mt-0.5">
                            Lead
                          </Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.role}
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
                            onClick={() => deleteMember(index)}
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
