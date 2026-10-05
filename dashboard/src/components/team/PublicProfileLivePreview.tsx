import { useMemo, type ReactNode } from "react";
import { ArrowUpRightIcon, MailIcon, SparklesIcon } from "lucide-react";
import { LivePreviewPanel, PreviewSpot } from "@/components/preview/PreviewKit";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setPreviewTab,
  toggleIssues,
  type PublicProfileDraft,
  type PublicProfilePreviewTab,
} from "@/lib/store/publicProfileSlice";
import { initials } from "@/lib/accountImage";
import { cn } from "@/lib/utils";
import { AVATAR_SHAPES } from "./StaffProfileExtras";
import {
  bioParagraphs,
  findProfileIssues,
  firstName,
  resolvePreviewStyle,
  resolveShape,
  socialHandle,
  socialList,
  type PreviewStyle,
  type ProfileIssue,
  type ProfileSpot,
} from "./publicProfileDraft";

const TABS: { id: PublicProfilePreviewTab; label: string }[] = [
  { id: "profile", label: "Profile page" },
  { id: "card", label: "Team card" },
];

type Data = {
  draft: PublicProfileDraft;
  role: string;
  style: PreviewStyle;
  /** What the round avatar shows: avatar → photo. */
  avatarSrc?: string;
  issues: ProfileIssue[];
  onEdit: (spot: ProfileSpot) => void;
};

function Placeholder({ children }: { children: ReactNode }) {
  return <span className="italic text-muted-foreground/70">{children}</span>;
}

function Avatar({
  name,
  src,
  style,
  avatarShape,
  className,
}: {
  name: string;
  src?: string;
  style: PreviewStyle;
  avatarShape: string;
  className?: string;
}) {
  const shape = AVATAR_SHAPES.find((s) => s.key === resolveShape(avatarShape, style));
  const clipPath = shape?.clip;
  return (
    <span
      className={cn("relative inline-block shrink-0 bg-gradient-to-br p-[3px] shadow-lg", style.gradient, shape?.className, className)}
      style={{ clipPath }}
    >
      <span className={cn("block size-full overflow-hidden bg-muted", shape?.className)} style={{ clipPath }}>
        {src ? (
          <img src={src} alt="" className="size-full object-cover" />
        ) : (
          <span
            className={cn(
              "flex size-full items-center justify-center bg-gradient-to-br text-lg font-black text-white",
              style.gradient,
            )}
          >
            {initials(name) || "?"}
          </span>
        )}
      </span>
    </span>
  );
}

/** Brand-coloured link chips; the website shows real brand icons. */
function SocialChips({ draft, compact = false }: { draft: PublicProfileDraft; compact?: boolean }) {
  const socials = socialList(draft.extras.socials);
  if (!socials.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {socials.map((s) => (
        <span
          key={s.key}
          title={s.label}
          className={cn(
            "inline-flex items-center justify-center rounded-lg text-[10px] font-bold text-white shadow-sm",
            compact ? "size-6" : "h-7 px-2",
            !s.valid && "opacity-40 line-through",
          )}
          style={{ backgroundColor: s.color }}
        >
          {compact ? s.label.charAt(0) : s.label.replace(/ \(.*\)$/, "").replace(" / portfolio", "")}
        </span>
      ))}
    </span>
  );
}

function useSpot(issues: ProfileIssue[], onEdit: (spot: ProfileSpot) => void) {
  return (s: ProfileSpot, children: ReactNode, className?: string) => (
    <PreviewSpot spot={s} issues={issues} onEdit={onEdit} className={className}>
      {children}
    </PreviewSpot>
  );
}

