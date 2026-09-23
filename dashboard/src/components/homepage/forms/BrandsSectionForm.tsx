import { useRef, useState } from "react";
import {
  CheckIcon,
  ImagePlusIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { asArr, asStr } from "@/components/homepage/helpers";
import type { SectionFormProps } from "@/components/homepage/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  brandFormSchema,
  brandLogoFileSchema,
  LOGO_HINT,
  LOGO_MAX_HEIGHT,
  LOGO_MAX_WIDTH,
  LOGO_MIN_HEIGHT,
  LOGO_MIN_WIDTH,
  LOGO_REC_HEIGHT,
  LOGO_REC_WIDTH,
  type BrandFormValues,
} from "@/lib/zod/brand";

export type BrandDraft = BrandFormValues;

const EMPTY_BRAND: BrandDraft = {
  name: "",
  logo: "",
  color: "#6366f1",
};

function normalizeBrand(raw: {
  name?: string;
  logo?: string;
  color?: string;
}): BrandDraft {
  return {
    name: asStr(raw.name),
    logo: asStr(raw.logo),
    color: asStr(raw.color, "#6366f1"),
  };
}

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(size);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

async function uploadLogo(file: File): Promise<string | null> {
  const fileCheck = brandLogoFileSchema.safeParse(file);
  if (!fileCheck.success) {
    toast.error(fileCheck.error.issues[0]?.message ?? "Invalid logo file.");
    return null;
  }

  try {
    const { width, height } = await readImageSize(file);
    if (width < LOGO_MIN_WIDTH || height < LOGO_MIN_HEIGHT) {
      toast.error(
        `Logo too small (${width}×${height}px). Use at least ${LOGO_MIN_WIDTH}×${LOGO_MIN_HEIGHT}px.`,
      );
      return null;
    }
    if (width > LOGO_MAX_WIDTH || height > LOGO_MAX_HEIGHT) {
      toast.error(
        `Logo too large (${width}×${height}px). Keep under ${LOGO_MAX_WIDTH}×${LOGO_MAX_HEIGHT}px (best ${LOGO_REC_WIDTH}×${LOGO_REC_HEIGHT}px).`,
      );
      return null;
    }
    if (width !== LOGO_REC_WIDTH || height !== LOGO_REC_HEIGHT) {
      toast.message(
        `Uploaded ${width}×${height}px — ideal is ${LOGO_REC_WIDTH}×${LOGO_REC_HEIGHT}px.`,
      );
    }
  } catch {
    toast.error("Could not read image dimensions.");
    return null;
  }

  const body = new FormData();
  body.append("file", file);
  const res = await apiFetch("/admin/homepage/logo", {
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

export function BrandsSectionForm({ content, onChange }: SectionFormProps) {
  const brands = asArr<{ name?: string; logo?: string; color?: string }>(
    content.brands,
  ).map(normalizeBrand);

  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"idle" | "create" | "edit">("idle");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<BrandDraft>(EMPTY_BRAND);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof BrandDraft, string>>
  >({});
  const [uploading, setUploading] = useState(false);

  const setBrands = (next: BrandDraft[]) =>
    onChange({ ...content, brands: next });

  const openCreate = () => {
    setMode("create");
    setEditIndex(null);
    setForm(EMPTY_BRAND);
    setFieldErrors({});
  };

  const openEdit = (index: number) => {
    setMode("edit");
    setEditIndex(index);
    setForm({ ...brands[index] });
    setFieldErrors({});
  };

  const cancelForm = () => {
    setMode("idle");
    setEditIndex(null);
    setForm(EMPTY_BRAND);
    setFieldErrors({});
    if (fileRef.current) fileRef.current.value = "";
  };

  const onPickLogo = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadLogo(file);
      if (url) {
        setForm((f) => ({ ...f, logo: url }));
        setFieldErrors((e) => ({ ...e, logo: undefined }));
        toast.success("Logo uploaded.");
      }
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submitForm = () => {
    const parsed = brandFormSchema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<keyof BrandDraft, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in next)) {
          next[key as keyof BrandDraft] = issue.message;
        }
      }
      setFieldErrors(next);
      toast.error(parsed.error.issues[0]?.message ?? "Fix the form errors.");
      return;
    }

    setFieldErrors({});
    const payload = parsed.data;

    if (mode === "create") {
      setBrands([...brands, payload]);
      toast.success("Brand added — Save section to publish.");
    } else if (mode === "edit" && editIndex !== null) {
      const next = [...brands];
      next[editIndex] = payload;
      setBrands(next);
      toast.success("Brand updated — Save section to publish.");
    }

    cancelForm();
  };

  const deleteBrand = (index: number) => {
    const brand = brands[index];
    if (!window.confirm(`Delete “${brand.name}”?`)) return;
    if (editIndex === index) cancelForm();
    else if (editIndex !== null && editIndex > index) {
      setEditIndex(editIndex - 1);
    }
    setBrands(brands.filter((_, i) => i !== index));
    toast.success("Brand removed — Save section to publish.");
  };

  const logoPreview = mediaUrl(form.logo);
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const showForm = isCreate || isEdit;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {brands.length} logo{brands.length === 1 ? "" : "s"}
        </p>
        {!showForm ? (
          <Button type="button" size="sm" onClick={openCreate}>
            <PlusIcon />
            Add logo
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <div
          className={cn(
            "rounded-xl border p-4",
            isCreate && "border-primary/50 bg-primary/5",
            isEdit && "border-amber-500/40 bg-amber-500/5",
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {isCreate ? "New brand" : "Edit brand"}
            </p>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={cancelForm}
              aria-label="Close"
            >
              <XIcon />
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex w-full shrink-0 flex-col gap-1.5 sm:w-auto">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "group relative flex size-28 shrink-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-dashed bg-background/60 transition-colors",
                  "hover:border-primary hover:bg-primary/5",
                  fieldErrors.logo && "border-destructive",
                  uploading && "pointer-events-none opacity-60",
                )}
              >
                {logoPreview ? (
                  <>
                    <img
                      src={logoPreview}
                      alt=""
                      className="size-full object-contain p-3"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-background/80 py-1 text-center text-[10px] font-medium opacity-0 transition-opacity group-hover:opacity-100">
                      Change
                    </span>
                  </>
                ) : uploading ? (
                  <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <ImagePlusIcon className="size-6 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      Logo
                    </span>
                  </>
                )}
              </button>
              <p className="max-w-32 text-[10px] leading-snug text-muted-foreground">
                {LOGO_HINT}
              </p>
              {fieldErrors.logo ? (
                <p className="max-w-32 text-[10px] text-destructive">
                  {fieldErrors.logo}
                </p>
              ) : null}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => void onPickLogo(e.target.files?.[0])}
              />
            </div>

            <div className="grid min-w-0 flex-1 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="brandName" className="text-xs">
                  Name
                </Label>
                <Input
                  id="brandName"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    setFieldErrors((err) => ({ ...err, name: undefined }));
                  }}
                  placeholder="Brand name"
                  className={cn("h-9", fieldErrors.name && "border-destructive")}
                  aria-invalid={Boolean(fieldErrors.name)}
                />
                {fieldErrors.name ? (
                  <p className="text-[10px] text-destructive">
                    {fieldErrors.name}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="brandColor" className="text-xs">
                  Color
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="brandColor"
                    type="color"
                    value={form.color || "#6366f1"}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, color: e.target.value }));
                      setFieldErrors((err) => ({ ...err, color: undefined }));
                    }}
                    className="size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, color: e.target.value }));
                      setFieldErrors((err) => ({ ...err, color: undefined }));
                    }}
                    placeholder="#6366f1"
                    className={cn(
                      "h-9 font-mono text-xs",
                      fieldErrors.color && "border-destructive",
                    )}
                    aria-invalid={Boolean(fieldErrors.color)}
                  />
                </div>
                {fieldErrors.color ? (
                  <p className="text-[10px] text-destructive">
                    {fieldErrors.color}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={submitForm}
                  disabled={uploading}
                >
                  <CheckIcon />
                  {isCreate ? "Add" : "Save"}
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
        </div>
      ) : null}

      {brands.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-12">
          <ImagePlusIcon className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No brand logos yet</p>
          <Button type="button" size="sm" onClick={openCreate}>
            <PlusIcon />
            Add first logo
          </Button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand, index) => {
            const isEditing = isEdit && editIndex === index;
            const preview = mediaUrl(brand.logo);
            return (
              <div
                key={`${brand.name}-${index}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card/50 p-3 transition-colors",
                  isEditing && "border-amber-500/50 bg-amber-500/10",
                )}
              >
                <div
                  className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted"
                  style={{ outline: `2px solid ${brand.color}40` }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt={brand.name}
                      className="max-h-9 max-w-9 object-contain"
                    />
                  ) : (
                    <ImagePlusIcon className="size-4 text-muted-foreground" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{brand.name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className="size-2.5 rounded-full border"
                      style={{ backgroundColor: brand.color }}
                    />
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {brand.color}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant={isEditing ? "secondary" : "ghost"}
                    onClick={() => openEdit(index)}
                    aria-label={`Edit ${brand.name}`}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteBrand(index)}
                    aria-label={`Delete ${brand.name}`}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
