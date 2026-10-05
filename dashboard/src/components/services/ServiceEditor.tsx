import {
    useDeferredValue,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
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
import { jumpToEdit } from "@/lib/jumpToEdit";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
    addFaq,
    addProcessStep,
    endSession,
    removeFaq,
    removeProcessStep,
    resetPreviewWidth,
    setField,
    setPreviewOpen,
    setPreviewWidth,
    setShowErrors,
    setSlug,
    setStep,
    setTitle,
    startSession,
    togglePreview,
    updateFaq,
    updateProcessStep,
    SERVICE_PREVIEW_WIDTH,
    type ServiceDraft,
    type ServiceStepId,
} from "@/lib/store/serviceEditorSlice";
import { IconPicker } from "@/components/ServiceIcon";
import { SimpleEditor } from "@/components/editor/SimpleEditor";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
    CollapsedPreviewRail,
    ResizeHandle,
} from "@/components/preview/PreviewKit";
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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
    COLOR_THEMES,
    SERVICE_PATH,
    readMessage,
    servicePageUrl,
    slugify,
    type GroupRow,
    type ServiceRow,
} from "./serviceTypes";
import {
    STEPS,
    STEP_FIELDS,
    buildPayload,
    faqItemId,
    makeDraft,
    processStepId,
    serviceSpotTarget,
    validateService,
    type ServiceEditTarget,
    type ServiceSpot,
} from "./serviceDraft";
import { ServiceLivePreview } from "./ServiceLivePreview";

