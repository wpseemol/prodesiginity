import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
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
import { IMAGE_SPECS } from "@/lib/imageSpecs";
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
import { MediaUploadField } from "@/components/homepage/MediaUploadField";
import { Field, StepHeading } from "@/components/services/ServiceEditor";
import {
  COLOR_THEMES,
  DEFAULT_THEME,
  readMessage,
  slugify,
  themeKeyFor,
} from "@/components/services/serviceTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  INDUSTRY_PATH,
  defaultHeadline,
  type IndustryRow,
  type IndustryStat,
  type ServiceOption,
} from "./industryTypes";

type StepId = "basics" | "card" | "page" | "problems" | "services" | "search";

const STEPS: { id: StepId; title: string; hint: string }[] = [
  { id: "basics", title: "Basic info", hint: "Name and page heading" },
  { id: "card", title: "Card look", hint: "Icon, colour, short text" },
  { id: "page", title: "Page intro", hint: "Image, intro, audience" },
  { id: "problems", title: "Problems & help", hint: "Pain points, solutions" },
  { id: "services", title: "Services & FAQ", hint: "Linked services, CTA" },
  { id: "search", title: "Google search", hint: "Optional" },
];

type PointDraft = { title: string; bodyHtml: string };
type FaqDraft = { q: string; aHtml: string };

const EMPTY_LIST = "<ul><li><p></p></li></ul>";
const MAX_STATS = 6;
const MAX_SERVICES = 12;

const DEFAULT_STATS: IndustryStat[] = [
  { value: "24/7", label: "Online booking & quote capture" },
  { value: "3–5 wks", label: "Typical website launch" },
  { value: "1 team", label: "Web, SEO, ads & branding" },
];

function toPointDrafts(points: { title: string; body: string }[] | undefined) {
  return (points ?? []).map((p) => ({
    title: p.title,
    bodyHtml: textToHtml(p.body),
  }));
}

