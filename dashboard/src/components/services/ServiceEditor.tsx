import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  Loader2Icon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { IconPicker, ServiceIcon } from "@/components/ServiceIcon";
import {
  SimpleEditor,
  htmlToList,
  htmlToParagraphs,
  htmlToText,
  listToHtml,
  paragraphsToHtml,
  textToHtml,
} from "@/components/editor/SimpleEditor";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  COLOR_THEMES,
  DEFAULT_THEME,
  SERVICE_PATH,
  readMessage,
  slugify,
  themeKeyFor,
  type GroupRow,
  type ServiceRow,
} from "./serviceTypes";

type StepId = "basics" | "card" | "page" | "process" | "search";

const STEPS: { id: StepId; title: string; hint: string }[] = [
  { id: "basics", title: "Basic info", hint: "Name and category" },
  { id: "card", title: "Card look", hint: "Icon, colour, short text" },
  { id: "page", title: "Service page", hint: "What visitors read" },
  { id: "process", title: "Process & FAQ", hint: "How you work" },
  { id: "search", title: "Google search", hint: "Optional" },
];

type ProcessStep = { title: string; bodyHtml: string };
type FaqItem = { q: string; aHtml: string };

const EMPTY_LIST = "<ul><li><p></p></li></ul>";

function Field({
  label,
  htmlFor,
  required,
  help,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wide",
            required ? "text-primary" : "text-muted-foreground",
          )}
        >
          {required ? "Required" : "Optional"}
        </span>
      </div>
      {help ? <p className="text-xs text-muted-foreground">{help}</p> : null}
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs font-medium text-destructive">
          <CircleAlertIcon className="size-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StepHeading({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function ServiceEditor({
  groups,
  initial,
  onCancel,
  onSaved,
  onManageCategories,
}: {
  groups: GroupRow[];
  initial: ServiceRow | null;
  onCancel: () => void;
  onSaved: () => void;
  onManageCategories: () => void;
}) {
  const isEdit = initial !== null;

  const [step, setStep] = useState<StepId>("basics");
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [groupId, setGroupId] = useState(
    initial ? String(initial.groupId) : groups[0] ? String(groups[0].id) : "",
  );
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);

  const [icon, setIcon] = useState(initial?.icon ?? "Sparkles");
  const [themeKey, setThemeKey] = useState(
    initial ? themeKeyFor(initial.accent) : DEFAULT_THEME,
  );
  const [summaryHtml, setSummaryHtml] = useState(
    initial ? textToHtml(initial.summary) : "<p></p>",
  );

  const [introHtml, setIntroHtml] = useState(
    initial ? paragraphsToHtml(initial.intro) : "<p></p>",
  );
  const [deliverablesHtml, setDeliverablesHtml] = useState(
    initial ? listToHtml(initial.deliverables) : EMPTY_LIST,
  );
  const [idealForHtml, setIdealForHtml] = useState(
    initial ? listToHtml(initial.idealFor) : EMPTY_LIST,
  );
  const [timeline, setTimeline] = useState(initial?.timeline ?? "1–2 weeks");
  const [startingAt, setStartingAt] = useState(
    initial?.startingAt ?? "Custom quote",
  );

  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(
    initial?.process.length
      ? initial.process.map((s) => ({
          title: s.title,
          bodyHtml: textToHtml(s.body),
        }))
      : [
          { title: "Discovery call", bodyHtml: "<p></p>" },
          { title: "Delivery", bodyHtml: "<p></p>" },
        ],
  );
  const [faqs, setFaqs] = useState<FaqItem[]>(
    (initial?.faqs ?? []).map((f) => ({ q: f.q, aHtml: textToHtml(f.a) })),
  );

  const [seoTitle, setSeoTitle] = useState(initial?.seo?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initial?.seo?.description ?? "",
  );
  const [seoKeywords, setSeoKeywords] = useState(
    (initial?.seo?.keywords ?? []).join(", "),
  );

  const summary = htmlToText(summaryHtml);
  const theme = COLOR_THEMES[themeKey] ?? COLOR_THEMES[DEFAULT_THEME];
  const effectiveSlug = slug || slugify(title);
  const categoryName = groups.find((g) => String(g.id) === groupId)?.title;

  const payload = useMemo(
    () => ({
      title: title.trim(),
      slug: effectiveSlug,
      groupId: Number(groupId),
      icon,
      tagline: tagline.trim(),
      summary,
      intro: htmlToParagraphs(introHtml),
      deliverables: htmlToList(deliverablesHtml),
      idealFor: htmlToList(idealForHtml),
      process: processSteps
        .map((s) => ({ title: s.title.trim(), body: htmlToText(s.bodyHtml) }))
        .filter((s) => s.title || s.body),
      faqs: faqs
        .map((f) => ({ q: f.q.trim(), a: htmlToText(f.aHtml) }))
        .filter((f) => f.q || f.a),
      timeline: timeline.trim(),
      startingAt: startingAt.trim(),
      accent: theme.website,
      seo: {
        title: seoTitle.trim() || title.trim(),
        description: seoDescription.trim() || summary.slice(0, 320),
        keywords: seoKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      },
      published,
    }),
    [
      title,
      effectiveSlug,
      groupId,
      icon,
      tagline,
      summary,
      introHtml,
      deliverablesHtml,
      idealForHtml,
      processSteps,
      faqs,
      timeline,
      startingAt,
      theme,
      seoTitle,
      seoDescription,
      seoKeywords,
      published,
    ],
  );

  const [initialSnapshot] = useState(() => JSON.stringify(payload));
  const dirty = JSON.stringify(payload) !== initialSnapshot;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (payload.title.length < 2) e.title = "Give the service a name.";
    if (!groupId) e.groupId = "Choose which category it belongs to.";
    if (payload.tagline.length < 2) e.tagline = "Add a one-line tagline.";
    if (payload.summary.length < 2) e.summary = "Write a short description.";
    if (!payload.intro.length) e.intro = "Write at least one paragraph.";
    if (!payload.deliverables.length)
      e.deliverables = "List at least one thing the client gets.";
    if (!payload.idealFor.length)
      e.idealFor = "List at least one type of client.";
    if (!payload.timeline) e.timeline = "Add a typical timeline.";
    if (!payload.startingAt) e.startingAt = "Add a starting price.";
    if (!payload.process.length) e.process = "Add at least one step.";
    else if (payload.process.some((s) => !s.title || !s.body))
      e.process = "Every step needs both a title and a description.";
    if (payload.faqs.some((f) => !f.q || !f.a))
      e.faqs = "Every question needs an answer (or remove it).";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug) || payload.slug.length < 2)
      e.slug = "Use lowercase letters, numbers and dashes only.";
    return e;
  }, [payload, groupId]);

  const stepFields: Record<StepId, string[]> = {
    basics: ["title", "groupId", "tagline"],
    card: ["summary"],
    page: ["intro", "deliverables", "idealFor", "timeline", "startingAt"],
    process: ["process", "faqs"],
    search: ["slug"],
  };
  const stepHasErrors = (id: StepId) =>
    stepFields[id].some((field) => errors[field]);
  const err = (field: string) => (showErrors ? errors[field] : undefined);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const goTo = (index: number) => {
    const next = STEPS[index];
    if (next) {
      setStep(next.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSave = async () => {
    setShowErrors(true);
    const firstBroken = STEPS.find((s) => stepHasErrors(s.id));
    if (firstBroken) {
      setStep(firstBroken.id);
      toast.error(`Please finish “${firstBroken.title}” before saving.`);
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(
        isEdit ? `/admin/services/${initial.id}` : "/admin/services",
        {
          method: isEdit ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not save the service."));
        return;
      }
      toast.success(
        published
          ? `“${payload.title}” is saved and visible on the website.`
          : `“${payload.title}” is saved as hidden.`,
      );
      onSaved();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const leave = () => (dirty ? setConfirmLeave(true) : onCancel());

  return (
    <div className="grid gap-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={leave}>
            <ArrowLeftIcon />
            All services
          </Button>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <div>
            <p className="text-sm font-semibold">
              {isEdit ? `Editing “${initial.title}”` : "Add a new service"}
            </p>
            <p className="text-xs text-muted-foreground">
              Step {stepIndex + 1} of {STEPS.length} ·{" "}
              {dirty ? "Unsaved changes" : "No changes yet"}
            </p>
          </div>
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          {isEdit ? "Save changes" : "Save service"}
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
        {/* Steps */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {STEPS.map((s, index) => {
            const active = s.id === step;
            const broken = showErrors && stepHasErrors(s.id);
            const done = !stepHasErrors(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "flex min-w-44 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors lg:min-w-0",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-transparent hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    broken
                      ? "bg-destructive/15 text-destructive"
                      : done
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                  )}
                >
                  {broken ? (
                    <CircleAlertIcon className="size-4" />
                  ) : done ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span>
                  <span className="block text-sm font-medium">{s.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {s.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Current step */}
        <div className="grid content-start gap-5 rounded-2xl border bg-card p-5 shadow-sm">
          {step === "basics" && (
            <>
              <StepHeading
                title="Basic info"
                text="Start with the name visitors will see and where the service sits in the menu."
              />
              <Field
                label="Service name"
                htmlFor="svcTitle"
                required
                help="Shown as the card title, in the menu and as the page heading. Example: Shopify Store Design"
                error={err("title")}
              >
                <Input
                  id="svcTitle"
                  value={title}
                  placeholder="e.g. Shopify Store Design"
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                />
              </Field>
              <Field
                label="Category"
                required
                help="Services are grouped by category in the website menu."
                error={err("groupId")}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={groupId}
                    onValueChange={(value) => {
                      if (value) setGroupId(value);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-72">
                      <SelectValue placeholder="Choose a category">
                        {categoryName ?? "Choose a category"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={onManageCategories}
                  >
                    Need a new category?
                  </Button>
                </div>
              </Field>
              <Field
                label="Tagline"
                htmlFor="svcTagline"
                required
                help="One sentence shown right under the page heading."
                error={err("tagline")}
              >
                <Input
                  id="svcTagline"
                  value={tagline}
                  placeholder="e.g. Storefronts that turn visitors into customers."
                  onChange={(e) => setTagline(e.target.value)}
                />
              </Field>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-muted/20 p-4">
                <span className="flex items-start gap-3">
                  {published ? (
                    <EyeIcon className="mt-0.5 size-5 text-emerald-600" />
                  ) : (
                    <EyeOffIcon className="mt-0.5 size-5 text-muted-foreground" />
                  )}
                  <span>
                    <span className="block text-sm font-medium">
                      {published ? "Visible on the website" : "Hidden from the website"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Turn this off to keep working on it privately.
                    </span>
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="size-5 accent-primary"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
              </label>
            </>
          )}

          {step === "card" && (
            <>
              <StepHeading
                title="Card look"
                text="This is the small card shown on the homepage and the Services page. Watch the preview on the right."
              />
              <Field
                label="Short description"
                required
                help="One or two sentences. Keep it under about 160 characters."
                error={err("summary")}
              >
                <SimpleEditor
                  value={summaryHtml}
                  onChange={setSummaryHtml}
                  placeholder="e.g. Custom Shopify layouts and product pages built to convert."
                  minHeight="88px"
                />
                <p
                  className={cn(
                    "text-right text-xs",
                    summary.length > 200
                      ? "text-amber-600"
                      : "text-muted-foreground",
                  )}
                >
                  {summary.length} characters
                </p>
              </Field>
              <Field label="Colour" required help="Colour of the icon on the card.">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(COLOR_THEMES).map(([key, t]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setThemeKey(key)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        themeKey === key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      <span className={cn("size-3.5 rounded-full", t.swatch)} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Icon" required help="Pick the picture that best fits the service.">
                <IconPicker value={icon} onChange={setIcon} />
              </Field>
            </>
          )}

          {step === "page" && (
            <>
              <StepHeading
                title="Service page"
                text="The full page visitors see after clicking the card."
              />
              <Field
                label="Introduction"
                required
                help="Explain what the service is. Press Enter to start a new paragraph."
                error={err("intro")}
              >
                <SimpleEditor
                  value={introHtml}
                  onChange={setIntroHtml}
                  placeholder="Describe the service in a few short paragraphs…"
                  minHeight="140px"
                />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="What the client gets"
                  required
                  help="One item per line."
                  error={err("deliverables")}
                >
                  <SimpleEditor
                    value={deliverablesHtml}
                    onChange={setDeliverablesHtml}
                    placeholder="e.g. Custom homepage design"
                    listMode
                    minHeight="140px"
                  />
                </Field>
                <Field
                  label="Who it's for"
                  required
                  help="One type of client per line."
                  error={err("idealFor")}
                >
                  <SimpleEditor
                    value={idealForHtml}
                    onChange={setIdealForHtml}
                    placeholder="e.g. New Shopify brands"
                    listMode
                    minHeight="140px"
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="How long it usually takes"
                  htmlFor="svcTimeline"
                  required
                  help="Example: 2–4 weeks"
                  error={err("timeline")}
                >
                  <Input
                    id="svcTimeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                  />
                </Field>
                <Field
                  label="Starting price"
                  htmlFor="svcPrice"
                  required
                  help="Example: From $499, or Custom quote"
                  error={err("startingAt")}
                >
                  <Input
                    id="svcPrice"
                    value={startingAt}
                    onChange={(e) => setStartingAt(e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          {step === "process" && (
            <>
              <StepHeading
                title="Process & FAQ"
                text="Show visitors what happens after they hire you, and answer common questions."
              />
              <Field
                label="Work steps"
                required
                help="Shown in order as numbered steps on the page."
                error={err("process")}
              >
                <div className="grid gap-3">
                  {processSteps.map((s, index) => (
                    <div
                      key={index}
                      className="grid gap-2 rounded-xl border bg-muted/10 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Step {index + 1}</Badge>
                        <Input
                          value={s.title}
                          placeholder="Step name, e.g. Discovery call"
                          onChange={(e) => {
                            const next = [...processSteps];
                            next[index] = { ...s, title: e.target.value };
                            setProcessSteps(next);
                          }}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Remove step ${index + 1}`}
                          disabled={processSteps.length <= 1}
                          onClick={() =>
                            setProcessSteps(
                              processSteps.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                      <SimpleEditor
                        value={s.bodyHtml}
                        onChange={(html) => {
                          const next = [...processSteps];
                          next[index] = { ...s, bodyHtml: html };
                          setProcessSteps(next);
                        }}
                        placeholder="What happens in this step?"
                        minHeight="64px"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                      setProcessSteps([
                        ...processSteps,
                        { title: "", bodyHtml: "<p></p>" },
                      ])
                    }
                  >
                    <PlusIcon />
                    Add a step
                  </Button>
                </div>
              </Field>

              <Field
                label="Questions & answers"
                help="Common questions clients ask about this service."
                error={err("faqs")}
              >
                <div className="grid gap-3">
                  {faqs.length === 0 ? (
                    <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                      No questions yet.
                    </p>
                  ) : null}
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="grid gap-2 rounded-xl border bg-muted/10 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          value={faq.q}
                          placeholder="Question, e.g. Can I edit the store myself?"
                          onChange={(e) => {
                            const next = [...faqs];
                            next[index] = { ...faq, q: e.target.value };
                            setFaqs(next);
                          }}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Remove question ${index + 1}`}
                          onClick={() =>
                            setFaqs(faqs.filter((_, i) => i !== index))
                          }
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                      <SimpleEditor
                        value={faq.aHtml}
                        onChange={(html) => {
                          const next = [...faqs];
                          next[index] = { ...faq, aHtml: html };
                          setFaqs(next);
                        }}
                        placeholder="Answer…"
                        minHeight="64px"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => setFaqs([...faqs, { q: "", aHtml: "<p></p>" }])}
                  >
                    <PlusIcon />
                    Add a question
                  </Button>
                </div>
              </Field>
            </>
          )}

          {step === "search" && (
            <>
              <StepHeading
                title="Google search (optional)"
                text="Control how this page appears in Google. Leave blank and we'll use the service name and short description."
              />
              <div className="rounded-xl border bg-background p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Google preview
                </p>
                <p className="truncate text-xs text-emerald-700 dark:text-emerald-400">
                  {SERVICE_PATH}/{effectiveSlug || "your-service"}
                </p>
                <p className="truncate text-base text-blue-700 dark:text-blue-400">
                  {payload.seo.title || "Service name"}
                </p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {payload.seo.description || "Short description of the service."}
                </p>
              </div>
              <Field
                label="Search title"
                htmlFor="seoTitle"
                help={`Leave blank to use “${title || "the service name"}”. Best under 60 characters.`}
              >
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </Field>
              <Field
                label="Search description"
                htmlFor="seoDesc"
                help="Leave blank to use the short description. Best under 160 characters."
              >
                <textarea
                  id="seoDesc"
                  rows={3}
                  value={seoDescription}
                  maxLength={320}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>
              <Field
                label="Keywords"
                htmlFor="seoKw"
                help="Words people might search for, separated by commas."
              >
                <Input
                  id="seoKw"
                  value={seoKeywords}
                  placeholder="e.g. shopify design, store redesign"
                  onChange={(e) => setSeoKeywords(e.target.value)}
                />
              </Field>
              <Field
                label="Page address"
                htmlFor="svcSlug"
                required
                help="Filled in automatically from the name. Changing it later breaks old links."
                error={err("slug")}
              >
                <div className="flex items-center overflow-hidden rounded-lg border">
                  <span className="hidden border-r bg-muted px-3 py-2 text-xs text-muted-foreground sm:block">
                    {SERVICE_PATH}/
                  </span>
                  <input
                    id="svcSlug"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  />
                </div>
              </Field>
            </>
          )}

          {/* Step navigation */}
          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={stepIndex === 0}
              onClick={() => goTo(stepIndex - 1)}
            >
              <ArrowLeftIcon />
              Back
            </Button>
            {stepIndex < STEPS.length - 1 ? (
              <Button type="button" onClick={() => goTo(stepIndex + 1)}>
                Next: {STEPS[stepIndex + 1].title}
                <ArrowRightIcon />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
                {isEdit ? "Save changes" : "Save service"}
              </Button>
            )}
          </div>
        </div>

        {/* Live preview */}
        <aside className="grid content-start gap-3 lg:sticky lg:top-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Preview on the website
          </p>
          <div className="flex flex-col rounded-3xl border bg-card p-6 shadow-sm">
            <div
              className={cn(
                "mb-4 flex size-12 items-center justify-center rounded-2xl",
                theme.preview,
              )}
            >
              <ServiceIcon name={icon} className="size-6" />
            </div>
            <p className="mb-2 text-lg font-black leading-tight">
              {title || "Service name"}
            </p>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {summary || "Your short description will appear here."}
            </p>
            <div className="mt-5 flex items-center justify-between border-t pt-4 text-[11px] font-bold uppercase tracking-widest">
              <span className="text-muted-foreground">{timeline || "—"}</span>
              <span className="text-primary">Details</span>
            </div>
          </div>
          <div className="grid gap-2 rounded-2xl border bg-muted/20 p-4 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{categoryName ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Status</span>
              {published ? (
                <Badge>On website</Badge>
              ) : (
                <Badge variant="secondary">Hidden</Badge>
              )}
            </div>
            <div className="flex items-start gap-2 pt-1 text-muted-foreground">
              <GlobeIcon className="mt-0.5 size-3.5 shrink-0" />
              <span className="break-all">
                {SERVICE_PATH}/{effectiveSlug || "…"}
              </span>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Leave without saving?"
        description="Your changes to this service will be lost."
        confirmLabel="Leave without saving"
        cancelLabel="Keep editing"
        onConfirm={() => {
          setConfirmLeave(false);
          onCancel();
        }}
      />
    </div>
  );
}
