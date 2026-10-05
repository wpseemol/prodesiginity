import { useMemo, type ReactNode } from "react";
import { ArrowRightIcon, CheckIcon, ClockIcon, GlobeIcon, TagIcon, UsersIcon } from "lucide-react";
import { htmlToText } from "@/components/editor/SimpleEditor";
import { LivePreviewPanel, PreviewSpot } from "@/components/preview/PreviewKit";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setPreviewTab,
  toggleIssues,
  type ServiceDraft,
  type ServicePreviewTab,
} from "@/lib/store/serviceEditorSlice";
import { cn } from "@/lib/utils";
import { buildPayload, findServiceIssues, themeOf, type ServiceIssue, type ServiceSpot } from "./serviceDraft";
import { SERVICE_PATH, type GroupRow } from "./serviceTypes";

const TABS: { id: ServicePreviewTab; label: string }[] = [
  { id: "page", label: "Service page" },
  { id: "card", label: "Card" },
];

type Data = {
  draft: ServiceDraft;
  payload: ReturnType<typeof buildPayload>;
  issues: ServiceIssue[];
  category?: string;
  onEdit: (spot: ServiceSpot) => void;
};

function Placeholder({ children }: { children: ReactNode }) {
  return <span className="italic text-muted-foreground/70">{children}</span>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 text-sm font-bold">{children}</h3>;
}

