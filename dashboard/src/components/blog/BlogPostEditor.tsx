import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  CheckIcon,
  CloudOffIcon,
  ExternalLinkIcon,
  HistoryIcon,
  Loader2Icon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { apiBaseUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import {
  blogDraftKey,
  clearLocalDraft,
  loadLocalDraft,
  saveLocalDraft,
  type LocalDraft,
} from "@/lib/blogDrafts";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IconPicker } from "@/components/ServiceIcon";
import { slugify } from "@/components/services/serviceTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BlockListEditor } from "./BlockListEditor";
import { BlogMediaInput } from "./BlogMediaInput";
import { findThreat, PublishChecklist, SECTION_IDS } from "./PublishChecklist";
import {
  ACCENT_SWATCH,
  BLOG_ACCENTS,
  blogPostFormSchema,
  blogPostUrl,
  emptyPostForm,
  formToPayload,
  postToForm,
  type BlogCategoryRow,
  type BlogPostFormValues,
  type BlogPostRow,
  type BylineMember,
  type ServiceOption,
} from "./blogTypes";

const MAX_RELATED_SERVICES = 6;

const AUTOSAVE_DELAY_MS = 1500;

type BlogPostEditorProps = {
  initial: BlogPostRow | null;
  categories: BlogCategoryRow[];
  isAdmin: boolean;
  userId: number;
  onCancel: () => void;
  onSaved: (post: BlogPostRow) => void;
  /** Re-open the article from the server (after someone else saved it). */
  onReload: () => void;
};

const timeOf = (ms: number) =>
  new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(ms);

function Optional() {
  return <span className="font-normal text-muted-foreground">(optional)</span>;
}

function CharCount({ value, max }: { value: string; max: number }) {
  const n = value.trim().length;
  return (
    <span className={cn("ml-auto text-xs tabular-nums", n > max ? "text-destructive" : "text-muted-foreground")}>
      {n}/{max}
    </span>
  );
}

