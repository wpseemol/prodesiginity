import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BriefcaseIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GlobeIcon,
  InboxIcon,
  Loader2Icon,
  MailIcon,
  MapPinIcon,
  MessageSquareIcon,
  PhoneIcon,
  RefreshCwIcon,
  SaveIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { DEFAULT_SITE_SETTINGS } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { DashboardUser } from "@/lib/session";

const STATUSES = [
  "new",
  "reviewing",
  "shortlisted",
  "interview",
  "offered",
  "hired",
  "rejected",
] as const;
type ApplicationStatus = (typeof STATUSES)[number];

const STATUS_META: Record<ApplicationStatus, { label: string; className: string }> = {
  new: { label: "New", className: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  reviewing: {
    label: "Reviewing",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  shortlisted: {
    label: "Shortlisted",
    className: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  interview: {
    label: "Interview",
    className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
  offered: { label: "Offered", className: "border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300" },
  hired: {
    label: "Hired",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  rejected: { label: "Rejected", className: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300" },
};

type ApplicationRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  jobTitle: string;
  experience: string;
  status: ApplicationStatus;
  rating: number | null;
  readAt: string | null;
  createdAt: string;
  replyCount: number;
};

type ApplicationReply = {
  id: number;
  subject: string;
  body: string;
  status: "sent" | "failed";
  provider: string | null;
  error: string | null;
  createdAt: string;
  sentBy: { fullName: string } | null;
};

type ApplicationDetail = Omit<ApplicationRow, "replyCount"> & {
  portfolioUrl: string | null;
  coverLetter: string | null;
  resumeName: string;
  resumeMime: string;
  resumeSize: number;
  notes: string | null;
  updatedAt: string;
  replies: ApplicationReply[];
};

type ListResponse = {
  applications: ApplicationRow[];
  total: number;
  page: number;
  pageSize: number;
  unread: number;
  counts: Partial<Record<ApplicationStatus, number>>;
};

type MailStatus = { ready: boolean; problem: string | null; provider: string };

const PAGE_SIZE = 20;

function reference(id: number) {
  return `PD-${String(id).padStart(5, "0")}`;
}

function formatDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

async function errorMessage(res: Response, fallback: string) {
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  return data.message || fallback;
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.new;
  return (
    <Badge variant="outline" className={cn("font-medium", meta.className)}>
      {meta.label}
    </Badge>
  );
}

function RatingStars({
  value,
  onChange,
  size = "md",
}: {
  value: number | null;
  onChange?: (value: number | null) => void;
  size?: "sm" | "md";
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  const iconClass = size === "sm" ? "size-3.5" : "size-5";

  if (!onChange) {
    if (!value) return null;
    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${value} of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon
            key={i}
            className={cn(iconClass, i < value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
          />
        ))}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1" onMouseLeave={() => setHover(null)}>
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        return (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} of 5`}
            aria-pressed={value === star}
            onMouseEnter={() => setHover(star)}
            onClick={() => onChange(value === star ? null : star)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <StarIcon
              className={cn(
                iconClass,
                star <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function ResumeViewer({ application }: { application: ApplicationDetail }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isPdf = application.resumeMime === "application/pdf";

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    setBlobUrl(null);
    setError(null);
    void (async () => {
      try {
        const res = await apiFetch(`/careers/applications/${application.id}/resume`);
        if (!res.ok) throw new Error(await errorMessage(res, "Could not load the CV"));
        const blob = await res.blob();
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the CV");
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [application.id]);

  const download = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = application.resumeName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-muted/20">
      <div className="flex flex-wrap items-center gap-3 border-b bg-background/60 px-3 py-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileTextIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={application.resumeName}>
            {application.resumeName}
          </p>
          <p className="text-xs text-muted-foreground">
            {isPdf ? "PDF" : "Word document"} · {formatBytes(application.resumeSize)}
          </p>
        </div>
        {isPdf && blobUrl ? (
          <Button
            variant="outline"
            size="sm"
            render={<a href={blobUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLinkIcon />
            Open
          </Button>
        ) : null}
        <Button size="sm" onClick={download} disabled={!blobUrl}>
          <DownloadIcon />
          Download
        </Button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 px-4 py-8 text-sm text-destructive">
          <TriangleAlertIcon className="size-4" />
          {error}
        </div>
      ) : !blobUrl ? (
        <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Loading CV…
        </div>
      ) : isPdf ? (
        <iframe
          title={`CV of ${application.name}`}
          src={`${blobUrl}#view=FitH`}
          className="h-[34rem] w-full bg-white"
        />
      ) : (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          Word files can't be previewed in the browser. Download the file to read it.
        </div>
      )}
    </div>
  );
}

type TemplateId = "custom" | "received" | "shortlist" | "interview" | "rejection";

const TEMPLATES: {
  id: TemplateId;
  label: string;
  status?: ApplicationStatus;
  subject: string;
  body: string;
}[] = [
  { id: "custom", label: "Blank message", subject: "Re: Your application for {role}", body: "Hi {first},\n\n\n\nBest regards,\n{sender}\n{company}" },
  {
    id: "received",
    label: "Under review",
    status: "reviewing",
    subject: "We're reviewing your application – {role}",
    body: "Hi {first},\n\nThank you for applying for the {role} role at {company}. Our team is reviewing your CV and portfolio now, and we'll get back to you within a few working days.\n\nBest regards,\n{sender}\n{company}",
  },
  {
    id: "shortlist",
    label: "Shortlisted",
    status: "shortlisted",
    subject: "Good news about your application – {role}",
    body: "Hi {first},\n\nThank you for applying for the {role} role. We enjoyed going through your work and we'd like to move you to the next step of our process.\n\nWe'll share the details shortly. If you have any questions in the meantime, just reply to this email.\n\nBest regards,\n{sender}\n{company}",
  },
  {
    id: "interview",
    label: "Interview invite",
    status: "interview",
    subject: "Interview invitation – {role} at {company}",
    body: "Hi {first},\n\nWe'd love to talk with you about the {role} role. Could you let us know which of these times works for you?\n\n- [Day, date – time]\n- [Day, date – time]\n\nThe interview will take about 30–45 minutes on Google Meet. Please have a few portfolio pieces ready to walk us through.\n\nBest regards,\n{sender}\n{company}",
  },
  {
    id: "rejection",
    label: "Not moving forward",
    status: "rejected",
    subject: "Your application for {role}",
    body: "Hi {first},\n\nThank you for your interest in the {role} role and for the time you put into your application.\n\nAfter careful review, we've decided not to move forward at this stage. This was not an easy decision, and we'd be glad to keep your details on file for future openings that match your skills.\n\nWe wish you all the best.\n\nKind regards,\n{sender}\n{company}",
  },
];

function fillTemplate(text: string, application: ApplicationDetail, sender: string) {
  const first = application.name.split(/\s+/)[0] || application.name;
  return text
    .replaceAll("{first}", first)
    .replaceAll("{name}", application.name)
    .replaceAll("{role}", application.jobTitle)
    .replaceAll("{sender}", sender)
    .replaceAll("{company}", DEFAULT_SITE_SETTINGS.siteName);
}

const KEEP_STATUS = "keep";

function ReplyComposer({
  application,
  sender,
  mail,
  onSent,
}: {
  application: ApplicationDetail;
  sender: string;
  mail: MailStatus | null;
  onSent: (next: ApplicationDetail) => void;
}) {
  const [template, setTemplate] = useState<TemplateId>("custom");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [nextStatus, setNextStatus] = useState<ApplicationStatus | typeof KEEP_STATUS>(KEEP_STATUS);
  const [sending, setSending] = useState(false);

  const applyTemplate = useCallback(
    (id: TemplateId) => {
      const t = TEMPLATES.find((item) => item.id === id) ?? TEMPLATES[0];
      setTemplate(t.id);
      setSubject(fillTemplate(t.subject, application, sender));
      setBody(fillTemplate(t.body, application, sender));
      setNextStatus(t.status ?? KEEP_STATUS);
    },
    [application, sender],
  );

  useEffect(() => {
    applyTemplate("custom");
    // Reset only when switching applicant, not on every refresh of the same one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (subject.trim().length < 3 || body.trim().length < 10) {
      toast.error("Add a subject and a message before sending.");
      return;
    }
    setSending(true);
    try {
      const res = await apiFetch(`/careers/applications/${application.id}/reply`, {
        method: "POST",
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          ...(nextStatus !== KEEP_STATUS ? { status: nextStatus } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        application?: ApplicationDetail;
      };
      if (data.application) onSent(data.application);
      if (!res.ok) {
        toast.error(data.message || "The email could not be sent");
        return;
      }
      toast.success(data.message || "Reply sent");
      applyTemplate("custom");
    } catch {
      toast.error("Network error, the reply was not sent");
    } finally {
      setSending(false);
    }
  };

  const mailBlocked = mail !== null && !mail.ready;

  return (
    <form onSubmit={submit} className="grid gap-3">
      {mailBlocked ? (
        <Alert>
          <TriangleAlertIcon />
          <AlertTitle>Email sending isn't set up</AlertTitle>
          <AlertDescription>
            {mail?.problem || "Choose a mail provider first."}{" "}
            <Link to="/admin/settings?tab=mail" className="font-medium text-primary underline-offset-4 hover:underline">
              Open mail settings
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Template</Label>
          <Select value={template} onValueChange={(v) => applyTemplate((v as TemplateId) ?? "custom")}>
            <SelectTrigger className="w-full">
              <SelectValue>{TEMPLATES.find((t) => t.id === template)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>After sending, set status to</Label>
          <Select
            value={nextStatus}
            onValueChange={(v) => setNextStatus((v as ApplicationStatus | typeof KEEP_STATUS) ?? KEEP_STATUS)}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {nextStatus === KEEP_STATUS ? "Keep current status" : STATUS_META[nextStatus].label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={KEEP_STATUS}>Keep current status</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="reply-subject">Subject</Label>
        <Input
          id="reply-subject"
          value={subject}
          maxLength={200}
          onChange={(e) => setSubject(e.target.value.replace(/[\r\n]/g, " "))}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="reply-body">Message</Label>
          <span className="text-xs text-muted-foreground">To {application.email}</span>
        </div>
        <Textarea
          id="reply-body"
          value={body}
          maxLength={10_000}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-56 font-[inherit] leading-relaxed"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Sent as plain text inside your branded email template.
        </p>
        <Button type="submit" disabled={sending || mailBlocked}>
          {sending ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
          Send reply
        </Button>
      </div>
    </form>
  );
}

function DetailInfo({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MailIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <div className="truncate text-sm">{children}</div>
      </div>
    </div>
  );
}

function ApplicationSheet({
  id,
  sender,
  mail,
  onClose,
  onChanged,
  onDeleted,
}: {
  id: number | null;
  sender: string;
  mail: MailStatus | null;
  onClose: () => void;
  onChanged: (application: ApplicationDetail) => void;
  onDeleted: (id: number) => void;
}) {
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const apply = useCallback(
    (next: ApplicationDetail) => {
      setApplication(next);
      onChanged(next);
    },
    [onChanged],
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setApplication(null);
    void (async () => {
      try {
        const res = await apiFetch(`/careers/applications/${id}`);
        if (!res.ok) throw new Error(await errorMessage(res, "Could not load the application"));
        const data = (await res.json()) as { application: ApplicationDetail };
        if (cancelled) return;
        setApplication(data.application);
        setNotes(data.application.notes ?? "");
        onChanged(data.application);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Could not load the application");
          onClose();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const patch = async (body: Partial<Pick<ApplicationDetail, "status" | "rating" | "notes">>, success: string) => {
    if (!application) return false;
    const res = await apiFetch(`/careers/applications/${application.id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      toast.error(await errorMessage(res, "Update failed"));
      return false;
    }
    const data = (await res.json()) as { application: ApplicationDetail };
    apply(data.application);
    toast.success(success);
    return true;
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await patch({ notes }, "Notes saved");
    } finally {
      setSavingNotes(false);
    }
  };

  const remove = async () => {
    if (!application) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/careers/applications/${application.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(await errorMessage(res, "Delete failed"));
        return;
      }
      toast.success("Application deleted");
      setConfirmDelete(false);
      onDeleted(application.id);
    } finally {
      setDeleting(false);
    }
  };

  const notesDirty = application ? notes !== (application.notes ?? "") : false;

  return (
    <Sheet open={id !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 p-0 data-[side=right]:sm:max-w-3xl">
        {loading || !application ? (
          <div className="grid gap-4 p-6">
            <SheetHeader className="p-0">
              <SheetTitle>Loading application…</SheetTitle>
              <SheetDescription className="sr-only">Fetching applicant details</SheetDescription>
            </SheetHeader>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader className="border-b bg-muted/20 px-5 py-4 pr-12">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials(application.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate text-lg">{application.name}</SheetTitle>
                  <SheetDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>{application.jobTitle}</span>
                    <span aria-hidden>·</span>
                    <span className="font-mono text-xs">{reference(application.id)}</span>
                  </SheetDescription>
                </div>
                <StatusBadge status={application.status} />
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              <div className="grid gap-6 px-5 py-5">
                <div className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2">
                  <DetailInfo icon={MailIcon} label="Email">
                    <a href={`mailto:${application.email}`} className="text-primary hover:underline">
                      {application.email}
                    </a>
                  </DetailInfo>
                  <DetailInfo icon={PhoneIcon} label="Phone">
                    <a href={`tel:${application.phone}`} className="hover:underline">
                      {application.phone}
                    </a>
                  </DetailInfo>
                  <DetailInfo icon={MapPinIcon} label="City">
                    {application.city}
                  </DetailInfo>
                  <DetailInfo icon={BriefcaseIcon} label="Experience">
                    {application.experience}
                  </DetailInfo>
                  <DetailInfo icon={GlobeIcon} label="Portfolio">
                    {application.portfolioUrl ? (
                      <a
                        href={application.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {application.portfolioUrl.replace(/^https:\/\//, "")}
                        <ExternalLinkIcon className="size-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Not provided</span>
                    )}
                  </DetailInfo>
                  <DetailInfo icon={CalendarIcon} label="Applied">
                    {formatDate(application.createdAt, true)}
                  </DetailInfo>
                </div>

                <section className="grid gap-3">
                  <h3 className="text-sm font-semibold">CV</h3>
                  <ResumeViewer application={application} />
                </section>

                {application.coverLetter ? (
                  <section className="grid gap-2">
                    <h3 className="text-sm font-semibold">Cover letter</h3>
                    <p className="rounded-xl border bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {application.coverLetter}
                    </p>
                  </section>
                ) : null}

                <section className="grid gap-4 rounded-xl border p-4">
                  <h3 className="text-sm font-semibold">Review</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label>Status</Label>
                      <Select
                        value={application.status}
                        onValueChange={(v) => {
                          if (v && v !== application.status) {
                            void patch({ status: v as ApplicationStatus }, `Moved to ${STATUS_META[v as ApplicationStatus].label}`);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>{STATUS_META[application.status].label}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_META[s].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Rating</Label>
                      <div className="flex h-9 items-center">
                        <RatingStars
                          value={application.rating}
                          onChange={(rating) =>
                            void patch({ rating }, rating ? `Rated ${rating} of 5` : "Rating cleared")
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="app-notes">Private notes</Label>
                    <Textarea
                      id="app-notes"
                      value={notes}
                      maxLength={5000}
                      placeholder="Strengths, concerns, interview feedback… only admins can see this."
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-24"
                    />
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" onClick={() => void saveNotes()} disabled={!notesDirty || savingNotes}>
                        {savingNotes ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
                        Save notes
                      </Button>
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 rounded-xl border p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <MailIcon className="size-4" />
                    Reply by email
                  </h3>
                  <ReplyComposer application={application} sender={sender} mail={mail} onSent={apply} />
                </section>

                {application.replies.length > 0 ? (
                  <section className="grid gap-3">
                    <h3 className="text-sm font-semibold">Email history</h3>
                    <ol className="grid gap-3">
                      {application.replies.map((reply) => (
                        <li key={reply.id} className="rounded-xl border bg-card p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="min-w-0 flex-1 truncate text-sm font-medium">{reply.subject}</p>
                            <Badge
                              variant="outline"
                              className={
                                reply.status === "sent"
                                  ? STATUS_META.hired.className
                                  : STATUS_META.rejected.className
                              }
                            >
                              {reply.status === "sent" ? "Sent" : "Failed"}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(reply.createdAt, true)}
                            {reply.sentBy ? ` · by ${reply.sentBy.fullName}` : ""}
                            {reply.provider ? ` · via ${reply.provider}` : ""}
                          </p>
                          {reply.error ? (
                            <p className="mt-2 text-xs text-destructive">{reply.error}</p>
                          ) : null}
                          <details className="mt-2 text-sm">
                            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                              Show message
                            </summary>
                            <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{reply.body}</p>
                          </details>
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null}

                <Separator />
                <div className="flex justify-end pb-2">
                  <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                    <Trash2Icon />
                    Delete application
                  </Button>
                </div>
              </div>
            </div>

            <ConfirmDialog
              open={confirmDelete}
              onOpenChange={setConfirmDelete}
              title="Delete this application?"
              description={`${application.name}'s application, CV file and email history will be permanently removed.`}
              loading={deleting}
              onConfirm={remove}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CareersInbox({ user }: { user: DashboardUser }) {
  const [params, setParams] = useSearchParams();
  const selectedId = Number(params.get("id")) || null;

  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mail, setMail] = useState<MailStatus | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      try {
        const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (status !== "all") qs.set("status", status);
        if (search) qs.set("q", search);
        const res = await apiFetch(`/careers/applications?${qs}`);
        if (!res.ok) throw new Error(await errorMessage(res, "Could not load applications"));
        setData((await res.json()) as ListResponse);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load applications");
      } finally {
        setLoading(false);
      }
    },
    [page, status, search],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const refresh = () => void load(true);
    document.addEventListener("dashboard:notifications", refresh);
    return () => document.removeEventListener("dashboard:notifications", refresh);
  }, [load]);

  useEffect(() => {
    void (async () => {
      const res = await apiFetch("/admin/settings/mail").catch(() => null);
      if (res?.ok) setMail(((await res.json()) as { settings: MailStatus }).settings);
    })();
  }, []);

  const openApplication = (id: number) => {
    const next = new URLSearchParams(params);
    next.set("id", String(id));
    setParams(next);
  };

  const closeApplication = useCallback(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("id");
        return next;
      },
      { replace: true },
    );
  }, [setParams]);

  const onChanged = useCallback((application: ApplicationDetail) => {
    setData((prev) => {
      if (!prev) return prev;
      const existing = prev.applications.find((row) => row.id === application.id);
      if (!existing) return prev;
      const counts = { ...prev.counts };
      if (existing.status !== application.status) {
        counts[existing.status] = Math.max(0, (counts[existing.status] ?? 1) - 1);
        counts[application.status] = (counts[application.status] ?? 0) + 1;
      }
      return {
        ...prev,
        counts,
        unread: existing.readAt ? prev.unread : Math.max(0, prev.unread - 1),
        applications: prev.applications.map((row) =>
          row.id === application.id
            ? {
                ...row,
                status: application.status,
                rating: application.rating,
                readAt: application.readAt,
                replyCount: application.replies.length,
              }
            : row,
        ),
      };
    });
  }, []);

  const onDeleted = useCallback(() => {
    closeApplication();
    void load(true);
  }, [closeApplication, load]);

  const totalAll = useMemo(
    () => Object.values(data?.counts ?? {}).reduce((sum, n) => sum + (n ?? 0), 0),
    [data?.counts],
  );
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const stats = [
    { label: "Total applications", value: totalAll },
    { label: "Unread", value: data?.unread ?? 0 },
    {
      label: "In progress",
      value:
        (data?.counts.reviewing ?? 0) + (data?.counts.shortlisted ?? 0) + (data?.counts.interview ?? 0),
    },
    { label: "Hired", value: data?.counts.hired ?? 0 },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/70 bg-card/90">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {data ? stat.value : <Skeleton className="h-7 w-10" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mail && !mail.ready ? (
        <Alert>
          <MailIcon />
          <AlertTitle>Replies and auto-confirmations are off</AlertTitle>
          <AlertDescription>
            {mail.problem || "No mail provider is configured."}{" "}
            <Link to="/admin/settings?tab=mail" className="font-medium text-primary underline-offset-4 hover:underline">
              Set up Resend or SMTP
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="overflow-hidden border-border/70 bg-card/90 py-0">
        <div className="grid gap-3 border-b bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, role or city"
                className="pl-9"
                maxLength={100}
                aria-label="Search applications"
              />
            </div>
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCwIcon className={cn(loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {(["all", ...STATUSES] as const).map((s) => {
              const count = s === "all" ? totalAll : data?.counts[s] ?? 0;
              const active = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {s === "all" ? "All" : STATUS_META[s].label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 tabular-nums",
                      active ? "bg-primary-foreground/20" : "bg-background/70",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertTitle>Could not load applications</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center gap-3">
                <span>{error}</span>
                <Button size="sm" variant="outline" onClick={() => void load()}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : loading && !data ? (
          <div className="grid gap-2 p-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : data && data.applications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <InboxIcon className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No applications here yet</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              {search || status !== "all"
                ? "Try a different search or status filter."
                : "When someone applies on the careers page, it shows up here and you get a notification."}
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {data?.applications.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => openApplication(row.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none",
                    selectedId === row.id && "bg-muted/50",
                  )}
                >
                  <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials(row.name)}
                    {!row.readAt ? (
                      <span
                        className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-card"
                        aria-label="Unread"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cn("truncate text-sm", !row.readAt ? "font-semibold" : "font-medium")}>
                        {row.name}
                      </span>
                      <RatingStars value={row.rating} size="sm" />
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {row.jobTitle} · {row.experience} · {row.city}
                    </span>
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                    {row.replyCount > 0 ? (
                      <>
                        <MessageSquareIcon className="size-3.5" />
                        {row.replyCount}
                      </>
                    ) : null}
                  </span>
                  <span className="hidden w-24 shrink-0 text-right text-xs text-muted-foreground md:block">
                    {formatDate(row.createdAt)}
                  </span>
                  <StatusBadge status={row.status} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {data && data.total > data.pageSize ? (
          <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
            <span>
              Page {data.page} of {pages} · {data.total} applications
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeftIcon />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pages || loading}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
              >
                Next
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <ApplicationSheet
        id={selectedId}
        sender={user.fullName}
        mail={mail}
        onClose={closeApplication}
        onChanged={onChanged}
        onDeleted={onDeleted}
      />
    </div>
  );
}

export default function AdminCareersPage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="Careers"
      description="Review applications, read CVs and reply to candidates by email"
    >
      {({ user }) => <CareersInbox user={user} />}
    </DashboardLayout>
  );
}