function PagePreview({ draft, payload, issues, category, onEdit }: Data) {
  const theme = themeOf(draft);
  const spot = (s: ServiceSpot, children: ReactNode, className?: string) => (
    <PreviewSpot spot={s} issues={issues} onEdit={onEdit} className={className}>
      {children}
    </PreviewSpot>
  );

  return (
    <div className="@container grid gap-5">
      {spot(
        "slug",
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-2.5 py-1.5 text-[11px] text-muted-foreground">
          <GlobeIcon className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {SERVICE_PATH}/{payload.slug || <Placeholder>your-service</Placeholder>}
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
      <div className="grid gap-2 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent p-4">
        <div className="flex flex-wrap items-center gap-2">
          {spot(
            "icon",
            <span className={cn("flex size-10 items-center justify-center rounded-xl", theme.preview)}>
              <ServiceIcon name={draft.icon} className="size-5" />
            </span>,
            "mx-0 w-fit",
          )}
          {spot(
            "category",
            <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {category ?? <Placeholder>No category</Placeholder>}
            </span>,
            "mx-0 w-fit",
          )}
        </div>
        {spot(
          "title",
          <h1 className="text-xl font-black leading-tight tracking-tight @md:text-2xl">
            {payload.title || <Placeholder>Service name</Placeholder>}
          </h1>,
        )}
        {spot(
          "tagline",
          <p className="text-sm text-muted-foreground">
            {payload.tagline || <Placeholder>Your one-line tagline appears here.</Placeholder>}
          </p>,
        )}
        <div className="mt-1 grid grid-cols-2 gap-2">
          {spot(
            "timeline",
            <div className="rounded-xl border bg-background/60 p-2">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <ClockIcon className="size-3" />
                Timeline
              </p>
              <p className="text-sm font-semibold">{payload.timeline || <Placeholder>—</Placeholder>}</p>
            </div>,
            "mx-0",
          )}
          {spot(
            "startingAt",
            <div className="rounded-xl border bg-background/60 p-2">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <TagIcon className="size-3" />
                Starting at
              </p>
              <p className="text-sm font-semibold">{payload.startingAt || <Placeholder>—</Placeholder>}</p>
            </div>,
            "mx-0",
          )}
        </div>
        <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
          Get a quote
          <ArrowRightIcon className="size-3.5" />
        </span>
      </div>

      {spot(
        "intro",
        <div className="grid gap-2 text-sm leading-relaxed text-muted-foreground">
          {payload.intro.length ? (
            payload.intro.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <Placeholder>Your introduction paragraphs appear here.</Placeholder>
          )}
        </div>,
      )}

      <div className="grid gap-4 @md:grid-cols-2">
        {spot(
          "deliverables",
          <div>
            <SectionTitle>What you get</SectionTitle>
            {payload.deliverables.length ? (
              <ul className="grid gap-1.5 text-sm">
                {payload.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    {d}
                  </li>
                ))}
              </ul>
            ) : (
              <Placeholder>List what the client gets.</Placeholder>
            )}
          </div>,
        )}
        {spot(
          "idealFor",
          <div>
            <SectionTitle>Ideal for</SectionTitle>
            {payload.idealFor.length ? (
              <ul className="grid gap-1.5 text-sm">
                {payload.idealFor.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <UsersIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                    {d}
                  </li>
                ))}
              </ul>
            ) : (
              <Placeholder>Say who this service is for.</Placeholder>
            )}
          </div>,
        )}
      </div>

      {spot(
        "process",
        <div>
          <SectionTitle>How it works</SectionTitle>
          <ol className="grid gap-2">
            {draft.processSteps.map((s, i) => {
              const body = htmlToText(s.bodyHtml);
              return (
                <li key={i}>
                  {spot(
                    `process-${i}`,
                    <div className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {s.title.trim() || <Placeholder>Step name</Placeholder>}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {body || <Placeholder>What happens in this step?</Placeholder>}
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
        "faqs",
        <div>
          <SectionTitle>Questions & answers</SectionTitle>
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
        "seo",
        <div className="rounded-xl border bg-background p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            On Google
          </p>
          <p className="truncate text-[11px] text-emerald-700 dark:text-emerald-400">
            {SERVICE_PATH}/{payload.slug || "your-service"}
          </p>
          <p className="truncate text-sm text-blue-700 dark:text-blue-400">
            {payload.seo.title || <Placeholder>Service name</Placeholder>}
          </p>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {payload.seo.description || <Placeholder>Short description of the service.</Placeholder>}
          </p>
        </div>,
      )}
    </div>
  );
}

function CardPreview({ draft, payload, issues, category, onEdit }: Data) {
  const theme = themeOf(draft);
  const spot = (s: ServiceSpot, children: ReactNode, className?: string) => (
    <PreviewSpot spot={s} issues={issues} onEdit={onEdit} className={className}>
      {children}
    </PreviewSpot>
  );

  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted-foreground">
        Shown on the homepage and the Services page
        {category ? (
          <>
            {" "}
            under <span className="font-medium text-foreground">{category}</span>
          </>
        ) : null}
        .
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
            {payload.title || <Placeholder>Service name</Placeholder>}
          </p>,
          "mb-1",
        )}
        {spot(
          "summary",
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {payload.summary || <Placeholder>Your short description will appear here.</Placeholder>}
          </p>,
        )}
        <div className="mt-5 flex items-center justify-between border-t pt-4 text-[11px] font-bold uppercase tracking-widest">
          {spot("timeline", <span className="text-muted-foreground">{payload.timeline || "—"}</span>, "mx-0")}
          <span className="text-primary">Details</span>
        </div>
      </div>
      {!draft.published ? (
        <PreviewSpot spot="status" issues={issues} onEdit={onEdit}>
          <p className="rounded-lg border border-dashed px-3 py-2 text-center text-xs text-muted-foreground">
            Hidden — visitors won't see this card until you switch it on.
          </p>
        </PreviewSpot>
      ) : null}
    </div>
  );
}

/** Tabs + live preview of the service. Click any part to jump to its field. */
export function ServiceLivePreview({
  draft,
  groups,
  onEdit,
  onJump,
  onExpand,
  onCollapse,
  className,
}: {
  draft: ServiceDraft;
  groups: GroupRow[];
  onEdit: (spot: ServiceSpot) => void;
  onJump: (issue: ServiceIssue) => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.serviceEditor.ui.previewTab);
  const issuesOpen = useAppSelector((s) => s.serviceEditor.ui.issuesOpen);

  const data = useMemo(() => {
    const payload = buildPayload(draft);
    return {
      draft,
      payload,
      issues: findServiceIssues(draft, payload),
      category: groups.find((g) => String(g.id) === draft.groupId)?.title,
    };
  }, [draft, groups]);

  return (
    <LivePreviewPanel
      issues={data.issues}
      tabs={TABS}
      tab={tab}
      onTabChange={(next) => dispatch(setPreviewTab(next))}
      issuesOpen={issuesOpen}
      onToggleIssues={() => dispatch(toggleIssues())}
      onJump={onJump}
      readyText="Nothing left to fix — the service looks ready."
      onExpand={onExpand}
      onCollapse={onCollapse}
      className={className}
    >
      {tab === "card" ? <CardPreview {...data} onEdit={onEdit} /> : <PagePreview {...data} onEdit={onEdit} />}
    </LivePreviewPanel>
  );
}