export function BlogPostEditor({
  initial,
  categories,
  isAdmin,
  userId,
  onCancel,
  onSaved,
  onReload,
}: BlogPostEditorProps) {
  const isEdit = initial !== null;
  const draftKey = blogDraftKey(userId, initial?.id ?? null);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [serviceQuery, setServiceQuery] = useState("");
  const [members, setMembers] = useState<BylineMember[]>([]);
  const [localSavedAt, setLocalSavedAt] = useState<number | null>(null);
  const [pendingPublish, setPendingPublish] = useState<BlogPostFormValues | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [stale, setStale] = useState(false);
  const [sessionLost, setSessionLost] = useState(false);
  const [restorable, setRestorable] = useState<LocalDraft<BlogPostFormValues> | null>(() => {
    const draft = loadLocalDraft<BlogPostFormValues>(draftKey);
    if (!draft) return null;
    const current = initial ? postToForm(initial) : emptyPostForm();
    return JSON.stringify(draft.values) === JSON.stringify(current) ? null : draft;
  });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/services`);
        if (!res.ok) return;
        const data = (await res.json()) as { services?: ServiceOption[] };
        if (active) setServices(data.services ?? []);
      } catch {
        // related services stay empty; the rest of the form still works
      }
    })();
    if (isAdmin) {
      void (async () => {
        const res = await apiFetch("/manage/blog/byline-members");
        if (!res.ok) return;
        const data = (await res.json()) as { members?: BylineMember[] };
        if (active) setMembers(data.members ?? []);
      })();
    }
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: initial ? postToForm(initial) : emptyPostForm(),
    mode: "onTouched",
  });
  const faqs = useFieldArray({ control: form.control, name: "faqs" });
  const { isSubmitting, isDirty } = form.formState;

  const [status, icon, title, slug, excerpt, seoTitle, seoDescription] = useWatch({
    control: form.control,
    name: ["status", "icon", "title", "slug", "excerpt", "seoTitle", "seoDescription"],
  });

  // Back up edits on this device so a closed tab or expired login loses nothing.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = form.subscribe({
      formState: { values: true, isDirty: true },
      callback: ({ values, isDirty: dirty }) => {
        clearTimeout(timer);
        if (!dirty) return;
        timer = setTimeout(() => {
          if (saveLocalDraft(draftKey, values)) setLocalSavedAt(Date.now());
        }, AUTOSAVE_DELAY_MS);
      },
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [form, draftKey]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const save = async (values: BlogPostFormValues) => {
    setSessionLost(false);
    try {
      const res = await apiFetch(isEdit ? `/manage/blog/posts/${initial.id}` : "/manage/blog/posts", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify({
          ...formToPayload(values),
          ...(isEdit ? { expectedUpdatedAt: initial.updatedAt } : {}),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
        const message = data.message ?? "Could not save the article.";
        if (res.status === 401) {
          saveLocalDraft(draftKey, values);
          setSessionLost(true);
          return;
        }
        if (res.status === 409 && data.code === "STALE") {
          saveLocalDraft(draftKey, values);
          setStale(true);
          return;
        }
        if (res.status === 409) form.setError("slug", { message }, { shouldFocus: true });
        toast.error(message);
        return;
      }
      const data = (await res.json()) as { post: BlogPostRow };
      clearLocalDraft(draftKey);
      toast.success(
        values.status === "published"
          ? "Article saved and published. It will appear on the website."
          : "Draft saved. Only the dashboard can see it.",
      );
      onSaved(data.post);
    } catch {
      saveLocalDraft(draftKey, values);
      toast.error("Could not reach the server. Your changes are kept on this device.");
    }
  };

  const goesLive = (values: BlogPostFormValues) =>
    values.status === "published" && (!isEdit || initial.status !== "published");

  const onSubmit = form.handleSubmit(
    async (values) => {
      const threat = findThreat(values);
      if (threat) {
        toast.error(`${threat} contains code or SQL that is not allowed.`);
        return;
      }
      if (goesLive(values)) {
        setPendingPublish(values);
        return;
      }
      await save(values);
    },
    () => toast.error("Please fix the highlighted fields before saving."),
  );

  const submitRef = useRef(onSubmit);
  useEffect(() => {
    submitRef.current = onSubmit;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void submitRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const restoreDraft = () => {
    if (!restorable) return;
    form.reset(restorable.values, { keepDefaultValues: true });
    setSlugTouched(true);
    setRestorable(null);
    toast.success("Your unsaved changes were restored.");
  };

  const discardDraft = () => {
    clearLocalDraft(draftKey);
    setRestorable(null);
  };

  const back = () => (isDirty ? setConfirmLeave(true) : onCancel());
  const selectedCategory = (id: string) => categories.find((c) => String(c.id) === id)?.name;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <div className="sticky top-14 z-[5] -mx-4 -mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-background/90 px-4 py-2.5 backdrop-blur-md md:-mx-6 md:-mt-6 md:px-6">
        <Button type="button" variant="ghost" size="sm" onClick={back}>
          <ArrowLeftIcon />
          <span className="hidden sm:inline">All articles</span>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold sm:text-base">
              {title.trim() || (isEdit ? "Edit article" : "New article")}
            </h2>
            {status === "published" ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground" aria-live="polite">
            {isDirty ? (
              localSavedAt ? (
                <>
                  <HistoryIcon className="size-3" />
                  Unsaved changes · backed up on this device at {timeOf(localSavedAt)}
                </>
              ) : (
                "Unsaved changes"
              )
            ) : (
              <>
                <CheckIcon className="size-3" />
                {isEdit ? `All changes saved · ${timeOf(Date.parse(initial.updatedAt))}` : "Nothing written yet"}
              </>
            )}
          </p>
        </div>
        {isEdit && initial.status === "published" ? (
          <a
            href={blogPostUrl(initial.slug)}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <ExternalLinkIcon className="size-3.5" />
            View on website
          </a>
        ) : null}
        <Button type="submit" disabled={isSubmitting} title="Save (Ctrl+S)">
          {isSubmitting ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          {status === "published" ? (isEdit ? "Update article" : "Publish article") : "Save draft"}
          <kbd className="ml-1 hidden rounded border border-primary-foreground/30 px-1 text-[10px] font-normal opacity-80 lg:inline">
            Ctrl S
          </kbd>
        </Button>
      </div>

      {restorable ? (
        <Alert>
          <HistoryIcon />
          <AlertTitle>You have unsaved changes from {timeOf(restorable.savedAt)}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            <span>They were backed up on this device but never saved to the website.</span>
            <span className="flex gap-2">
              <Button type="button" size="sm" onClick={restoreDraft}>
                Restore them
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={discardDraft}>
                Discard
              </Button>
            </span>
          </AlertDescription>
        </Alert>
      ) : null}

      {stale ? (
        <Alert variant="destructive">
          <HistoryIcon />
          <AlertTitle>Someone else saved this article after you opened it</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            <span>
              Saving now would overwrite their changes. Your version is backed up on this device — reload to see
              theirs, then restore yours if you still need it.
            </span>
            <Button type="button" size="sm" variant="outline" onClick={onReload}>
              Reload latest version
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {sessionLost ? (
        <Alert variant="destructive">
          <CloudOffIcon />
          <AlertTitle>Your sign-in has expired</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            <span>
              Nothing is lost — your changes are backed up on this device. Sign in again in a new tab, then come back
              here and press Save.
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => window.open("/login", "_blank", "noopener")}
            >
              Sign in in a new tab
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid min-w-0 content-start gap-6">
          {/* ------------------------------------------------------- Basics */}
          <Card id={SECTION_IDS.basics} className="scroll-mt-32">
            <CardHeader>
              <CardTitle>Basics</CardTitle>
              <CardDescription>The title is the page’s H1 and the excerpt shows on cards.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="post-title">Title</FieldLabel>
                        <CharCount value={field.value} max={200} />
                      </div>
                      <Input
                        {...field}
                        id="post-title"
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. 3D product rendering vs photography"
                        onChange={(e) => {
                          field.onChange(e);
                          if (!slugTouched) {
                            form.setValue("slug", slugify(e.target.value, 160), { shouldDirty: true });
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
                      <FieldLabel htmlFor="post-slug">URL slug</FieldLabel>
                      <div className="flex items-center rounded-lg border focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 aria-invalid:border-destructive">
                        <span className="pl-2.5 text-sm text-muted-foreground">/blog/</span>
                        <input
                          {...field}
                          id="post-slug"
                          aria-invalid={fieldState.invalid}
                          className="h-8 min-w-0 flex-1 bg-transparent pr-2.5 text-sm outline-none"
                          onChange={(e) => {
                            setSlugTouched(true);
                            field.onChange(slugify(e.target.value, 160));
                          }}
                        />
                      </div>
                      <FieldDescription>Changing it after publishing breaks shared links.</FieldDescription>
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
                <Controller
                  name="excerpt"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="post-excerpt">Excerpt</FieldLabel>
                        <CharCount value={field.value} max={600} />
                      </div>
                      <Textarea {...field} id="post-excerpt" rows={3} aria-invalid={fieldState.invalid} />
                      <FieldDescription>Aim for 25–40 words that answer “what will I learn?”.</FieldDescription>
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          {/* -------------------------------------------------------- Media */}
          <Card id={SECTION_IDS.media} className="scroll-mt-32">
            <CardHeader>
              <CardTitle>Cover image &amp; video</CardTitle>
              <CardDescription>
                Both are optional. Without a cover, the category image or a generated cover is used.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid content-start gap-3">
                  <Controller
                    name="coverImage"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="post-cover">
                          Cover image <Optional />
                        </FieldLabel>
                        <BlogMediaInput
                          id="post-cover"
                          kind="image"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          invalid={fieldState.invalid}
                        />
                        <FieldDescription>1200×630 px works best for social sharing.</FieldDescription>
                        {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                      </Field>
                    )}
                  />
                  <Controller
                    name="coverAlt"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="post-cover-alt">Cover alt text</FieldLabel>
                        <Input {...field} id="post-cover-alt" aria-invalid={fieldState.invalid} />
                        {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  name="videoUrl"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="content-start">
                      <FieldLabel htmlFor="post-video">
                        Featured video <Optional />
                      </FieldLabel>
                      <BlogMediaInput
                        id="post-video"
                        kind="video"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        invalid={fieldState.invalid}
                      />
                      <FieldDescription>
                        Upload MP4/WebM/MOV (max 120 MB) or paste a YouTube / Vimeo link. Shown under the cover.
                      </FieldDescription>
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ------------------------------------------------------ Content */}
          <Card id={SECTION_IDS.content} className="scroll-mt-32">
            <CardHeader>
              <CardTitle>Article content</CardTitle>
              <CardDescription>
                Build the article from blocks. Text is stored as plain text, so formatting is safe for the
                website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlockListEditor form={form} />
            </CardContent>
          </Card>

          {/* ---------------------------------------------- Takeaways + FAQ */}
          <Card id={SECTION_IDS.summary} className="scroll-mt-32">
            <CardHeader>
              <CardTitle>Summary &amp; FAQ</CardTitle>
              <CardDescription>
                Key takeaways and FAQs are what search engines and AI assistants quote most.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="keyTakeaways"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="post-takeaways">
                        Key takeaways <Optional />
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id="post-takeaways"
                        rows={4}
                        aria-invalid={fieldState.invalid}
                        placeholder={"One sentence per line (up to 8)"}
                      />
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />

                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      FAQs <Optional />
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={faqs.fields.length >= 20}
                      onClick={() => faqs.append({ q: "", a: "" })}
                    >
                      <PlusIcon />
                      Add question
                    </Button>
                  </div>
                  {faqs.fields.map((faq, index) => (
                    <div key={faq.id} className="grid gap-3 rounded-xl border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Question {index + 1}</span>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Remove question"
                          className="text-destructive hover:text-destructive"
                          onClick={() => faqs.remove(index)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                      <Controller
                        name={`faqs.${index}.q`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Input {...field} aria-label="Question" placeholder="Question" aria-invalid={fieldState.invalid} />
                            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                          </Field>
                        )}
                      />
                      <Controller
                        name={`faqs.${index}.a`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Textarea {...field} rows={3} aria-label="Answer" placeholder="Answer" aria-invalid={fieldState.invalid} />
                            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                          </Field>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* --------------------------------------------------- Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Colour and icon used on cards and the generated cover.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="accent"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Colour</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {BLOG_ACCENTS.map((accent) => (
                          <button
                            key={accent}
                            type="button"
                            aria-pressed={field.value === accent}
                            onClick={() => field.onChange(accent)}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                              field.value === accent
                                ? "border-primary bg-primary/10"
                                : "hover:border-primary/40",
                            )}
                          >
                            <span className={cn("size-3 rounded-full", ACCENT_SWATCH[accent].swatch)} />
                            {ACCENT_SWATCH[accent].label}
                          </button>
                        ))}
                      </div>
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
                          <FieldLabel htmlFor="post-icon-toggle">
                            Custom icon <Optional />
                          </FieldLabel>
                          <FieldDescription>Off = use the category’s icon.</FieldDescription>
                        </FieldContent>
                        <Switch
                          id="post-icon-toggle"
                          checked={Boolean(field.value)}
                          onCheckedChange={(on) => field.onChange(on ? "Sparkles" : "")}
                        />
                      </Field>
                      {icon ? <IconPicker value={field.value} onChange={field.onChange} /> : null}
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        {/* ---------------------------------------------------------- Sidebar */}
        <div className="grid content-start gap-6">
          <PublishChecklist control={form.control} />

          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel htmlFor="post-status">Published</FieldLabel>
                        <FieldDescription>Off keeps it as a private draft.</FieldDescription>
                      </FieldContent>
                      <Switch
                        id="post-status"
                        checked={field.value === "published"}
                        onCheckedChange={(on) => field.onChange(on ? "published" : "draft")}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name="publishedAt"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="post-date">
                        Publish date <Optional />
                      </FieldLabel>
                      <Input {...field} id="post-date" type="date" aria-invalid={fieldState.invalid} />
                      <FieldDescription>Empty = today. A future date schedules it.</FieldDescription>
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
                {isAdmin ? (
                  <Controller
                    name="featured"
                    control={form.control}
                    render={({ field }) => (
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldLabel htmlFor="post-featured">Featured</FieldLabel>
                          <FieldDescription>Gets the large slot on /blog. Only one at a time.</FieldDescription>
                        </FieldContent>
                        <Switch id="post-featured" checked={field.value} onCheckedChange={field.onChange} />
                      </Field>
                    )}
                  />
                ) : null}
                {isAdmin ? (
                  <Controller
                    name="bylineMemberId"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="post-byline">
                          Byline <Optional />
                        </FieldLabel>
                        <Select
                          value={field.value || "author"}
                          onValueChange={(v) => field.onChange(!v || v === "author" ? "" : v)}
                        >
                          <SelectTrigger id="post-byline" className="w-full">
                            <SelectValue>
                              {members.find((m) => String(m.id) === field.value)?.name ??
                                "Article author"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="author">Article author</SelectItem>
                            {members.map((m) => (
                              <SelectItem key={m.id} value={String(m.id)}>
                                {m.name} — {m.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          Show a team member as the writer, e.g. someone without a dashboard login.
                        </FieldDescription>
                      </Field>
                    )}
                  />
                ) : null}
              </FieldGroup>
            </CardContent>
          </Card>

          <Card id={SECTION_IDS.category} className="scroll-mt-32">
            <CardHeader>
              <CardTitle>Category &amp; tags</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="post-category">Category</FieldLabel>
                      <Select value={field.value} onValueChange={(v) => field.onChange(v ?? "")}>
                        <SelectTrigger id="post-category" className="w-full" aria-invalid={fieldState.invalid}>
                          <SelectValue>{selectedCategory(field.value) ?? "Choose a category"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
                <Controller
                  name="tags"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="post-tags">
                        Tags <Optional />
                      </FieldLabel>
                      <Input {...field} id="post-tags" placeholder="3D, packaging, Shopify" aria-invalid={fieldState.invalid} />
                      <FieldDescription>Separate with commas.</FieldDescription>
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related services</CardTitle>
              <CardDescription>
                Linked under the article. Pick up to {MAX_RELATED_SERVICES}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="relatedServices"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    {services.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Loading services…</p>
                    ) : (
                      <>
                      <div className="relative">
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={serviceQuery}
                          onChange={(e) => setServiceQuery(e.target.value)}
                          placeholder="Find a service…"
                          aria-label="Find a service"
                          maxLength={60}
                          className="h-8 pl-8"
                        />
                      </div>
                      <div className="flex max-h-56 flex-wrap content-start gap-1.5 overflow-y-auto">
                        {[...services]
                          .filter(
                            (s) =>
                              field.value.includes(s.slug) ||
                              s.title.toLowerCase().includes(serviceQuery.trim().toLowerCase()),
                          )
                          .sort((a, b) => Number(field.value.includes(b.slug)) - Number(field.value.includes(a.slug)))
                          .map((s) => {
                          const selected = field.value.includes(s.slug);
                          const full = !selected && field.value.length >= MAX_RELATED_SERVICES;
                          return (
                            <button
                              key={s.slug}
                              type="button"
                              aria-pressed={selected}
                              disabled={full}
                              onClick={() =>
                                field.onChange(
                                  selected
                                    ? field.value.filter((v) => v !== s.slug)
                                    : [...field.value, s.slug],
                                )
                              }
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-40",
                                selected
                                  ? "border-primary bg-primary/10 font-medium text-primary"
                                  : "hover:border-primary/40",
                              )}
                            >
                              {selected ? <CheckIcon className="-ml-0.5 mr-0.5 inline size-3" /> : null}
                              {s.title}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {field.value.length}/{MAX_RELATED_SERVICES} selected
                      </p>
                      </>
                    )}
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <Card id={SECTION_IDS.seo} className="scroll-mt-32">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchIcon className="size-4" />
                SEO
              </CardTitle>
              <CardDescription>Leave empty to use the title and excerpt.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="rounded-lg border bg-background p-3">
                  <p className="truncate text-xs text-muted-foreground">yoursite.com › blog › {slug || "…"}</p>
                  <p className="line-clamp-1 text-sm font-medium text-blue-700 dark:text-blue-400">
                    {seoTitle || title || "Article title"}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {seoDescription || excerpt || "The excerpt will be used as the description."}
                  </p>
                </div>
                <Controller
                  name="seoTitle"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="post-seo-title">SEO title</FieldLabel>
                        <CharCount value={field.value} max={60} />
                      </div>
                      <Input {...field} id="post-seo-title" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
                <Controller
                  name="seoDescription"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="post-seo-description">Meta description</FieldLabel>
                        <CharCount value={field.value} max={160} />
                      </div>
                      <Textarea {...field} id="post-seo-description" rows={3} aria-invalid={fieldState.invalid} />
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
                <Controller
                  name="seoKeywords"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="post-seo-keywords">Keywords</FieldLabel>
                      <Input {...field} id="post-seo-keywords" placeholder="comma, separated" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Discard unsaved changes?"
        description="You have edits that are not saved yet."
        confirmLabel="Discard changes"
        onConfirm={() => {
          setConfirmLeave(false);
          clearLocalDraft(draftKey);
          onCancel();
        }}
      />

      <ConfirmDialog
        open={pendingPublish !== null}
        onOpenChange={(open) => {
          if (!open) setPendingPublish(null);
        }}
        title="Publish to the website?"
        description="Everyone visiting prodesignity.com will be able to read this article and search engines will index it. You can move it back to draft at any time."
        confirmLabel="Publish now"
        destructive={false}
        loading={publishing}
        onConfirm={async () => {
          const values = pendingPublish;
          if (!values) return;
          setPublishing(true);
          try {
            await save(values);
          } finally {
            setPublishing(false);
            setPendingPublish(null);
          }
        }}
      />
    </form>
  );
}
