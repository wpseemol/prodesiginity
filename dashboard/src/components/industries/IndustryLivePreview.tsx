import { useMemo, type ReactNode } from "react";
import { ArrowRightIcon, CheckIcon, GlobeIcon, TriangleAlertIcon, UsersIcon } from "lucide-react";
import { mediaUrl } from "@/config";
import { htmlToText } from "@/components/editor/SimpleEditor";
import { LivePreviewPanel, PreviewSpot } from "@/components/preview/PreviewKit";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setPreviewTab,
  toggleIssues,
  type IndustryDraft,
  type IndustryPreviewTab,
} from "@/lib/store/industryEditorSlice";
import { cn } from "@/lib/utils";
import {
  buildPayload,
  findIndustryIssues,
  inSentence,
  themeOf,
  type IndustryIssue,
  type IndustryPayload,
  type IndustrySpot,
} from "./industryDraft";
import { INDUSTRY_PATH, type ServiceOption } from "./industryTypes";

const TABS: { id: IndustryPreviewTab; label: string }[] = [
  { id: "page", label: "Industry page" },
  { id: "card", label: "Card" },
];

type Data = {
  draft: IndustryDraft;
  payload: IndustryPayload;
  issues: IndustryIssue[];
  serviceOptions: ServiceOption[];
  onEdit: (spot: IndustrySpot) => void;
};

function Placeholder({ children }: { children: ReactNode }) {
  return <span className="italic text-muted-foreground/70">{children}</span>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 text-sm font-bold">{children}</h3>;
}

function useSpot(issues: IndustryIssue[], onEdit: (spot: IndustrySpot) => void) {
  return (s: IndustrySpot, children: ReactNode, className?: string) => (
    <PreviewSpot spot={s} issues={issues} onEdit={onEdit} className={className}>
      {children}
    </PreviewSpot>
  );
}