export function Field({
    id,
    label,
    htmlFor,
    required,
    help,
    error,
    children,
}: {
    /** Lets the live preview scroll to and highlight this field. */
    id?: string;
    label: string;
    htmlFor?: string;
    required?: boolean;
    help?: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div
            id={id}
            data-slot="field"
            className="grid scroll-mt-24 gap-1.5 rounded-lg transition-shadow"
        >
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
            {help ? (
                <p className="text-xs text-muted-foreground">{help}</p>
            ) : null}
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

export function StepHeading({ title, text }: { title: string; text: string }) {
    return (
        <div className="space-y-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{text}</p>
        </div>
    );
}

let sessionCounter = 0;

export function ServiceEditor({
    groups,
    initial,
    duplicate = false,
    defaultGroupId,
    onCancel,
    onSaved,
    onManageCategories,
}: {
    groups: GroupRow[];
    /** Service to edit, or the source when `duplicate` is set. */
    initial: ServiceRow | null;
    duplicate?: boolean;
    defaultGroupId?: number;
    onCancel: () => void;
    onSaved: (savedId?: number) => void;
    onManageCategories: () => void;
}) {
    const editing = duplicate ? null : initial;
    const isEdit = editing !== null;
    const dispatch = useAppDispatch();

    /* ---------------------------------------------------- Redux-held draft */
    const [session] = useState(() => `service-editor-${++sessionCounter}`);
    const [initialDraft] = useState(() =>
        makeDraft({ initial, duplicate, groups, defaultGroupId }),
    );

    useLayoutEffect(() => {
        dispatch(startSession({ session, draft: initialDraft }));
        return () => {
            dispatch(endSession(session));
        };
    }, [dispatch, session, initialDraft]);

    const stored = useAppSelector((s) => s.serviceEditor);
    const ours = stored.session === session && stored.draft !== null;
    const draft = ours && stored.draft ? stored.draft : initialDraft;
    const step: ServiceStepId = ours ? stored.step : "basics";
    const showErrors = ours && stored.showErrors;
    const ui = stored.ui;

    const set = <K extends keyof ServiceDraft>(
        key: K,
        value: ServiceDraft[K],
    ) => dispatch(setField({ key, value } as Parameters<typeof setField>[0]));

    const [saving, setSaving] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);

    /* ---------------------------------------------------- Live preview UI */
    const wideScreen = useMediaQuery("(min-width: 1280px)");
    const [previewSheet, setPreviewSheet] = useState(false);
    const [dragWidth, setDragWidth] = useState<number | null>(null);
    const previewDraft = useDeferredValue(draft);

    /* ---------------------------------------------------- Derived values */
    const payload = useMemo(() => buildPayload(draft), [draft]);
    const [initialSnapshot] = useState(() =>
        JSON.stringify(buildPayload(initialDraft)),
    );
    const dirty = JSON.stringify(payload) !== initialSnapshot;
    const errors = useMemo(() => validateService(payload), [payload]);
    const categoryName = groups.find(
        (g) => String(g.id) === draft.groupId,
    )?.title;

    const stepHasErrors = (id: ServiceStepId) =>
        STEP_FIELDS[id].some((field) => errors[field]);
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
    const jumpTo = (target: ServiceEditTarget) => {
        // A closing sheet hands focus back to its trigger, so wait for it.
        const delay = previewSheet ? 220 : target.step === step ? 0 : 80;
        setPreviewSheet(false);
        if (target.step !== step) dispatch(setStep(target.step));
        if (delay) window.setTimeout(() => jumpToEdit(target), delay);
        else jumpToEdit(target);
    };
    const editSpot = (spot: ServiceSpot) => jumpTo(serviceSpotTarget(spot));

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
            const res = await apiFetch(
                isEdit ? `/admin/services/${editing.id}` : "/admin/services",
                {
                    method: isEdit ? "PUT" : "POST",
                    body: JSON.stringify(payload),
                },
            );
            if (!res.ok) {
                toast.error(
                    await readMessage(res, "Could not save the service."),
                );
                return;
            }
            const data = (await res.json().catch(() => null)) as {
                service?: { id?: number };
            } | null;
            toast.success(
                draft.published
                    ? `“${payload.title}” is saved and visible on the website.`
                    : `“${payload.title}” is saved as hidden.`,
            );
            onSaved(data?.service?.id ?? editing?.id);
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
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={leave}
                    >
                        <ArrowLeftIcon />
                        All services
                    </Button>
                    <div className="hidden h-6 w-px bg-border sm:block" />
                    <div className="grid gap-1">
                        <p className="text-sm font-semibold">
                            {isEdit
                                ? `Editing “${editing.title}”`
                                : duplicate
                                  ? `Duplicating “${initial?.title ?? "service"}”`
                                  : "Add a new service"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                                <span
                                    className="block h-full rounded-full bg-emerald-500 transition-all"
                                    style={{
                                        width: `${(completedSteps / STEPS.length) * 100}%`,
                                    }}
                                />
                            </span>
                            <span>
                                {completedSteps} of {STEPS.length} sections
                                complete ·{" "}
                                {dirty ? (
                                    <span className="font-medium text-amber-600 dark:text-amber-400">
                                        Unsaved changes
                                    </span>
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
                        variant={
                            wideScreen && ui.previewOpen
                                ? "secondary"
                                : "outline"
                        }
                        size="sm"
                        aria-pressed={wideScreen ? ui.previewOpen : undefined}
                        title={
                            wideScreen
                                ? ui.previewOpen
                                    ? "Hide the live preview"
                                    : "Show the live preview"
                                : "Open the live preview"
                        }
                        onClick={() =>
                            wideScreen
                                ? dispatch(togglePreview())
                                : setPreviewSheet(true)
                        }
                    >
                        <EyeIcon />
                        <span className="hidden sm:inline">Preview</span>
                    </Button>
                    {isEdit && editing.published ? (
                        <a
                            href={servicePageUrl(editing.slug)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <ExternalLinkIcon className="size-4" />
                            <span className="hidden sm:inline">
                                View on website
                            </span>
                        </a>
                    ) : null}
                    <Button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={!canSave}
                        title="Save (Ctrl+S)"
                    >
                        {saving ? (
                            <Loader2Icon className="animate-spin" />
                        ) : (
                            <SaveIcon />
                        )}
                        {isEdit
                            ? dirty
                                ? "Save changes"
                                : "Saved"
                            : "Save service"}
                    </Button>
                </div>
            </div>

            {duplicate ? (
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300">
                    This is a copy. Change the name and page address, then save.
                    It starts hidden so it won't appear on the website until you
                    switch it on.
                </p>
            ) : null}

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
                <nav className="flex gap-2 self-start overflow-x-auto lg:sticky lg:top-18 lg:flex-col lg:overflow-visible">
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
                                    <span className="block text-sm font-medium">
                                        {s.title}
                                    </span>
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
                                id="svc-field-title"
                                label="Service name"
                                htmlFor="svcTitle"
                                required
                                help="Shown as the card title, in the menu and as the page heading. Example: Shopify Store Design"
                                error={err("title")}
                            >
                                <Input
                                    id="svcTitle"
                                    value={draft.title}
                                    placeholder="e.g. Shopify Store Design"
                                    onChange={(e) =>
                                        dispatch(
                                            setTitle({
                                                title: e.target.value,
                                                slug: slugify(e.target.value),
                                            }),
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                id="svc-field-category"
                                label="Category"
                                required
                                help="Services are grouped by category in the website menu."
                                error={err("groupId")}
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select
                                        value={draft.groupId}
                                        onValueChange={(value) => {
                                            if (value) set("groupId", value);
                                        }}
                                    >
                                        <SelectTrigger
                                            id="svcGroup"
                                            className="w-full sm:w-72"
                                        >
                                            <SelectValue placeholder="Choose a category">
                                                {categoryName ??
                                                    "Choose a category"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map((g) => (
                                                <SelectItem
                                                    key={g.id}
                                                    value={String(g.id)}
                                                >
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
                                id="svc-field-tagline"
                                label="Tagline"
                                htmlFor="svcTagline"
                                required
                                help="One sentence shown right under the page heading."
                                error={err("tagline")}
                            >
                                <Input
                                    id="svcTagline"
                                    value={draft.tagline}
                                    placeholder="e.g. Storefronts that turn visitors into customers."
                                    onChange={(e) =>
                                        set("tagline", e.target.value)
                                    }
                                />
                            </Field>
                            <label
                                id="svc-field-visibility"
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
                                            {draft.published
                                                ? "Visible on the website"
                                                : "Hidden from the website"}
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            Turn this off to keep working on it
                                            privately.
                                        </span>
                                    </span>
                                </span>
                                <input
                                    type="checkbox"
                                    className="size-5 accent-primary"
                                    checked={draft.published}
                                    onChange={(e) =>
                                        set("published", e.target.checked)
                                    }
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
                                id="svc-field-summary"
                                label="Short description"
                                required
                                help="One or two sentences. Keep it under about 160 characters."
                                error={err("summary")}
                            >
                                <SimpleEditor
                                    value={draft.summaryHtml}
                                    onChange={(html) =>
                                        set("summaryHtml", html)
                                    }
                                    placeholder="e.g. Custom Shopify layouts and product pages built to convert."
                                    minHeight="88px"
                                />
                                <p
                                    className={cn(
                                        "text-right text-xs",
                                        payload.summary.length > 160
                                            ? "text-amber-600"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {payload.summary.length} characters
                                </p>
                            </Field>
                            <Field
                                id="svc-field-color"
                                label="Colour"
                                required
                                help="Colour of the icon on the card."
                            >
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(COLOR_THEMES).map(
                                        ([key, t]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() =>
                                                    set("themeKey", key)
                                                }
                                                className={cn(
                                                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                                                    draft.themeKey === key
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border text-muted-foreground hover:border-primary/40",
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "size-3.5 rounded-full",
                                                        t.swatch,
                                                    )}
                                                />
                                                {t.label}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </Field>
                            <Field
                                id="svc-field-icon"
                                label="Icon"
                                required
                                help="Pick the picture that best fits the service."
                            >
                                <IconPicker
                                    value={draft.icon}
                                    onChange={(icon) => set("icon", icon)}
                                />
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
                                id="svc-field-intro"
                                label="Introduction"
                                required
                                help="Explain what the service is. Press Enter to start a new paragraph."
                                error={err("intro")}
                            >
                                <SimpleEditor
                                    value={draft.introHtml}
                                    onChange={(html) => set("introHtml", html)}
                                    placeholder="Describe the service in a few short paragraphs…"
                                    minHeight="140px"
                                />
                            </Field>
                            <div className="grid gap-5 md:grid-cols-2">
                                <Field
                                    id="svc-field-deliverables"
                                    label="What the client gets"
                                    required
                                    help="One item per line."
                                    error={err("deliverables")}
                                >
                                    <SimpleEditor
                                        value={draft.deliverablesHtml}
                                        onChange={(html) =>
                                            set("deliverablesHtml", html)
                                        }
                                        placeholder="e.g. Custom homepage design"
                                        listMode
                                        minHeight="140px"
                                    />
                                </Field>
                                <Field
                                    id="svc-field-idealFor"
                                    label="Who it's for"
                                    required
                                    help="One type of client per line."
                                    error={err("idealFor")}
                                >
                                    <SimpleEditor
                                        value={draft.idealForHtml}
                                        onChange={(html) =>
                                            set("idealForHtml", html)
                                        }
                                        placeholder="e.g. New Shopify brands"
                                        listMode
                                        minHeight="140px"
                                    />
                                </Field>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field
                                    id="svc-field-timeline"
                                    label="How long it usually takes"
                                    htmlFor="svcTimeline"
                                    required
                                    help="Example: 2–4 weeks"
                                    error={err("timeline")}
                                >
                                    <Input
                                        id="svcTimeline"
                                        value={draft.timeline}
                                        onChange={(e) =>
                                            set("timeline", e.target.value)
                                        }
                                    />
                                </Field>
                                <Field
                                    id="svc-field-startingAt"
                                    label="Starting price"
                                    htmlFor="svcPrice"
                                    required
                                    help="Example: From $499, or Custom quote"
                                    error={err("startingAt")}
                                >
                                    <Input
                                        id="svcPrice"
                                        value={draft.startingAt}
                                        onChange={(e) =>
                                            set("startingAt", e.target.value)
                                        }
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
                                id="svc-field-process"
                                label="Work steps"
                                required
                                help="Shown in order as numbered steps on the page."
                                error={err("process")}
                            >
                                <div className="grid gap-3">
                                    {draft.processSteps.map((s, index) => (
                                        <div
                                            key={index}
                                            id={processStepId(index)}
                                            className="grid scroll-mt-24 gap-2 rounded-xl border bg-muted/10 p-3 transition-shadow"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">
                                                    Step {index + 1}
                                                </Badge>
                                                <Input
                                                    value={s.title}
                                                    placeholder="Step name, e.g. Discovery call"
                                                    onChange={(e) =>
                                                        dispatch(
                                                            updateProcessStep({
                                                                index,
                                                                title: e.target
                                                                    .value,
                                                            }),
                                                        )
                                                    }
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    aria-label={`Remove step ${index + 1}`}
                                                    disabled={
                                                        draft.processSteps
                                                            .length <= 1
                                                    }
                                                    onClick={() =>
                                                        dispatch(
                                                            removeProcessStep(
                                                                index,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Trash2Icon />
                                                </Button>
                                            </div>
                                            <SimpleEditor
                                                value={s.bodyHtml}
                                                onChange={(html) =>
                                                    dispatch(
                                                        updateProcessStep({
                                                            index,
                                                            bodyHtml: html,
                                                        }),
                                                    )
                                                }
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
                                            dispatch(addProcessStep())
                                        }
                                    >
                                        <PlusIcon />
                                        Add a step
                                    </Button>
                                </div>
                            </Field>

                            <Field
                                id="svc-field-faqs"
                                label="Questions & answers"
                                help="Common questions clients ask about this service."
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
                                                    placeholder="Question, e.g. Can I edit the store myself?"
                                                    onChange={(e) =>
                                                        dispatch(
                                                            updateFaq({
                                                                index,
                                                                q: e.target
                                                                    .value,
                                                            }),
                                                        )
                                                    }
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    aria-label={`Remove question ${index + 1}`}
                                                    onClick={() =>
                                                        dispatch(
                                                            removeFaq(index),
                                                        )
                                                    }
                                                >
                                                    <Trash2Icon />
                                                </Button>
                                            </div>
                                            <SimpleEditor
                                                value={faq.aHtml}
                                                onChange={(html) =>
                                                    dispatch(
                                                        updateFaq({
                                                            index,
                                                            aHtml: html,
                                                        }),
                                                    )
                                                }
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
                                    {SERVICE_PATH}/
                                    {payload.slug || "your-service"}
                                </p>
                                <p className="truncate text-base text-blue-700 dark:text-blue-400">
                                    {payload.seo.title || "Service name"}
                                </p>
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                    {payload.seo.description ||
                                        "Short description of the service."}
                                </p>
                            </div>
                            <Field
                                id="svc-field-seoTitle"
                                label="Search title"
                                htmlFor="seoTitle"
                                help={`Leave blank to use “${draft.title || "the service name"}”. Best under 60 characters.`}
                            >
                                <Input
                                    id="seoTitle"
                                    value={draft.seoTitle}
                                    onChange={(e) =>
                                        set("seoTitle", e.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                id="svc-field-seoDescription"
                                label="Search description"
                                htmlFor="seoDesc"
                                help="Leave blank to use the short description. Best under 160 characters."
                            >
                                <textarea
                                    id="seoDesc"
                                    rows={3}
                                    value={draft.seoDescription}
                                    maxLength={320}
                                    onChange={(e) =>
                                        set("seoDescription", e.target.value)
                                    }
                                    className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                />
                            </Field>
                            <Field
                                id="svc-field-keywords"
                                label="Keywords"
                                htmlFor="seoKw"
                                help="Words people might search for, separated by commas."
                            >
                                <Input
                                    id="seoKw"
                                    value={draft.seoKeywords}
                                    placeholder="e.g. shopify design, store redesign"
                                    onChange={(e) =>
                                        set("seoKeywords", e.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                id="svc-field-slug"
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
                                        value={draft.slug}
                                        onChange={(e) =>
                                            dispatch(
                                                setSlug(
                                                    slugify(e.target.value),
                                                ),
                                            )
                                        }
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
                            <Button
                                type="button"
                                onClick={() => goTo(stepIndex + 1)}
                            >
                                Next: {STEPS[stepIndex + 1].title}
                                <ArrowRightIcon />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={() => void handleSave()}
                                disabled={!canSave}
                            >
                                {saving ? (
                                    <Loader2Icon className="animate-spin" />
                                ) : (
                                    <SaveIcon />
                                )}
                                {isEdit
                                    ? dirty
                                        ? "Save changes"
                                        : "Saved"
                                    : "Save service"}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Live preview */}
                {wideScreen ? (
                    <aside className="sticky top-18 h-[calc(100vh-5.5rem)] self-start">
                        {ui.previewOpen ? (
                            <>
                                <ResizeHandle
                                    width={previewWidth}
                                    min={SERVICE_PREVIEW_WIDTH.min}
                                    max={SERVICE_PREVIEW_WIDTH.max}
                                    dragging={dragWidth !== null}
                                    onDrag={setDragWidth}
                                    onCommit={(width) =>
                                        dispatch(setPreviewWidth(width))
                                    }
                                    onReset={() =>
                                        dispatch(resetPreviewWidth())
                                    }
                                />
                                <ServiceLivePreview
                                    draft={previewDraft}
                                    groups={groups}
                                    onEdit={editSpot}
                                    onJump={jumpTo}
                                    onExpand={() => setPreviewSheet(true)}
                                    onCollapse={() =>
                                        dispatch(setPreviewOpen(false))
                                    }
                                    className="h-full"
                                />
                            </>
                        ) : (
                            <CollapsedPreviewRail
                                onOpen={() => dispatch(setPreviewOpen(true))}
                            />
                        )}
                    </aside>
                ) : null}
            </div>

            <Sheet open={previewSheet} onOpenChange={setPreviewSheet}>
                <SheetContent
                    className="w-full gap-0 p-0 sm:max-w-xl"
                    showCloseButton={false}
                >
                    <SheetTitle className="sr-only">Live preview</SheetTitle>
                    <ServiceLivePreview
                        draft={previewDraft}
                        groups={groups}
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
