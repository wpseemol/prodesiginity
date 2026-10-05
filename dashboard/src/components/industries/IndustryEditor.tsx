import { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CircleAlertIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { IMAGE_SPECS } from "@/lib/imageSpecs";
import { jumpToEdit } from "@/lib/jumpToEdit";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addFaq,
  addPoint,
  addStat,
  endSession,
  movePoint,
  removeFaq,
  removePoint,
  removeServices,
  removeStat,
  resetPreviewWidth,
  setField,
  setHeadline,
  setPreviewOpen,
  setPreviewWidth,
  setShowErrors,
  setSlug,
  setStep,
  setTitle,
  startSession,
  toggleService,
  togglePreview,
  updateFaq,
  updatePoint,
  updateStat,
  INDUSTRY_PREVIEW_WIDTH,
  MAX_INDUSTRY_STATS,
  type IndustryDraft,
  type IndustryPointDraft,
  type IndustryPointList,
  type IndustryStepId,
} from "@/lib/store/industryEditorSlice";
import { IconPicker, ServiceIcon } from "@/components/ServiceIcon";
import { SimpleEditor } from "@/components/editor/SimpleEditor";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MediaUploadField } from "@/components/homepage/MediaUploadField";
import { CollapsedPreviewRail, ResizeHandle } from "@/components/preview/PreviewKit";
import { Field, StepHeading } from "@/components/services/ServiceEditor";
import { COLOR_THEMES, readMessage, slugify } from "@/components/services/serviceTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  MAX_SERVICES,
  STEPS,
  STEP_FIELDS,
  buildPayload,
  challengeItemId,
  faqItemId,
  industrySpotTarget,
  makeDraft,
  solutionItemId,
  statItemId,
  validateIndustry,
  type IndustryEditTarget,
  type IndustrySpot,
} from "./industryDraft";
import { IndustryLivePreview } from "./IndustryLivePreview";
import { INDUSTRY_PATH, defaultHeadline, industryPageUrl, type IndustryRow, type ServiceOption } from "./industryTypes";

