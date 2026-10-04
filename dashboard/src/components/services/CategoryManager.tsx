import { useState, type FormEvent } from "react";
import {
  FolderPlusIcon,
  Loader2Icon,
  PencilIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { IconPicker, ServiceIcon } from "@/components/ServiceIcon";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readMessage, slugify, type GroupRow } from "./serviceTypes";

export function CategoryManager({
  groups,
  serviceCount,
  onChanged,
}: {
  groups: GroupRow[];
  serviceCount: (groupId: number) => number;
  onChanged: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<GroupRow | null>(null);
  const [formOpen, setFormOpen] = useState(groups.length === 0);
  const [title, setTitle] = useState("");
  const [blurb, setBlurb] = useState("");
  const [icon, setIcon] = useState("Layout");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<GroupRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openForm = (row: GroupRow | null) => {
    setEditing(row);
    setTitle(row?.title ?? "");
    setBlurb(row?.blurb ?? "");
    setIcon(row?.icon ?? "Layout");
    setFormOpen(true);
  };

  const closeForm = () => {
    setEditing(null);
    setFormOpen(false);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2 || blurb.trim().length < 2) {
      toast.error("Add a category name and a short description.");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch(
        editing
          ? `/admin/services/groups/${editing.id}`
          : "/admin/services/groups",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            title: title.trim(),
            slug: editing?.slug ?? slugify(title, 80),
            blurb: blurb.trim(),
            icon,
          }),
        },
      );
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not save the category."));
        return;
      }
      toast.success(editing ? "Category updated." : "Category added.");
      closeForm();
      await onChanged();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: GroupRow) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/admin/services/groups/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not delete the category."));
        return;
      }
      setPendingDelete(null);
      toast.success("Category deleted.");
      await onChanged();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          Categories are the headings in the website's Services menu (for
          example “E-commerce” or “Web”). Every service belongs to one.
        </p>
        {!formOpen ? (
          <Button type="button" size="sm" onClick={() => openForm(null)}>
            <FolderPlusIcon />
            Add category
          </Button>
        ) : null}
      </div>

      {formOpen ? (
        <form
          onSubmit={handleSave}
          className="grid gap-4 rounded-2xl border bg-muted/15 p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {editing ? `Edit “${editing.title}”` : "New category"}
            </p>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Close"
              onClick={closeForm}
            >
              <XIcon />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="catTitle">Category name</Label>
              <Input
                id="catTitle"
                value={title}
                placeholder="e.g. Marketing & Growth"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="catBlurb">Short description</Label>
              <Input
                id="catBlurb"
                value={blurb}
                placeholder="e.g. Campaigns that bring in more customers."
                onChange={(e) => setBlurb(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Icon</Label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
              {editing ? "Save category" : "Add category"}
            </Button>
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((row) => {
          const count = serviceCount(row.id);
          return (
            <div
              key={row.id}
              className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ServiceIcon name={row.icon} className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{row.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {row.blurb}
                  </p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
                <span className="text-xs text-muted-foreground">
                  {count === 0
                    ? "No services"
                    : `${count} service${count === 1 ? "" : "s"}`}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openForm(row)}
                  >
                    <PencilIcon />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${row.title}`}
                    title={
                      count > 0
                        ? "Move or delete its services first"
                        : "Delete category"
                    }
                    disabled={count > 0}
                    onClick={() => setPendingDelete(row)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
        title={`Delete “${pendingDelete?.title ?? "category"}”?`}
        description="The category will be removed from the website menu. This cannot be undone."
        confirmLabel="Delete category"
        destructive
        loading={deleting}
        onConfirm={() => {
          if (pendingDelete) void handleDelete(pendingDelete);
        }}
      />
    </div>
  );
}
