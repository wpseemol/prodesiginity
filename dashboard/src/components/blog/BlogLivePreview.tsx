import { useDeferredValue, useMemo, type MouseEvent, type ReactNode } from "react";
import { useWatch, type Control } from "react-hook-form";
import {
  ChevronDownIcon,
  ChevronsRightIcon,
  ClockIcon,
  EyeIcon,
  InfoIcon,
  ListChecksIcon,
  Maximize2Icon,
  MousePointerClickIcon,
  PlayIcon,
  TriangleAlertIcon,
  CircleCheckIcon,
} from "lucide-react";
import { mediaUrl } from "@/config";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setPreviewTab, toggleIssues, type BlogPreviewTab } from "@/lib/store/blogEditorUiSlice";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Button } from "@/components/ui/button";
import { countWords } from "./PublishChecklist";
import { findIssues, jumpToEdit, spotTarget, type Issue, type Spot } from "./blogIssues";
import {
  ACCENT_SWATCH,
  formatDate,
  splitList,
  type BlockFormValue,
  type BlogCategoryRow,
  type BlogPostFormValues,
  type BylineMember,
} from "./blogTypes";

const WORDS_PER_MINUTE = 220;

const TABS: { id: BlogPreviewTab; label: string }[] = [
  { id: "article", label: "Article" },
  { id: "card", label: "Blog card" },
];

type PreviewProps = {
  control: Control<BlogPostFormValues>;
  categories: BlogCategoryRow[];
  members: BylineMember[];
  authorName: string;
};

function youtubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com") || u.hostname.endsWith("youtube-nocookie.com")) {
      return u.searchParams.get("v") ?? u.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1] ?? null;
    }
  } catch {
    // not a URL yet
  }
  return null;
}

function VideoPreview({ src, title }: { src: string; title?: string }) {
  const id = youtubeId(src);
  if (!id && /\.(mp4|webm|mov)(?:\?.*)?$/i.test(src)) {
    return <video src={mediaUrl(src)} controls preload="metadata" className="w-full rounded-lg bg-black" />;
  }
  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-slate-900 text-white">
      {id ? (
        <img
          src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-70"
        />
      ) : null}
      <span className="relative flex size-11 items-center justify-center rounded-full bg-white/90 text-slate-900">
        <PlayIcon className="ml-0.5 size-5" />
      </span>
      {title ? (
        <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-[11px]">{title}</span>
      ) : null}
    </div>
  );
}

const CALLOUT_TONE = {
  info: { icon: InfoIcon, className: "border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-100" },
  warning: {
    icon: TriangleAlertIcon,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  },
  success: {
    icon: CircleCheckIcon,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
  },
} as const;