function PointListEditor({
  list,
  items,
  itemId,
  titlePlaceholder,
  bodyPlaceholder,
  addLabel,
}: {
  list: IndustryPointList;
  items: IndustryPointDraft[];
  itemId: (index: number) => string;
  titlePlaceholder: string;
  bodyPlaceholder: string;
  addLabel: string;
}) {
  const dispatch = useAppDispatch();

  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div
          key={index}
          id={itemId(index)}
          className="grid scroll-mt-24 gap-2 rounded-xl border bg-muted/10 p-3 transition-shadow"
        >
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{index + 1}</Badge>
            <Input
              value={item.title}
              placeholder={titlePlaceholder}
              onChange={(e) => dispatch(updatePoint({ list, index, title: e.target.value }))}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Move up"
              disabled={index === 0}
              onClick={() => dispatch(movePoint({ list, index, by: -1 }))}
            >
              <ArrowUpIcon />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Move down"
              disabled={index === items.length - 1}
              onClick={() => dispatch(movePoint({ list, index, by: 1 }))}
            >
              <ArrowDownIcon />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Remove item ${index + 1}`}
              disabled={items.length <= 1}
              onClick={() => dispatch(removePoint({ list, index }))}
            >
              <Trash2Icon />
            </Button>
          </div>
          <SimpleEditor
            value={item.bodyHtml}
            onChange={(html) => dispatch(updatePoint({ list, index, bodyHtml: html }))}
            placeholder={bodyPlaceholder}
            minHeight="64px"
          />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => dispatch(addPoint(list))}>
        <PlusIcon />
        {addLabel}
      </Button>
    </div>
  );
}

let sessionCounter = 0;

export function IndustryEditor({
  initial,
  serviceOptions,
  onCancel,
  onSaved,
}: {
  initial: IndustryRow | null;
  serviceOptions: ServiceOption[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isEdit = initial !== null;
  const dispatch = useAppDispatch();

  /* ---------------------------------------------------- Redux-held draft */
  const [session] = useState(() => `industry-editor-${++sessionCounter}`);
  const [initialDraft] = useState(() => makeDraft(initial));

  useLayoutEffect(() => {
    dispatch(startSession({ session, draft: initialDraft }));
    return () => {
      dispatch(endSession(session));
    };
  }, [dispatch, session, initialDraft]);

  const stored = useAppSelector((s) => s.industryEditor);
  const ours = stored.session === session && stored.draft !== null;
  const draft = ours && stored.draft ? stored.draft : initialDraft;
  const step: IndustryStepId = ours ? stored.step : "basics";
  const showErrors = ours && stored.showErrors;
  const ui = stored.ui;

  const set = <K extends keyof IndustryDraft>(key: K, value: IndustryDraft[K]) =>
    dispatch(setField({ key, value } as Parameters<typeof setField>[0]));

  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  /* ---------------------------------------------------- Live preview UI */
  const wideScreen = useMediaQuery("(min-width: 1280px)");
  const [previewSheet, setPreviewSheet] = useState(false);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const previewDraft = useDeferredValue(draft);

  /* ---------------------------------------------------- Derived values */
  const payload = useMemo(() => buildPayload(draft), [draft]);
  const [initialSnapshot] = useState(() => JSON.stringify(buildPayload(initialDraft)));
  const dirty = JSON.stringify(payload) !== initialSnapshot;
  const errors = useMemo(() => validateIndustry(payload), [payload]);
  const missingServices = draft.services.filter((s) => !serviceOptions.some((o) => o.slug === s));

  const stepHasErrors = (id: IndustryStepId) => STEP_FIELDS[id].some((field) => errors[field]);
  const err = (field: string) => (showErrors ? errors[field] : undefined);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const goTo = (index: number) => {
    const next = STEPS[index];
    if (next) {
      dispatch(setStep(next.id));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /** Opens the step that holds the field, then scrolls to and flashes it. */
  const jumpTo = (target: IndustryEditTarget) => {
    // A closing sheet hands focus back to its trigger, so wait for it.
    const delay = previewSheet ? 220 : target.step === step ? 0 : 80;
    setPreviewSheet(false);
    if (target.step !== step) dispatch(setStep(target.step));
    if (delay) window.setTimeout(() => jumpToEdit(target), delay);
    else jumpToEdit(target);
  };
  const editSpot = (spot: IndustrySpot) => jumpTo(industrySpotTarget(spot));

  const pickService = (slug: string) => {
    if (!draft.services.includes(slug) && draft.services.length >= MAX_SERVICES) {
      toast.info(`You can link up to ${MAX_SERVICES} services.`);
      return;
    }
    dispatch(toggleService(slug));
  };

  const handleSave = async () => {
    dispatch(setShowErrors(true));
    const firstBroken = STEPS.find((s) => stepHasErrors(s.id));
    if (firstBroken) {
      dispatch(setStep(firstBroken.id));
      toast.error(`Please finish “${firstBroken.title}” before saving.`);
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(isEdit ? `/admin/industries/${initial.id}` : "/admin/industries", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not save the industry."));
        return;
      }
      toast.success(
        draft.published
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

  const completedSteps = STEPS.filter((s) => !stepHasErrors(s.id)).length;
  const canSave = !saving && (!isEdit || dirty);

  const saveRef = useRef<() => void>(() => {});
  useEffect(() => {
    saveRef.current = () => {
      if (canSave) void handleSave();
    };
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!dirty || saving) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, saving]);

  const leave = () => (dirty ? setConfirmLeave(true) : onCancel());

  const previewWidth = dragWidth ?? ui.previewWidth;

  return (
    <div className="grid gap-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={leave}>
            <ArrowLeftIcon />
            All industries
          </Button>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <div className="grid gap-1">
            <p className="text-sm font-semibold">{isEdit ? `Editing “${initial.title}”` : "Add a new industry"}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${(completedSteps / STEPS.length) * 100}%` }}
                />
              </span>
              <span>
                {completedSteps} of {STEPS.length} sections complete ·{" "}
                {dirty ? (
                  <span className="font-medium text-amber-600 dark:text-amber-400">Unsaved changes</span>
                ) : (
                  "No changes yet"
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={wideScreen && ui.previewOpen ? "secondary" : "outline"}
            size="sm"
            aria-pressed={wideScreen ? ui.previewOpen : undefined}
            title={
              wideScreen
                ? ui.previewOpen
                  ? "Hide the live preview"
                  : "Show the live preview"
                : "Open the live preview"
            }
            onClick={() => (wideScreen ? dispatch(togglePreview()) : setPreviewSheet(true))}
          >
            <EyeIcon />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          {isEdit && initial.published ? (
            <a
              href={industryPageUrl(initial.slug)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ExternalLinkIcon className="size-4" />
              <span className="hidden sm:inline">View on website</span>
            </a>
          ) : null}
          <Button type="button" onClick={() => void handleSave()} disabled={!canSave} title="Save (Ctrl+S)">
            {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            {isEdit ? (dirty ? "Save changes" : "Saved") : "Save industry"}
          </Button>
        </div>
      </div>

      <div
        className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]"
        style={
          wideScreen
            ? {
                gridTemplateColumns: `200px minmax(0,1fr) ${ui.previewOpen ? `${previewWidth}px` : "2.75rem"}`,
              }
            : undefined
        }
      >
        {/* Steps */}
        <nav className="flex gap-2 self-start overflow-x-auto lg:sticky lg:top-[4.5rem] lg:flex-col lg:overflow-visible">
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
                  active ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted",
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
                  <span className="block text-xs text-muted-foreground">{s.hint}</span>
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
                text="The industry name appears in the website's Industries menu; the heading is the big title on its page."
              />
              <Field
                id="ind-field-title"
                label="Industry name"
                htmlFor="indTitle"
                required
                help="Short, as it should appear in the menu. Example: HVAC, Roofing, Pest Control"
                error={err("title")}
              >
                <Input
                  id="indTitle"
                  value={draft.title}
                  placeholder="e.g. HVAC"
                  onChange={(e) =>
                    dispatch(
                      setTitle({
                        title: e.target.value,
                        slug: slugify(e.target.value),
                        headline: defaultHeadline(e.target.value),
                      }),
                    )
                  }
                />
              </Field>
              <Field
                id="ind-field-headline"
                label="Page heading"
                htmlFor="indHeadline"
                required
                help="The main title on the page (and what Google reads first). Mention who you help."
                error={err("headline")}
              >
                <Input
                  id="indHeadline"
                  value={draft.headline}
                  placeholder="e.g. Websites & Marketing for HVAC Companies"
                  onChange={(e) => dispatch(setHeadline(e.target.value))}
                />
              </Field>
              <Field
                id="ind-field-tagline"
                label="Tagline"
                htmlFor="indTagline"
                required
                help="One sentence shown right under the heading."
                error={err("tagline")}
              >
                <Input
                  id="indTagline"
                  value={draft.tagline}
                  placeholder="e.g. Websites, local SEO and ads that keep your technicians booked."
                  onChange={(e) => set("tagline", e.target.value)}
                />
              </Field>
              <label
                id="ind-field-visibility"
                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-muted/20 p-4 transition-shadow"
              >
                <span className="flex items-start gap-3">
                  {draft.published ? (
                    <EyeIcon className="mt-0.5 size-5 text-emerald-600" />
                  ) : (
                    <EyeOffIcon className="mt-0.5 size-5 text-muted-foreground" />
                  )}
                  <span>
                    <span className="block text-sm font-medium">
                      {draft.published ? "Visible on the website" : "Hidden from the website"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Hidden industries disappear from the menu and their page.
                    </span>
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="size-5 accent-primary"
                  checked={draft.published}
                  onChange={(e) => set("published", e.target.checked)}
                />
              </label>
            </>
          )}

          {step === "card" && (
            <>
              <StepHeading
                title="Card look"
                text="The card on the Industries page and the icon in the menu. Watch the preview on the right."
              />
              <Field
                id="ind-field-summary"
                label="Short description"
                required
                help="One or two sentences. Also used as the Google description if you leave that blank."
                error={err("summary")}
              >
                <SimpleEditor
                  value={draft.summaryHtml}
                  onChange={(html) => set("summaryHtml", html)}
                  placeholder="e.g. Web design, local SEO and Google Ads for HVAC contractors…"
                  minHeight="88px"
                />
                <p
                  className={cn(
                    "text-right text-xs",
                    payload.summary.length > 200 ? "text-amber-600" : "text-muted-foreground",
                  )}
                >
                  {payload.summary.length} characters
                </p>
              </Field>
              <Field id="ind-field-color" label="Colour" required help="Accent colour for the icon and page.">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(COLOR_THEMES).map(([key, t]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set("themeKey", key)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        draft.themeKey === key
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
              <Field id="ind-field-icon" label="Icon" required help="Look in “Industries & Lifestyle” for trade icons.">
                <IconPicker value={draft.icon} onChange={(icon) => set("icon", icon)} />
              </Field>
            </>
          )}

          {step === "page" && (
            <>
              <StepHeading
                title="Page intro"
                text="The top of the industry page: picture, introduction, who it's for and a few highlights."
              />
              <div id="ind-field-hero" data-slot="field" className="grid scroll-mt-24 gap-3 rounded-lg transition-shadow">
                <MediaUploadField
                  label="Hero image (optional)"
                  value={draft.heroImage}
                  onChange={(url) => set("heroImage", url)}
                  spec={IMAGE_SPECS.industryHero}
                />
                {draft.heroImage ? (
                  <Field
                    label="Image description"
                    htmlFor="indHeroAlt"
                    help="Describe the photo for Google and screen readers. Example: HVAC technician servicing an outdoor AC unit"
                  >
                    <Input
                      id="indHeroAlt"
                      value={draft.heroImageAlt}
                      maxLength={255}
                      onChange={(e) => set("heroImageAlt", e.target.value)}
                    />
                  </Field>
                ) : (
                  <p className="-mt-1 text-xs text-muted-foreground">
                    Without an image the page shows a designed panel with the industry icon.
                  </p>
                )}
              </div>
              <Field
                id="ind-field-intro"
                label="Introduction"
                required
                help="Explain how customers in this industry buy, and how you help. Press Enter for a new paragraph."
                error={err("intro")}
              >
                <SimpleEditor
                  value={draft.introHtml}
                  onChange={(html) => set("introHtml", html)}
                  placeholder="Describe the industry and your approach in a few short paragraphs…"
                  minHeight="140px"
                />
              </Field>
              <Field
                id="ind-field-audience"
                label="Who you work with"
                help="Types of businesses in this industry, one per line. Example: Residential HVAC contractors"
              >
                <SimpleEditor
                  value={draft.audienceHtml}
                  onChange={(html) => set("audienceHtml", html)}
                  placeholder="e.g. Commercial mechanical contractors"
                  listMode
                  minHeight="110px"
                />
              </Field>
              <Field
                id="ind-field-stats"
                label="Highlights"
                help={`Up to ${MAX_INDUSTRY_STATS} short facts shown under the heading. Use real numbers where you can.`}
                error={err("stats")}
              >
                <div className="grid gap-2">
                  {draft.stats.map((stat, index) => (
                    <div
                      key={index}
                      id={statItemId(index)}
                      className="flex scroll-mt-24 items-center gap-2 rounded-lg transition-shadow"
                    >
                      <Input
                        value={stat.value}
                        className="w-32"
                        placeholder="e.g. 120+"
                        aria-label={`Highlight ${index + 1} number`}
                        onChange={(e) => dispatch(updateStat({ index, value: e.target.value }))}
                      />
                      <Input
                        value={stat.label}
                        placeholder="e.g. HVAC sites launched"
                        aria-label={`Highlight ${index + 1} label`}
                        onChange={(e) => dispatch(updateStat({ index, label: e.target.value }))}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove highlight ${index + 1}`}
                        onClick={() => dispatch(removeStat(index))}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    disabled={draft.stats.length >= MAX_INDUSTRY_STATS}
                    onClick={() => dispatch(addStat())}
                  >
                    <PlusIcon />
                    Add a highlight
                  </Button>
                </div>
              </Field>
            </>
          )}

          {step === "problems" && (
            <>
              <StepHeading
                title="Problems & how you help"
                text="Speak to the visitor's real pain points, then show how you solve them. This is what convinces them to call."
              />
              <Field
                id="ind-field-challenges"
                label="Problems they face"
                required
                help="Shown as “What holds these businesses back online”. Three works best."
                error={err("challenges")}
              >
                <PointListEditor
                  list="challenges"
                  items={draft.challenges}
                  itemId={challengeItemId}
                  titlePlaceholder="e.g. Feast-or-famine seasons"
                  bodyPlaceholder="Describe the problem in a sentence or two…"
                  addLabel="Add a problem"
                />
              </Field>
              <Field
                id="ind-field-solutions"
                label="How you help"
                required
                help="Shown as numbered points. Four to six works best."
                error={err("solutions")}
              >
                <PointListEditor
                  list="solutions"
                  items={draft.solutions}
                  itemId={solutionItemId}
                  titlePlaceholder="e.g. Local SEO & Google Maps"
                  bodyPlaceholder="What you do and the result for the client…"
                  addLabel="Add a point"
                />
              </Field>
            </>
          )}

          {step === "services" && (
            <>
              <StepHeading
                title="Services, FAQ & call to action"
                text="Link the services that matter for this industry, answer common questions and set the closing message."
              />
              <Field
                id="ind-field-services"
                label="Services for this industry"
                help={`Tap to add or remove (up to ${MAX_SERVICES}). They show in the order you pick them.`}
              >
                {serviceOptions.length === 0 ? (
                  <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No services found. Add services first.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map((option) => {
                      const position = draft.services.indexOf(option.slug);
                      const selected = position !== -1;
                      return (
                        <button
                          key={option.slug}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => pickService(option.slug)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40",
                            !option.published && "opacity-60",
                          )}
                        >
                          {selected ? (
                            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                              {position + 1}
                            </span>
                          ) : (
                            <ServiceIcon name={option.icon} className="size-3.5" />
                          )}
                          {option.title}
                          {!option.published ? " (hidden)" : ""}
                        </button>
                      );
                    })}
                  </div>
                )}
                {missingServices.length ? (
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-amber-600">
                    Some linked services no longer exist and will be skipped: {missingServices.join(", ")}
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => dispatch(removeServices(missingServices))}
                    >
                      Remove them
                    </Button>
                  </p>
                ) : null}
              </Field>

              <Field
                id="ind-field-faqs"
                label="Questions & answers"
                help="Questions business owners in this industry ask before hiring you."
                error={err("faqs")}
              >
                <div className="grid gap-3">
                  {draft.faqs.length === 0 ? (
                    <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                      No questions yet.
                    </p>
                  ) : null}
                  {draft.faqs.map((faq, index) => (
                    <div
                      key={index}
                      id={faqItemId(index)}
                      className="grid scroll-mt-24 gap-2 rounded-xl border bg-muted/10 p-3 transition-shadow"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          value={faq.q}
                          placeholder="Question, e.g. Do you run Local Services Ads?"
                          onChange={(e) => dispatch(updateFaq({ index, q: e.target.value }))}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Remove question ${index + 1}`}
                          onClick={() => dispatch(removeFaq(index))}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                      <SimpleEditor
                        value={faq.aHtml}
                        onChange={(html) => dispatch(updateFaq({ index, aHtml: html }))}
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
                    onClick={() => dispatch(addFaq())}
                  >
                    <PlusIcon />
                    Add a question
                  </Button>
                </div>
              </Field>

              <div
                id="ind-field-cta"
                data-slot="field"
                className="grid scroll-mt-24 gap-4 rounded-xl border bg-muted/10 p-4 transition-shadow"
              >
                <p className="text-sm font-medium">Closing call to action</p>
                <Field
                  label="Title"
                  htmlFor="indCtaTitle"
                  help={`Leave blank for “Ready to grow your ${draft.title.trim().toLowerCase() || "…"} business?”`}
                >
                  <Input
                    id="indCtaTitle"
                    value={draft.ctaTitle}
                    maxLength={200}
                    onChange={(e) => set("ctaTitle", e.target.value)}
                  />
                </Field>
                <Field label="Text" htmlFor="indCtaBody">
                  <textarea
                    id="indCtaBody"
                    rows={3}
                    value={draft.ctaBody}
                    maxLength={600}
                    onChange={(e) => set("ctaBody", e.target.value)}
                    className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </Field>
              </div>
            </>
          )}

          {step === "search" && (
            <>
              <StepHeading
                title="Google search (optional)"
                text="Control how this page appears in Google. Leave blank and we'll use the industry name and short description."
              />
              <div className="rounded-xl border bg-background p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Google preview
                </p>
                <p className="truncate text-xs text-emerald-700 dark:text-emerald-400">
                  {INDUSTRY_PATH}/{payload.slug || "your-industry"}
                </p>
                <p className="truncate text-base text-blue-700 dark:text-blue-400">
                  {payload.seo.title || "Industry name"}
                </p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {payload.seo.description || "Short description of the page."}
                </p>
              </div>
              <Field
                id="ind-field-seoTitle"
                label="Search title"
                htmlFor="indSeoTitle"
                help={`Leave blank to use “${draft.title.trim() || "Industry"} Website Design & Marketing”. Best under 60 characters.`}
              >
                <Input id="indSeoTitle" value={draft.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
              </Field>
              <Field
                id="ind-field-seoDescription"
                label="Search description"
                htmlFor="indSeoDesc"
                help="Leave blank to use the short description. Best under 160 characters."
              >
                <textarea
                  id="indSeoDesc"
                  rows={3}
                  value={draft.seoDescription}
                  maxLength={320}
                  onChange={(e) => set("seoDescription", e.target.value)}
                  className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>
              <Field
                id="ind-field-keywords"
                label="Keywords"
                htmlFor="indSeoKw"
                help="What business owners would search for, separated by commas."
              >
                <Input
                  id="indSeoKw"
                  value={draft.seoKeywords}
                  placeholder="e.g. hvac marketing, hvac website design"
                  onChange={(e) => set("seoKeywords", e.target.value)}
                />
              </Field>
              <Field
                id="ind-field-slug"
                label="Page address"
                htmlFor="indSlug"
                required
                help="Filled in automatically from the name. Changing it later breaks old links."
                error={err("slug")}
              >
                <div className="flex items-center overflow-hidden rounded-lg border">
                  <span className="hidden border-r bg-muted px-3 py-2 text-xs text-muted-foreground sm:block">
                    {INDUSTRY_PATH}/
                  </span>
                  <input
                    id="indSlug"
                    value={draft.slug}
                    onChange={(e) => dispatch(setSlug(slugify(e.target.value)))}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  />
                </div>
              </Field>
            </>
          )}

          {/* Step navigation */}
          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <Button type="button" variant="outline" disabled={stepIndex === 0} onClick={() => goTo(stepIndex - 1)}>
              <ArrowLeftIcon />
              Back
            </Button>
            {stepIndex < STEPS.length - 1 ? (
              <Button type="button" onClick={() => goTo(stepIndex + 1)}>
                Next: {STEPS[stepIndex + 1].title}
                <ArrowRightIcon />
              </Button>
            ) : (
              <Button type="button" onClick={() => void handleSave()} disabled={!canSave}>
                {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
                {isEdit ? (dirty ? "Save changes" : "Saved") : "Save industry"}
              </Button>
            )}
          </div>
        </div>

        {/* Live preview */}
        {wideScreen ? (
          <aside className="sticky top-[4.5rem] h-[calc(100vh-5.5rem)] self-start">
            {ui.previewOpen ? (
              <>
                <ResizeHandle
                  width={previewWidth}
                  min={INDUSTRY_PREVIEW_WIDTH.min}
                  max={INDUSTRY_PREVIEW_WIDTH.max}
                  dragging={dragWidth !== null}
                  onDrag={setDragWidth}
                  onCommit={(width) => dispatch(setPreviewWidth(width))}
                  onReset={() => dispatch(resetPreviewWidth())}
                />
                <IndustryLivePreview
                  draft={previewDraft}
                  serviceOptions={serviceOptions}
                  onEdit={editSpot}
                  onJump={jumpTo}
                  onExpand={() => setPreviewSheet(true)}
                  onCollapse={() => dispatch(setPreviewOpen(false))}
                  className="h-full"
                />
              </>
            ) : (
              <CollapsedPreviewRail onOpen={() => dispatch(setPreviewOpen(true))} />
            )}
          </aside>
        ) : null}
      </div>

      <Sheet open={previewSheet} onOpenChange={setPreviewSheet}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-xl" showCloseButton={false}>
          <SheetTitle className="sr-only">Live preview</SheetTitle>
          <IndustryLivePreview
            draft={previewDraft}
            serviceOptions={serviceOptions}
            onEdit={editSpot}
            onJump={jumpTo}
            onCollapse={() => setPreviewSheet(false)}
            className="h-full rounded-none border-0 shadow-none"
          />
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Leave without saving?"
        description="Your changes to this industry will be lost."
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
