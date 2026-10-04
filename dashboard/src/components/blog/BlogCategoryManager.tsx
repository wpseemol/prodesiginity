import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderIcon, Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IconPicker, ServiceIcon } from "@/components/ServiceIcon";
import { readMessage, slugify } from "@/components/services/serviceTypes";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BlogMediaInput } from "./BlogMediaInput";
import {
  blogCategoryFormSchema,
  type BlogCategoryFormValues,
  type BlogCategoryRow,
} from "./blogTypes";

const EMPTY: BlogCategoryFormValues = { name: "", slug: "", description: "", imageUrl: "", icon: "" };

function toForm(row: BlogCategoryRow): BlogCategoryFormValues {
  return {
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    imageUrl: row.imageUrl ?? "",
    icon: row.icon ?? "",
  };
}

function CategoryForm({
  editing,
  onDone,
}: {
  editing: BlogCategoryRow | null;
  onDone: (saved: boolean) => void;
}) {
  const [slugTouched, setSlugTouched] = useState(Boolean(editing));
  const form = useForm<BlogCategoryFormValues>({
    resolver: zodResolver(blogCategoryFormSchema),
    defaultValues: editing ? toForm(editing) : EMPTY,
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await apiFetch(
        editing ? `/manage/blog/categories/${editing.id}` : "/manage/blog/categories",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            name: values.name,
            slug: values.slug,
            description: values.description || null,
            imageUrl: values.imageUrl || null,
            icon: values.icon || null,
          }),
        },
      );
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not save the category."));
        return;
      }
      toast.success(editing ? "Category updated." : "Category created.");
      onDone(true);
    } catch {
      toast.error("Could not reach the server.");
    }
  });

  const icon = useWatch({ control: form.control, name: "icon" });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 rounded-2xl border bg-muted/20 p-4 sm:p-5">
      <p className="text-sm font-semibold">{editing ? `Edit “${editing.name}”` : "New category"}</p>

      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cat-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="cat-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Product rendering"
                  onChange={(e) => {
                    field.onChange(e);
                    if (!slugTouched) {
                      form.setValue("slug", slugify(e.target.value, 80), { shouldValidate: true });
                    }
                  }}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
          <Controller
            name="slug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cat-slug">URL slug</FieldLabel>
                <Input
                  {...field}
                  id="cat-slug"
                  aria-invalid={fieldState.invalid}
                  placeholder="product-rendering"
                  onChange={(e) => {
                    setSlugTouched(true);
                    field.onChange(slugify(e.target.value, 80));
                  }}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="cat-description">
                Description <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea {...field} id="cat-description" rows={2} aria-invalid={fieldState.invalid} />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,18rem)_1fr]">
          <Controller
            name="imageUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cat-image">
                  Image <span className="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <BlogMediaInput
                  id="cat-image"
                  kind="image"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={fieldState.invalid}
                />
                <FieldDescription>Used as the cover for articles in this category that have none.</FieldDescription>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="icon"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="cat-icon-toggle">
                      Icon <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <FieldDescription>Shown next to the category name on the website.</FieldDescription>
                  </FieldContent>
                  <Switch
                    id="cat-icon-toggle"
                    checked={Boolean(field.value)}
                    onCheckedChange={(on) => field.onChange(on ? "Sparkles" : "")}
                  />
                </Field>
                {icon ? <IconPicker value={field.value} onChange={field.onChange} /> : null}
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => onDone(false)} disabled={form.formState.isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2Icon className="animate-spin" /> : null}
          {editing ? "Save category" : "Create category"}
        </Button>
      </div>
    </form>
  );
}

export function BlogCategoryManager({
  categories,
  onChanged,
}: {
  categories: BlogCategoryRow[];
  onChanged: () => Promise<void> | void;
}) {
  const [formState, setFormState] = useState<{ editing: BlogCategoryRow | null } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BlogCategoryRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (row: BlogCategoryRow) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/manage/blog/categories/${row.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not delete the category."));
        return;
      }
      toast.success(`“${row.name}” was deleted.`);
      setPendingDelete(null);
      await onChanged();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-4">
      {formState ? (
        <CategoryForm
          key={formState.editing?.id ?? "new"}
          editing={formState.editing}
          onDone={(saved) => {
            setFormState(null);
            if (saved) void onChanged();
          }}
        />
      ) : (
        <Button type="button" variant="outline" className="w-fit" onClick={() => setFormState({ editing: null })}>
          <PlusIcon />
          Add category
        </Button>
      )}

      {categories.length === 0 ? (
        <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed p-8 text-center">
          <FolderIcon className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No categories yet. Every article belongs to one, so add one first.
          </p>
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
          {categories.map((row) => {
            const image = mediaUrl(row.imageUrl);
            return (
              <li key={row.id} className="flex items-center gap-3 p-3 sm:p-4">
                <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                  {image ? (
                    <img src={image} alt="" className="size-full object-cover" />
                  ) : row.icon ? (
                    <ServiceIcon name={row.icon} className="size-5" />
                  ) : (
                    <FolderIcon className="size-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium">
                    {row.icon && image ? <ServiceIcon name={row.icon} className="size-4 text-muted-foreground" /> : null}
                    {row.name}
                  </p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    /{row.slug} · {row.postCount} {row.postCount === 1 ? "article" : "articles"}
                    {row.description ? ` · ${row.description}` : ""}
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => setFormState({ editing: row })}>
                  <PencilIcon />
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={`Delete ${row.name}`}
                  className="text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(row)}
                >
                  <Trash2Icon />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
        title={`Delete “${pendingDelete?.name ?? "category"}”?`}
        description={
          pendingDelete && pendingDelete.postCount > 0
            ? `It still has ${pendingDelete.postCount} article(s). Move them to another category first.`
            : "This cannot be undone."
        }
        confirmLabel="Delete category"
        loading={deleting}
        onConfirm={() => {
          if (pendingDelete) void handleDelete(pendingDelete);
        }}
      />
    </div>
  );
}