function Block({ block }: { block: BlockFormValue }) {
  switch (block.type) {
    case "heading":
      return block.text.trim() ? (
        <h2 className="mt-2 text-lg font-bold leading-snug">{block.text}</h2>
      ) : null;
    case "subheading":
      return block.text.trim() ? <h3 className="text-base font-semibold">{block.text}</h3> : null;
    case "paragraph":
      return block.text.trim() ? (
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{block.text}</p>
      ) : null;
    case "list": {
      const items = splitList(block.items, /\n/);
      if (!items.length) return null;
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          className={cn(
            "grid gap-1 pl-5 text-sm leading-relaxed text-foreground/85",
            block.ordered ? "list-decimal" : "list-disc",
          )}
        >
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      );
    }
    case "quote":
      return block.text.trim() ? (
        <blockquote className="border-l-4 border-primary/50 pl-3 text-sm italic text-foreground/80">
          “{block.text}”
          {block.attribution.trim() ? (
            <footer className="mt-1 text-xs not-italic text-muted-foreground">— {block.attribution}</footer>
          ) : null}
        </blockquote>
      ) : null;
    case "callout": {
      if (!block.text.trim()) return null;
      const tone = CALLOUT_TONE[block.tone] ?? CALLOUT_TONE.info;
      return (
        <div className={cn("flex gap-2 rounded-lg border p-3 text-sm", tone.className)}>
          <tone.icon className="mt-0.5 size-4 shrink-0" />
          <div>
            {block.title.trim() ? <p className="font-semibold">{block.title}</p> : null}
            <p className="whitespace-pre-line">{block.text}</p>
          </div>
        </div>
      );
    }
    case "image": {
      const src = mediaUrl(block.src.trim());
      if (!src) return null;
      return (
        <figure className="grid gap-1">
          <img src={src} alt={block.alt} className="w-full rounded-lg object-cover" />
          {block.caption.trim() ? (
            <figcaption className="text-center text-xs text-muted-foreground">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
    }
    case "video":
      if (!block.src.trim()) return null;
      return (
        <figure className="grid gap-1">
          <VideoPreview src={block.src.trim()} title={block.title} />
          {block.caption.trim() ? (
            <figcaption className="text-center text-xs text-muted-foreground">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
    case "divider":
      return <hr className="my-1 border-border" />;
    default:
      return (
        <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
          “{block.type}” block — shown on the website.
        </p>
      );
  }
}

function Cover({
  values,
  category,
  className,
}: {
  values: BlogPostFormValues;
  category?: BlogCategoryRow;
  className?: string;
}) {
  const cover = mediaUrl(values.coverImage.trim() || category?.imageUrl);
  const accent = ACCENT_SWATCH[values.accent] ?? ACCENT_SWATCH.indigo;
  return (
    <div className={cn("relative aspect-[1200/630] overflow-hidden rounded-xl", className)}>
      {cover ? (
        <img src={cover} alt={values.coverAlt} className="size-full object-cover" />
      ) : (
        <div className={cn("flex size-full items-center justify-center", accent.preview)}>
          <ServiceIcon name={values.icon || category?.icon || "FileText"} className="size-10" />
        </div>
      )}
    </div>
  );
}

type PreviewData = ReturnType<typeof usePreviewData>;

function usePreviewData({ control, categories, members, authorName }: PreviewProps) {
  const watched = useWatch({ control }) as BlogPostFormValues;
  const values = useDeferredValue(watched);
  const category = categories.find((c) => String(c.id) === values.categoryId);
  const byline = members.find((m) => String(m.id) === values.bylineMemberId)?.name ?? authorName;
  const minutes = Math.max(1, Math.round(countWords(values.body ?? []) / WORDS_PER_MINUTE));
  const date = values.publishedAt ? formatDate(values.publishedAt) : formatDate(new Date().toISOString());
  const issues = useMemo(() => findIssues(values), [values]);
  return { values, category, byline, minutes, date, issues };
}

function Marker({ issue, onClick }: { issue: Issue; onClick?: () => void }) {
  return (
    <span
      role={onClick ? "button" : undefined}
      onClick={onClick}
      title={`${issue.label} — ${issue.hint}`}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ring-2 ring-card",
        issue.required ? "bg-red-500" : "bg-amber-500",
      )}
    >
      {issue.number}
    </span>
  );
}

/**
 * A clickable region of the preview: click jumps to the matching field in the
 * editor. Issues pinned to this spot show as numbered markers and an outline.
 */
function PreviewSpot({
  spot,
  issues,
  children,
  className,
}: {
  spot: Spot;
  issues: Issue[];
  children: ReactNode;
  className?: string;
}) {
  const pinned = issues.filter((i) => i.spot === spot);
  const required = pinned.some((i) => i.required);
  const edit = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (e && (e.target as HTMLElement).closest("video, summary, a")) return;
    jumpToEdit(spotTarget(spot));
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={edit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          edit();
        }
      }}
      title="Click to edit"
      className={cn(
        "relative -mx-1.5 cursor-pointer rounded-lg px-1.5 py-1 outline-none transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/30 focus-visible:ring-2 focus-visible:ring-primary/50",
        pinned.length > 0 &&
          (required
            ? "bg-red-500/5 ring-1 ring-red-500/40"
            : "outline-1 outline-offset-0 outline-dashed outline-amber-500/60"),
        className,
      )}
    >
      {pinned.length ? (
        <span className="absolute -top-2 -right-1.5 z-10 flex gap-0.5">
          {pinned.map((issue) => (
            <Marker key={issue.number} issue={issue} />
          ))}
        </span>
      ) : null}
      {children}
    </div>
  );
}