function PagePreview({ draft, payload, issues, serviceOptions, onEdit }: Data) {
  const theme = themeOf(draft);
  const spot = useSpot(issues, onEdit);
  const label = inSentence(payload.title) || "your";
  const hero = mediaUrl(payload.heroImage);
  const linked = draft.services.map((slug) => ({ slug, option: serviceOptions.find((o) => o.slug === slug) }));

  return (
    <div className="@container grid gap-5">
      {spot(
        "slug",
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-2.5 py-1.5 text-[11px] text-muted-foreground">
          <GlobeIcon className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {INDUSTRY_PATH}/{payload.slug || <Placeholder>your-industry</Placeholder>}
          </span>
          {draft.published ? (
            <Badge className="h-4 px-1.5 text-[10px]">On website</Badge>
          ) : (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              Hidden
            </Badge>
          )}
        </div>,
      )}

      {/* Hero */}
      <div className="grid gap-3 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent p-4">
        <div className="grid gap-3 @md:grid-cols-[minmax(0,1fr)_9rem] @md:items-start">
          <div className="grid gap-2">
            {spot(
              "title",
              <span className="w-fit rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Industries · {payload.title || <Placeholder>Industry name</Placeholder>}
              </span>,
              "mx-0 w-fit",
            )}
            {spot(
              "headline",
              <h1 className="text-xl font-black leading-tight tracking-tight @md:text-2xl">
                {payload.headline || <Placeholder>Page heading</Placeholder>}
              </h1>,
            )}
            {spot(
              "tagline",
              <p className="text-sm text-muted-foreground">
                {payload.tagline || <Placeholder>Your one-line tagline appears here.</Placeholder>}
              </p>,
            )}
            <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
              Get a free {label} marketing plan
              <ArrowRightIcon className="size-3.5" />
            </span>
          </div>
          {spot(
            "hero",
            hero ? (
              <img
                src={hero}
                alt={payload.heroImageAlt ?? ""}
                className="aspect-[4/3] w-full rounded-xl border object-cover"
              />
            ) : (
              <div
                className={cn(
                  "flex aspect-[4/3] w-full items-center justify-center rounded-xl border",
                  theme.preview,
                )}
              >
                <ServiceIcon name={draft.icon} className="size-10" />
              </div>
            ),
            "mx-0",
          )}
        </div>

        {spot(
          "stats",
          draft.stats.length ? (
            <div className="grid grid-cols-1 gap-2 @sm:grid-cols-3">
              {draft.stats.map((s, i) => (
                <div key={i}>
                  {spot(
                    `stat-${i}`,
                    <div className="rounded-xl border bg-background/60 p-2">
                      <p className="text-base font-black">{s.value.trim() || <Placeholder>—</Placeholder>}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {s.label.trim() || <Placeholder>Label</Placeholder>}
                      </p>
                    </div>,
                    "mx-0",
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed p-2 text-center text-[11px] text-muted-foreground">
              No highlights — click to add some.
            </p>
          ),
        )}
      </div>

      {spot(
        "intro",
        <div>
          <SectionTitle>Marketing that understands the {label} business</SectionTitle>
          <div className="grid gap-2 text-sm leading-relaxed text-muted-foreground">
            {payload.intro.length ? (
              payload.intro.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <Placeholder>Your introduction paragraphs appear here.</Placeholder>
            )}
          </div>
        </div>,
      )}

      {spot(
        "audience",
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold">
            <UsersIcon className="size-4 text-primary" />
            Who we work with
          </p>
          {payload.audience.length ? (
            <ul className="grid gap-1.5 text-sm">
              {payload.audience.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {a}
                </li>
              ))}
            </ul>
          ) : (
            <Placeholder>List the types of businesses you serve.</Placeholder>
          )}
        </div>,
      )}

      {spot(
        "challenges",
        <div>
          <SectionTitle>What holds {label} businesses back online</SectionTitle>
          <div className="grid gap-2">
            {draft.challenges.map((c, i) => {
              const body = htmlToText(c.bodyHtml);
              return (
                <div key={i}>
                  {spot(
                    `challenge-${i}`,
                    <div className="flex gap-2.5 rounded-xl border bg-muted/20 p-2.5">
                      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {c.title.trim() || <Placeholder>Problem title</Placeholder>}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {body || <Placeholder>Describe the problem.</Placeholder>}
                        </span>
                      </span>
                    </div>,
                  )}
                </div>
              );
            })}
          </div>
        </div>,
      )}

      {spot(
        "solutions",
        <div>
          <SectionTitle>How we help {label} companies win more jobs</SectionTitle>
          <ol className="grid gap-2">
            {draft.solutions.map((s, i) => {
              const body = htmlToText(s.bodyHtml);
              return (
                <li key={i}>
                  {spot(
                    `solution-${i}`,
                    <div className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {s.title.trim() || <Placeholder>Point title</Placeholder>}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {body || <Placeholder>What you do and the result.</Placeholder>}
                        </span>
                      </span>
                    </div>,
                  )}
                </li>
              );
            })}
          </ol>
        </div>,
      )}

      {spot(
        "services",
        <div>
          <SectionTitle>Services for {label} businesses</SectionTitle>
          {linked.length ? (
            <div className="grid gap-1.5 @sm:grid-cols-2">
              {linked.map(({ slug, option }) => (
                <div
                  key={slug}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2 text-xs font-medium",
                    !option && "border-dashed text-muted-foreground line-through",
                  )}
                >
                  <ServiceIcon name={option?.icon ?? "Sparkles"} className="size-4 shrink-0 text-primary" />
                  <span className="truncate">{option?.title ?? slug}</span>
                  {option && !option.published ? (
                    <Badge variant="secondary" className="ml-auto h-4 px-1 text-[9px]">
                      hidden
                    </Badge>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground">
              No services linked — click to pick some.
            </p>
          )}
        </div>,
      )}

      {spot(
        "faqs",
        <div>
          <SectionTitle>{payload.title || "Industry"} marketing — common questions</SectionTitle>
          {draft.faqs.length ? (
            <div className="grid gap-2">
              {draft.faqs.map((f, i) => {
                const answer = htmlToText(f.aHtml);
                return (
                  <div key={i}>
                    {spot(
                      `faq-${i}`,
                      <div className="rounded-xl border bg-muted/20 p-2.5">
                        <p className="text-sm font-semibold">{f.q.trim() || <Placeholder>Question</Placeholder>}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {answer || <Placeholder>Answer</Placeholder>}
                        </p>
                      </div>,
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground">
              No questions yet — click to add one.
            </p>
          )}
        </div>,
      )}

      {spot(
        "cta",
        <div className="rounded-2xl border bg-gradient-to-br from-muted/60 to-transparent p-4 text-center">
          <p className="text-base font-black">
            {payload.ctaTitle || `Ready to grow your ${label} business?`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {payload.ctaBody ||
              "Book a free 30-minute call and we'll show you where your next jobs will come from."}
          </p>
        </div>,
      )}

      {spot(
        "seo",
        <div className="rounded-xl border bg-background p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">On Google</p>
          <p className="truncate text-[11px] text-emerald-700 dark:text-emerald-400">
            {INDUSTRY_PATH}/{payload.slug || "your-industry"}
          </p>
          <p className="truncate text-sm text-blue-700 dark:text-blue-400">{payload.seo.title}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {payload.seo.description || <Placeholder>Short description of the page.</Placeholder>}
          </p>
        </div>,
      )}
    </div>
  );
}

function CardPreview({ draft, payload, issues, onEdit }: Data) {
  const theme = themeOf(draft);
  const spot = useSpot(issues, onEdit);

  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted-foreground">
        Shown on the Industries page; the icon also appears in the website menu.
      </p>
      <div className="mx-auto flex w-full max-w-sm flex-col rounded-3xl border bg-card p-6 shadow-sm">
        {spot(
          "icon",
          <span className={cn("flex size-12 items-center justify-center rounded-2xl", theme.preview)}>
            <ServiceIcon name={draft.icon} className="size-6" />
          </span>,
          "mx-0 mb-3 w-fit",
        )}
        {spot(
          "title",
          <p className="text-lg font-black leading-tight">
            {payload.title || <Placeholder>Industry name</Placeholder>}
          </p>,
          "mb-1",
        )}
        {spot(
          "summary",
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {payload.summary || <Placeholder>Your short description will appear here.</Placeholder>}
          </p>,
        )}
        <div className="mt-5 border-t pt-4 text-[11px] font-bold uppercase tracking-widest text-primary">
          {payload.title || "Industry"} marketing
        </div>
      </div>
      {!draft.published ? (
        <PreviewSpot spot="status" issues={issues} onEdit={onEdit}>
          <p className="rounded-lg border border-dashed px-3 py-2 text-center text-xs text-muted-foreground">
            Hidden — visitors won't see this industry until you switch it on.
          </p>
        </PreviewSpot>
      ) : null}
    </div>
  );
}

/** Tabs + live preview of the industry. Click any part to jump to its field. */
export function IndustryLivePreview({
  draft,
  serviceOptions,
  onEdit,
  onJump,
  onExpand,
  onCollapse,
  className,
}: {
  draft: IndustryDraft;
  serviceOptions: ServiceOption[];
  onEdit: (spot: IndustrySpot) => void;
  onJump: (issue: IndustryIssue) => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.industryEditor.ui.previewTab);
  const issuesOpen = useAppSelector((s) => s.industryEditor.ui.issuesOpen);

  const data = useMemo(() => {
    const payload = buildPayload(draft);
    return { draft, payload, serviceOptions, issues: findIndustryIssues(draft, payload, serviceOptions) };
  }, [draft, serviceOptions]);

  return (
    <LivePreviewPanel
      issues={data.issues}
      tabs={TABS}
      tab={tab}
      onTabChange={(next) => dispatch(setPreviewTab(next))}
      issuesOpen={issuesOpen}
      onToggleIssues={() => dispatch(toggleIssues())}
      onJump={onJump}
      readyText="Nothing left to fix — the industry page looks ready."
      onExpand={onExpand}
      onCollapse={onCollapse}
      className={className}
    >
      {tab === "card" ? <CardPreview {...data} onEdit={onEdit} /> : <PagePreview {...data} onEdit={onEdit} />}
    </LivePreviewPanel>
  );
}