function ProfilePreview({ draft, role, style, avatarSrc, issues, onEdit }: Data) {
  const spot = useSpot(issues, onEdit);
  const first = firstName(draft.name);
  const paragraphs = bioParagraphs(draft.description);
  const skills = draft.extras.skills.length ? draft.extras.skills : style.focus;
  const socials = socialList(draft.extras.socials);

  return (
    <div className="grid gap-5">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border">
        {spot("style", <div className={cn("h-20 bg-gradient-to-br", style.gradient)} />, "mx-0 rounded-none px-0 py-0")}
        <div className="-mt-10 grid gap-2 px-4 pb-4">
          {spot(
            "image",
            <Avatar name={draft.name} src={avatarSrc} style={style} avatarShape={draft.extras.avatarShape} className="size-20" />,
            "mx-0 w-fit",
          )}
          {spot(
            "name",
            <h1 className="text-xl font-black leading-tight tracking-tight">
              {draft.name.trim() || <Placeholder>Your name</Placeholder>}
            </h1>,
          )}
          {spot(
            "role",
            <p className={cn("text-xs font-bold uppercase tracking-wider", style.text)}>
              {role || <Placeholder>Designation</Placeholder>}
            </p>,
          )}
          {spot(
            "tagline",
            <p className="text-sm text-muted-foreground">
              {draft.tagline.trim() || <Placeholder>Your one-line tagline appears here.</Placeholder>}
            </p>,
          )}
          {spot("socials", socials.length ? <SocialChips draft={draft} compact /> : <Placeholder>No social links yet</Placeholder>)}
        </div>
      </div>

      {spot(
        "bio",
        <div>
          <h3 className="mb-2 text-sm font-bold">About {first}</h3>
          <div className="grid gap-2 text-sm leading-relaxed text-muted-foreground">
            {paragraphs.length ? (
              paragraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <Placeholder>
                Without a bio, visitors see a generic paragraph about {first} working at the studio.
              </Placeholder>
            )}
          </div>
        </div>,
      )}

      {spot(
        "skills",
        <div>
          <h3 className="mb-2 text-sm font-bold">What {first} works on</h3>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {skills.map((skill, i) => (
              <li key={skill} className="flex items-center gap-2 rounded-xl border bg-muted/20 p-2">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg border font-mono text-[10px] font-black",
                    style.chip,
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-xs font-semibold">{skill}</span>
              </li>
            ))}
          </ul>
          {!draft.extras.skills.length ? (
            <p className="mt-1.5 text-[11px] text-muted-foreground">Default skills for the “{style.label}” style.</p>
          ) : null}
        </div>,
      )}

      {spot(
        "socials",
        <div className="rounded-2xl border p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em]">Connect with {first}</p>
          {socials.length ? (
            <ul className="mt-2 grid gap-1.5">
              {socials.map((s) => (
                <li key={s.key}>
                  {spot(
                    `social-${s.key}`,
                    <span className="flex items-center gap-2.5">
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: s.color }}
                      >
                        {s.label.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold">{s.label}</span>
                        <span className={cn("block truncate text-[11px]", s.valid ? "text-muted-foreground" : "text-red-600")}>
                          {s.valid ? socialHandle(s.key, s.url) : `${s.url} — not a full link`}
                        </span>
                      </span>
                      <ArrowUpRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    </span>,
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              {first} has not linked any social accounts yet.
            </p>
          )}
        </div>,
      )}

      <div className={cn("rounded-2xl bg-gradient-to-br p-4 text-white", style.gradient)}>
        <p className="text-base font-black">Work with {first}</p>
        <p className="mt-0.5 text-xs text-white/85">Book a 30-minute call — scope, timeline and cost.</p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-900">
          <MailIcon className="size-3.5" />
          {style.cta}
        </span>
      </div>
    </div>
  );
}

function CardPreview({ draft, role, style, avatarSrc, issues, onEdit }: Data) {
  const spot = useSpot(issues, onEdit);
  const blurb = draft.tagline.trim() || draft.description.trim();

  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted-foreground">How you appear in the team grid on the Team page.</p>
      <article className="mx-auto flex w-full max-w-xs flex-col overflow-hidden rounded-3xl border bg-card shadow-md">
        {spot(
          "style",
          <div className={cn("relative h-24 bg-gradient-to-br", style.gradient)}>
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
              <SparklesIcon className="size-3" />
              {style.label}
            </span>
          </div>,
          "mx-0 rounded-none px-0 py-0",
        )}
        <div className="-mt-12 flex flex-col gap-1 px-5 pb-5">
          {spot(
            "image",
            <Avatar name={draft.name} src={avatarSrc} style={style} avatarShape={draft.extras.avatarShape} className="size-24" />,
            "mx-0 w-fit",
          )}
          {spot(
            "name",
            <p className="mt-2 text-lg font-black leading-tight">
              {draft.name.trim() || <Placeholder>Your name</Placeholder>}
            </p>,
          )}
          {spot("role", <p className={cn("text-xs font-bold uppercase tracking-wider", style.text)}>{role}</p>)}
          {spot(
            "tagline",
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {blurb || <Placeholder>Add a tagline or bio to show a line here.</Placeholder>}
            </p>,
          )}
          {spot("socials", <SocialChips draft={draft} compact />, "mt-3")}
        </div>
      </article>
    </div>
  );
}

/** Tabs + live preview of the public profile. Click any part to jump to its field. */
export function PublicProfileLivePreview({
  draft,
  role,
  isLead,
  avatarSrc,
  onEdit,
  onJump,
  onExpand,
  onCollapse,
  className,
}: {
  draft: PublicProfileDraft;
  role: string;
  isLead: boolean;
  avatarSrc?: string;
  onEdit: (spot: ProfileSpot) => void;
  onJump: (issue: ProfileIssue) => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.publicProfile.ui.previewTab);
  const issuesOpen = useAppSelector((s) => s.publicProfile.ui.issuesOpen);

  const data = useMemo(
    () => ({
      draft,
      role,
      avatarSrc,
      style: resolvePreviewStyle(draft.extras.profileStyle, role, isLead),
      issues: findProfileIssues(draft, Boolean(avatarSrc)),
    }),
    [draft, role, isLead, avatarSrc],
  );

  return (
    <LivePreviewPanel
      issues={data.issues}
      tabs={TABS}
      tab={tab}
      onTabChange={(next) => dispatch(setPreviewTab(next))}
      issuesOpen={issuesOpen}
      onToggleIssues={() => dispatch(toggleIssues())}
      onJump={onJump}
      readyText="Your profile looks complete."
      onExpand={onExpand}
      onCollapse={onCollapse}
      className={className}
    >
      {tab === "card" ? <CardPreview {...data} onEdit={onEdit} /> : <ProfilePreview {...data} onEdit={onEdit} />}
    </LivePreviewPanel>
  );
}