function PointListEditor({
  items,
  onChange,
  titlePlaceholder,
  bodyPlaceholder,
  addLabel,
}: {
  items: PointDraft[];
  onChange: (items: PointDraft[]) => void;
  titlePlaceholder: string;
  bodyPlaceholder: string;
  addLabel: string;
}) {
  const update = (index: number, patch: Partial<PointDraft>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const move = (index: number, by: number) => {
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-xl border bg-muted/10 p-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{index + 1}</Badge>
            <Input
              value={item.title}
              placeholder={titlePlaceholder}
              onChange={(e) => update(index, { title: e.target.value })}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Move up"
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              <ArrowUpIcon />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Move down"
              disabled={index === items.length - 1}
              onClick={() => move(index, 1)}
            >
              <ArrowDownIcon />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Remove item ${index + 1}`}
              disabled={items.length <= 1}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              <Trash2Icon />
            </Button>
          </div>
          <SimpleEditor
            value={item.bodyHtml}
            onChange={(html) => update(index, { bodyHtml: html })}
            placeholder={bodyPlaceholder}
            minHeight="64px"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => onChange([...items, { title: "", bodyHtml: "<p></p>" }])}
      >
        <PlusIcon />
        {addLabel}
      </Button>
    </div>
  );
}

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

  const [step, setStep] = useState<StepId>("basics");
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [headlineTouched, setHeadlineTouched] = useState(isEdit);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);

  const [icon, setIcon] = useState(initial?.icon ?? "Building2");
  const [themeKey, setThemeKey] = useState(
    initial ? themeKeyFor(initial.accent) : DEFAULT_THEME,
  );
  const [summaryHtml, setSummaryHtml] = useState(
    initial ? textToHtml(initial.summary) : "<p></p>",
  );

  const [heroImage, setHeroImage] = useState(initial?.heroImage ?? "");
  const [heroImageAlt, setHeroImageAlt] = useState(initial?.heroImageAlt ?? "");
  const [introHtml, setIntroHtml] = useState(
    initial ? paragraphsToHtml(initial.intro) : "<p></p>",
  );
  const [audienceHtml, setAudienceHtml] = useState(
    initial?.audience.length ? listToHtml(initial.audience) : EMPTY_LIST,
  );
  const [stats, setStats] = useState<IndustryStat[]>(
    initial ? initial.stats : DEFAULT_STATS,
  );

  const [challenges, setChallenges] = useState<PointDraft[]>(
    initial?.challenges.length
      ? toPointDrafts(initial.challenges)
      : [{ title: "", bodyHtml: "<p></p>" }],
  );
  const [solutions, setSolutions] = useState<PointDraft[]>(
    initial?.solutions.length
      ? toPointDrafts(initial.solutions)
      : [{ title: "", bodyHtml: "<p></p>" }],
  );

  const [services, setServices] = useState<string[]>(initial?.services ?? []);
  const [faqs, setFaqs] = useState<FaqDraft[]>(
    (initial?.faqs ?? []).map((f) => ({ q: f.q, aHtml: textToHtml(f.a) })),
  );
  const [ctaTitle, setCtaTitle] = useState(initial?.ctaTitle ?? "");
  const [ctaBody, setCtaBody] = useState(initial?.ctaBody ?? "");

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
  const effectiveHeadline = headline.trim() || defaultHeadline(title);

  const payload = useMemo(() => {
    const points = (list: PointDraft[]) =>
      list
        .map((p) => ({ title: p.title.trim(), body: htmlToText(p.bodyHtml) }))
        .filter((p) => p.title || p.body);
    return {
      title: title.trim(),
      headline: effectiveHeadline,
      slug: effectiveSlug,
      icon,
      tagline: tagline.trim(),
      summary,
      heroImage: heroImage.trim() || null,
      heroImageAlt: heroImageAlt.trim() || null,
      intro: htmlToParagraphs(introHtml),
      audience: htmlToList(audienceHtml),
      challenges: points(challenges),
      solutions: points(solutions),
      services,
      stats: stats
        .map((s) => ({ value: s.value.trim(), label: s.label.trim() }))
        .filter((s) => s.value || s.label),
      faqs: faqs
        .map((f) => ({ q: f.q.trim(), a: htmlToText(f.aHtml) }))
        .filter((f) => f.q || f.a),
      ctaTitle: ctaTitle.trim() || null,
      ctaBody: ctaBody.trim() || null,
      accent: theme.website,
      seo: {
        title: seoTitle.trim() || `${title.trim()} Website Design & Marketing`,
        description: seoDescription.trim() || summary.slice(0, 320),
        keywords: seoKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      },
      published,
    };
  }, [
    title,
    effectiveHeadline,
    effectiveSlug,
    icon,
    tagline,
    summary,
    heroImage,
    heroImageAlt,
    introHtml,
    audienceHtml,
    challenges,
    solutions,
    services,
    stats,
    faqs,
    ctaTitle,
    ctaBody,
    theme,
    seoTitle,
    seoDescription,
    seoKeywords,
    published,
  ]);

  const [initialSnapshot] = useState(() => JSON.stringify(payload));
  const dirty = JSON.stringify(payload) !== initialSnapshot;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (payload.title.length < 2) e.title = "Give the industry a name.";
    if (payload.headline.length < 2) e.headline = "Add a page heading.";
    if (payload.tagline.length < 2) e.tagline = "Add a one-line tagline.";
    if (payload.summary.length < 2) e.summary = "Write a short description.";
    if (!payload.intro.length) e.intro = "Write at least one paragraph.";
    if (payload.stats.some((s) => !s.value || !s.label))
      e.stats = "Every highlight needs both a number and a label (or remove it).";
    if (!payload.challenges.length) e.challenges = "Add at least one problem.";
    else if (payload.challenges.some((p) => !p.title || !p.body))
      e.challenges = "Every problem needs a title and a description.";
    if (!payload.solutions.length) e.solutions = "Add at least one way you help.";
    else if (payload.solutions.some((p) => !p.title || !p.body))
      e.solutions = "Every point needs a title and a description.";
    if (payload.faqs.some((f) => !f.q || !f.a))
      e.faqs = "Every question needs an answer (or remove it).";
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug) ||
      payload.slug.length < 2
    )
      e.slug = "Use lowercase letters, numbers and dashes only.";
    return e;
  }, [payload]);

  const stepFields: Record<StepId, string[]> = {
    basics: ["title", "headline", "tagline"],
    card: ["summary"],
    page: ["intro", "stats"],
    problems: ["challenges", "solutions"],
    services: ["faqs"],
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

  const toggleService = (serviceSlug: string) => {
    setServices((list) => {
      if (list.includes(serviceSlug))
        return list.filter((s) => s !== serviceSlug);
      if (list.length >= MAX_SERVICES) {
        toast.info(`You can link up to ${MAX_SERVICES} services.`);
        return list;
      }
      return [...list, serviceSlug];
    });
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
        isEdit ? `/admin/industries/${initial.id}` : "/admin/industries",
        {
          method: isEdit ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not save the industry."));
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
            All industries
          </Button>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <div>
            <p className="text-sm font-semibold">
              {isEdit ? `Editing “${initial.title}”` : "Add a new industry"}
            </p>
            <p className="text-xs text-muted-foreground">
              Step {stepIndex + 1} of {STEPS.length} ·{" "}
              {dirty ? "Unsaved changes" : "No changes yet"}
            </p>
          </div>
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          {isEdit ? "Save changes" : "Save industry"}
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
                text="The industry name appears in the website's Industries menu; the heading is the big title on its page."
              />
              <Field
                label="Industry name"
                htmlFor="indTitle"
                required
                help="Short, as it should appear in the menu. Example: HVAC, Roofing, Pest Control"
                error={err("title")}
              >
                <Input
                  id="indTitle"
                  value={title}
                  placeholder="e.g. HVAC"
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                    if (!headlineTouched)
                      setHeadline(defaultHeadline(e.target.value));
                  }}
                />
              </Field>
              <Field
                label="Page heading"
                htmlFor="indHeadline"
                required
                help="The main title on the page (and what Google reads first). Mention who you help."
                error={err("headline")}
              >
                <Input
                  id="indHeadline"
                  value={headline}
                  placeholder="e.g. Websites & Marketing for HVAC Companies"
                  onChange={(e) => {
                    setHeadlineTouched(true);
                    setHeadline(e.target.value);
                  }}
                />
              </Field>
              <Field
                label="Tagline"
                htmlFor="indTagline"
                required
                help="One sentence shown right under the heading."
                error={err("tagline")}
              >
                <Input
                  id="indTagline"
                  value={tagline}
                  placeholder="e.g. Websites, local SEO and ads that keep your technicians booked."
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
                      {published
                        ? "Visible on the website"
                        : "Hidden from the website"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Hidden industries disappear from the menu and their page.
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
                text="The card on the Industries page and the icon in the menu. Watch the preview on the right."
              />
              <Field
                label="Short description"
                required
                help="One or two sentences. Also used as the Google description if you leave that blank."
                error={err("summary")}
              >
                <SimpleEditor
                  value={summaryHtml}
                  onChange={setSummaryHtml}
                  placeholder="e.g. Web design, local SEO and Google Ads for HVAC contractors…"
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
              <Field label="Colour" required help="Accent colour for the icon and page.">
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
              <Field
                label="Icon"
                required
                help="Look in “Industries & Lifestyle” for trade icons."
              >
                <IconPicker value={icon} onChange={setIcon} />
              </Field>
            </>
          )}

          {step === "page" && (
            <>
              <StepHeading
                title="Page intro"
                text="The top of the industry page: picture, introduction, who it's for and a few highlights."
              />
              <MediaUploadField
                label="Hero image (optional)"
                value={heroImage}
                onChange={setHeroImage}
                spec={IMAGE_SPECS.industryHero}
              />
              {heroImage ? (
                <Field
                  label="Image description"
                  htmlFor="indHeroAlt"
                  help="Describe the photo for Google and screen readers. Example: HVAC technician servicing an outdoor AC unit"
                >
                  <Input
                    id="indHeroAlt"
                    value={heroImageAlt}
                    maxLength={255}
                    onChange={(e) => setHeroImageAlt(e.target.value)}
                  />
                </Field>
              ) : (
                <p className="-mt-2 text-xs text-muted-foreground">
                  Without an image the page shows a designed panel with the
                  industry icon.
                </p>
              )}
              <Field
                label="Introduction"
                required
                help="Explain how customers in this industry buy, and how you help. Press Enter for a new paragraph."
                error={err("intro")}
              >
                <SimpleEditor
                  value={introHtml}
                  onChange={setIntroHtml}
                  placeholder="Describe the industry and your approach in a few short paragraphs…"
                  minHeight="140px"
                />
              </Field>
              <Field
                label="Who you work with"
                help="Types of businesses in this industry, one per line. Example: Residential HVAC contractors"
              >
                <SimpleEditor
                  value={audienceHtml}
                  onChange={setAudienceHtml}
                  placeholder="e.g. Commercial mechanical contractors"
                  listMode
                  minHeight="110px"
                />
              </Field>
              <Field
                label="Highlights"
                help={`Up to ${MAX_STATS} short facts shown under the heading. Use real numbers where you can.`}
                error={err("stats")}
              >
                <div className="grid gap-2">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={stat.value}
                        className="w-32"
                        placeholder="e.g. 120+"
                        onChange={(e) => {
                          const next = [...stats];
                          next[index] = { ...stat, value: e.target.value };
                          setStats(next);
                        }}
                      />
                      <Input
                        value={stat.label}
                        placeholder="e.g. HVAC sites launched"
                        onChange={(e) => {
                          const next = [...stats];
                          next[index] = { ...stat, label: e.target.value };
                          setStats(next);
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove highlight ${index + 1}`}
                        onClick={() =>
                          setStats(stats.filter((_, i) => i !== index))
                        }
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
                    disabled={stats.length >= MAX_STATS}
                    onClick={() =>
                      setStats([...stats, { value: "", label: "" }])
                    }
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
                label="Problems they face"
                required
                help="Shown as “What holds these businesses back online”. Three works best."
                error={err("challenges")}
              >
                <PointListEditor
                  items={challenges}
                  onChange={setChallenges}
                  titlePlaceholder="e.g. Feast-or-famine seasons"
                  bodyPlaceholder="Describe the problem in a sentence or two…"
                  addLabel="Add a problem"
                />
              </Field>
              <Field
                label="How you help"
                required
                help="Shown as numbered points. Four to six works best."
                error={err("solutions")}
              >
                <PointListEditor
                  items={solutions}
                  onChange={setSolutions}
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
                      const position = services.indexOf(option.slug);
                      const selected = position !== -1;
                      return (
                        <button
                          key={option.slug}
                          type="button"
                          onClick={() => toggleService(option.slug)}
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
                {services.some(
                  (s) => !serviceOptions.some((o) => o.slug === s),
                ) ? (
                  <p className="text-xs text-amber-600">
                    Some linked services no longer exist and will be skipped:{" "}
                    {services
                      .filter((s) => !serviceOptions.some((o) => o.slug === s))
                      .join(", ")}
                  </p>
                ) : null}
              </Field>

              <Field
                label="Questions & answers"
                help="Questions business owners in this industry ask before hiring you."
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
                          placeholder="Question, e.g. Do you run Local Services Ads?"
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
                    onClick={() =>
                      setFaqs([...faqs, { q: "", aHtml: "<p></p>" }])
                    }
                  >
                    <PlusIcon />
                    Add a question
                  </Button>
                </div>
              </Field>

              <div className="grid gap-4 rounded-xl border bg-muted/10 p-4">
                <p className="text-sm font-medium">Closing call to action</p>
                <Field
                  label="Title"
                  htmlFor="indCtaTitle"
                  help={`Leave blank for “Ready to grow your ${title.trim().toLowerCase() || "…"} business?”`}
                >
                  <Input
                    id="indCtaTitle"
                    value={ctaTitle}
                    maxLength={200}
                    onChange={(e) => setCtaTitle(e.target.value)}
                  />
                </Field>
                <Field label="Text" htmlFor="indCtaBody">
                  <textarea
                    id="indCtaBody"
                    rows={3}
                    value={ctaBody}
                    maxLength={600}
                    onChange={(e) => setCtaBody(e.target.value)}
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
                  {INDUSTRY_PATH}/{effectiveSlug || "your-industry"}
                </p>
                <p className="truncate text-base text-blue-700 dark:text-blue-400">
                  {payload.seo.title || "Industry name"}
                </p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {payload.seo.description || "Short description of the page."}
                </p>
              </div>
              <Field
                label="Search title"
                htmlFor="indSeoTitle"
                help={`Leave blank to use “${title.trim() || "Industry"} Website Design & Marketing”. Best under 60 characters.`}
              >
                <Input
                  id="indSeoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </Field>
              <Field
                label="Search description"
                htmlFor="indSeoDesc"
                help="Leave blank to use the short description. Best under 160 characters."
              >
                <textarea
                  id="indSeoDesc"
                  rows={3}
                  value={seoDescription}
                  maxLength={320}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>
              <Field
                label="Keywords"
                htmlFor="indSeoKw"
                help="What business owners would search for, separated by commas."
              >
                <Input
                  id="indSeoKw"
                  value={seoKeywords}
                  placeholder="e.g. hvac marketing, hvac website design"
                  onChange={(e) => setSeoKeywords(e.target.value)}
                />
              </Field>
              <Field
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
                {isEdit ? "Save changes" : "Save industry"}
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
              {title || "Industry name"}
            </p>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {summary || "Your short description will appear here."}
            </p>
            <div className="mt-5 border-t pt-4 text-[11px] font-bold uppercase tracking-widest text-primary">
              {title || "Industry"} marketing
            </div>
          </div>
          <div className="grid gap-2 rounded-2xl border bg-muted/20 p-4 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Status</span>
              {published ? (
                <Badge>On website</Badge>
              ) : (
                <Badge variant="secondary">Hidden</Badge>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Linked services</span>
              <span className="font-medium">{services.length}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Questions</span>
              <span className="font-medium">{payload.faqs.length}</span>
            </div>
            <div className="flex items-start gap-2 pt-1 text-muted-foreground">
              <GlobeIcon className="mt-0.5 size-3.5 shrink-0" />
              <span className="break-all">
                {INDUSTRY_PATH}/{effectiveSlug || "…"}
              </span>
            </div>
          </div>
        </aside>
      </div>

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