function IssuesList({ issues }: { issues: Issue[] }) {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.blogEditorUi.issuesOpen);
  const required = issues.filter((i) => i.required).length;
  const suggested = issues.length - required;

  if (issues.length === 0) {
    return (
      <p className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
        <CircleCheckIcon className="size-4 shrink-0" />
        Nothing left to fix — the article looks ready.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "mb-4 rounded-xl border",
        required ? "border-red-500/30 bg-red-500/[0.03]" : "border-amber-500/30 bg-amber-500/[0.03]",
      )}
    >
      <button
        type="button"
        onClick={() => dispatch(toggleIssues())}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs"
      >
        <ListChecksIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 font-medium">
          {required ? `${required} to fix` : "Nothing required"}
          {suggested ? <span className="font-normal text-muted-foreground"> · {suggested} suggested</span> : null}
        </span>
        <ChevronDownIcon className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <ol className="grid gap-0.5 border-t px-1.5 py-1.5">
          {issues.map((issue) => (
            <li key={issue.number}>
              <button
                type="button"
                onClick={() => jumpToEdit(issue)}
                className="flex w-full items-start gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-muted"
              >
                <Marker issue={issue} />
                <span className="min-w-0">
                  <span className="block text-xs font-medium">
                    {issue.label}
                    {issue.required ? <span className="ml-1 font-normal text-red-600">required</span> : null}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">{issue.hint}</span>
                </span>
              </button>
            </li>
          ))}
          <li className="flex items-center gap-1.5 px-1.5 pt-1 text-[11px] text-muted-foreground">
            <MousePointerClickIcon className="size-3" />
            Click an item, a number or any part of the preview to edit it.
          </li>
        </ol>
      ) : null}
    </div>
  );
}

function ArticlePreview({ values, category, byline, minutes, date, issues }: PreviewData) {
  const takeaways = splitList(values.keyTakeaways ?? "", /\n/);
  const faqs = (values.faqs ?? []).filter((f) => f.q.trim() || f.a.trim());
  const body = values.body ?? [];

  return (
    <article className="grid gap-4">
      <div className="grid gap-2">
        <PreviewSpot spot="category" issues={issues} className="w-fit">
          <span
            className={cn(
              "block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              category ? "bg-primary/10 text-primary" : "border border-dashed text-muted-foreground",
            )}
          >
            {category?.name ?? "No category"}
          </span>
        </PreviewSpot>
        <PreviewSpot spot="title" issues={issues}>
          <h1 className={cn("text-xl font-black leading-tight", !values.title.trim() && "text-muted-foreground/60")}>
            {values.title.trim() || "Your article title"}
          </h1>
        </PreviewSpot>
        <PreviewSpot spot="excerpt" issues={issues}>
          <p className={cn("text-sm text-muted-foreground", !values.excerpt.trim() && "italic opacity-60")}>
            {values.excerpt.trim() || "The excerpt appears here, under the title."}
          </p>
        </PreviewSpot>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{byline}</span>
          <span>·</span>
          <span>{date}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3" />
            {minutes} min read
          </span>
        </p>
      </div>

      <PreviewSpot spot="cover" issues={issues} className="grid gap-3">
        <Cover values={values} category={category} />
        {values.videoUrl.trim() ? <VideoPreview src={values.videoUrl.trim()} /> : null}
      </PreviewSpot>

      {takeaways.length ? (
        <div className="rounded-xl border bg-muted/40 p-3">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Key takeaways</p>
          <ul className="grid list-disc gap-1 pl-5 text-sm">
            {takeaways.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <PreviewSpot spot="content" issues={issues} className="grid gap-3 py-2">
        {body.length === 0 ? (
          <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
            No content yet — click to add a block.
          </p>
        ) : null}
        {body.map((block, i) => {
          const spot = `block-${i}` as const;
          const empty = issues.some((issue) => issue.spot === spot);
          return (
            <PreviewSpot key={i} spot={spot} issues={issues}>
              {empty ? (
                <p className="py-1 text-xs italic text-muted-foreground">
                  Empty {block.type} block
                </p>
              ) : (
                <Block block={block} />
              )}
            </PreviewSpot>
          );
        })}
      </PreviewSpot>

      {faqs.length || issues.some((i) => i.spot === "faqs") ? (
        <PreviewSpot spot="faqs" issues={issues} className="grid gap-2 border-t pt-4">
          <h2 className="text-lg font-bold">Frequently asked questions</h2>
          {faqs.map((faq, i) => (
            <details key={i} className="rounded-lg border px-3 py-2 text-sm" open={i === 0}>
              <summary className="cursor-pointer font-medium">{faq.q || "Question"}</summary>
              <p className="mt-1.5 whitespace-pre-line text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </PreviewSpot>
      ) : null}

      {values.tags.trim() ? (
        <div className="flex flex-wrap gap-1.5">
          {splitList(values.tags, /,/).map((tag) => (
            <span key={tag} className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function CardPreview({ values, category, byline, minutes, date, issues }: PreviewData) {
  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted-foreground">How the article appears in the list on /blog.</p>
      <div className="rounded-2xl border bg-card p-1.5 shadow-sm">
        <PreviewSpot spot="cover" issues={issues} className="mx-0 px-0 py-0">
          <Cover values={values} category={category} />
        </PreviewSpot>
        <div className="grid gap-2 p-3">
          <PreviewSpot spot="category" issues={issues} className="w-fit">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-primary">
              {category?.name ?? "Category"}
              {values.featured ? (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-700 normal-case dark:text-amber-300">
                  Featured
                </span>
              ) : null}
            </div>
          </PreviewSpot>
          <PreviewSpot spot="title" issues={issues}>
            <p className="line-clamp-2 text-base font-bold leading-snug">
              {values.title.trim() || "Your article title"}
            </p>
          </PreviewSpot>
          <PreviewSpot spot="excerpt" issues={issues}>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {values.excerpt.trim() || "The excerpt appears here."}
            </p>
          </PreviewSpot>
          <p className="border-t pt-2 text-xs text-muted-foreground">
            {byline} · {date} · {minutes} min read
          </p>
        </div>
      </div>
    </div>
  );
}

/** Tabs + live preview body. `onExpand` / `onCollapse` add header buttons. */
export function BlogLivePreview({
  onExpand,
  onCollapse,
  className,
  ...props
}: PreviewProps & { onExpand?: () => void; onCollapse?: () => void; className?: string }) {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.blogEditorUi.previewTab);
  const data = usePreviewData(props);
  const required = data.issues.filter((i) => i.required).length;
  const suggested = data.issues.length - required;

  return (
    <div className={cn("flex min-h-0 flex-col rounded-2xl border bg-card shadow-sm", className)}>
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <EyeIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Live preview</span>
        {required ? (
          <span
            className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white"
            title={`${required} thing${required === 1 ? "" : "s"} to fix`}
          >
            {required}
          </span>
        ) : null}
        {suggested ? (
          <span
            className="rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white"
            title={`${suggested} suggestion${suggested === 1 ? "" : "s"}`}
          >
            {suggested}
          </span>
        ) : null}
        <span className="ml-auto flex items-center gap-0.5">
          {onExpand ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Open a larger preview"
              title="Open a larger preview"
              onClick={onExpand}
            >
              <Maximize2Icon />
            </Button>
          ) : null}
          {onCollapse ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Hide the preview"
              title="Hide the preview"
              onClick={onCollapse}
            >
              <ChevronsRightIcon />
            </Button>
          ) : null}
        </span>
      </div>
      <div className="flex gap-1 border-b bg-muted/30 p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => dispatch(setPreviewTab(t.id))}
            className={cn(
              "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-3">
        <IssuesList issues={data.issues} />
        {tab === "card" ? <CardPreview {...data} /> : <ArticlePreview {...data} />}
      </div>
    </div>
  );
}
