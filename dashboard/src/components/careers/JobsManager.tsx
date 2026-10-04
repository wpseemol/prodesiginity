import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BriefcaseIcon,
  CircleAlertIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { readMessage } from "@/components/services/serviceTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPTY_JOB,
  JOB_TITLE_RE,
  JOB_TYPE_SUGGESTIONS,
  careersPageUrl,
  type CareersContentResponse,
  type JobInput,
  type JobRow,
} from "./careerContentTypes";

type Errors = Partial<Record<keyof JobInput, string>>;

const LIMITS: Record<Exclude<keyof JobInput, "published">, number> = {
  title: 120,
  department: 80,
  type: 40,
  location: 80,
  experience: 40,
  salary: 60,
  description: 1000,
};

function validate(job: JobInput, others: JobRow[]): Errors {
  const errors: Errors = {};
  const title = job.title.trim();
  if (title.length < 2) errors.title = "Add a job title";
  else if (!JOB_TITLE_RE.test(title)) {
    errors.title = "Use letters, numbers, spaces and & / ( ) . , ' + - only";
  } else if (others.some((o) => o.title.trim().toLowerCase() === title.toLowerCase())) {
    errors.title = "Another opening already uses this title";
  }
  for (const key of ["department", "type", "location", "experience", "salary", "description"] as const) {
    if (!job[key].trim()) errors[key] = "Required";
  }
  return errors;
}

function Field({
  label,
  htmlFor,
  error,
  help,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs font-medium text-destructive">
          <CircleAlertIcon className="size-3.5" />
          {error}
        </p>
      ) : help ? (
        <p className="text-xs text-muted-foreground">{help}</p>
      ) : null}
    </div>
  );
}

function JobEditor({
  open,
  job,
  jobs,
  onClose,
  onSaved,
}: {
  open: boolean;
  job: JobRow | null;
  jobs: JobRow[];
  onClose: () => void;
  onSaved: (job: JobRow, created: boolean) => void;
}) {
  const [values, setValues] = useState<JobInput>(() =>
    job
      ? {
          title: job.title,
          department: job.department,
          type: job.type,
          location: job.location,
          experience: job.experience,
          salary: job.salary,
          description: job.description,
          published: job.published,
        }
      : EMPTY_JOB,
  );
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = validate(
    values,
    jobs.filter((j) => j.id !== job?.id),
  );
  const visibleErrors = showErrors ? errors : {};

  const set = <K extends keyof JobInput>(key: K, value: JobInput[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      toast.error("Fix the highlighted fields first.");
      return;
    }
    setSaving(true);
    try {
      const body: JobInput = {
        ...values,
        title: values.title.trim(),
        department: values.department.trim(),
        type: values.type.trim(),
        location: values.location.trim(),
        experience: values.experience.trim(),
        salary: values.salary.trim(),
        description: values.description.trim(),
      };
      const res = await apiFetch(job ? `/admin/careers/jobs/${job.id}` : "/admin/careers/jobs", {
        method: job ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not save the opening."));
        return;
      }
      const data = (await res.json()) as { job: JobRow };
      toast.success(job ? `“${data.job.title}” updated.` : `“${data.job.title}” added.`);
      onSaved(data.job, !job);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const textInput = (key: Exclude<keyof JobInput, "published" | "description">, placeholder: string) => (
    <Input
      id={`job-${key}`}
      value={values[key]}
      maxLength={LIMITS[key]}
      placeholder={placeholder}
      aria-invalid={Boolean(visibleErrors[key])}
      onChange={(e) => set(key, e.target.value)}
      list={key === "type" ? "job-type-suggestions" : undefined}
    />
  );

  return (
    <Sheet open={open} onOpenChange={(next) => !next && !saving && onClose()}>
      <SheetContent side="right" className="w-full gap-0 p-0 data-[side=right]:sm:max-w-xl">
        <form onSubmit={submit} noValidate className="flex h-full flex-col">
          <SheetHeader className="border-b bg-muted/20 px-5 py-4 pr-12">
            <SheetTitle>{job ? "Edit job opening" : "Add job opening"}</SheetTitle>
            <SheetDescription>
              Applicants pick this role by its title in the application form.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 content-start gap-4 overflow-y-auto px-5 py-5">
            <Field
              label="Job title"
              htmlFor="job-title"
              error={visibleErrors.title}
              help={job ? "Past applications keep the title they were sent with." : undefined}
            >
              {textInput("title", "e.g. Senior Motion Designer")}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Department" htmlFor="job-department" error={visibleErrors.department}>
                {textInput("department", "e.g. Creative Production")}
              </Field>
              <Field label="Job type" htmlFor="job-type" error={visibleErrors.type}>
                {textInput("type", "e.g. Full-Time")}
                <datalist id="job-type-suggestions">
                  {JOB_TYPE_SUGGESTIONS.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </Field>
              <Field label="Location" htmlFor="job-location" error={visibleErrors.location}>
                {textInput("location", "e.g. Remote / Hybrid (BD)")}
              </Field>
              <Field label="Experience" htmlFor="job-experience" error={visibleErrors.experience}>
                {textInput("experience", "e.g. 2+ Years")}
              </Field>
            </div>

            <Field
              label="Salary"
              htmlFor="job-salary"
              error={visibleErrors.salary}
              help="Shown in green on the card, e.g. “Negotiate” or “BDT 40k–60k”."
            >
              {textInput("salary", "Negotiate")}
            </Field>

            <Field label="Description" htmlFor="job-description" error={visibleErrors.description}>
              <Textarea
                id="job-description"
                value={values.description}
                maxLength={LIMITS.description}
                placeholder="What this person will do and the tools they will use."
                aria-invalid={Boolean(visibleErrors.description)}
                onChange={(e) => set("description", e.target.value)}
                className="min-h-32"
              />
              <span className="justify-self-end text-xs tabular-nums text-muted-foreground">
                {values.description.length}/{LIMITS.description}
              </span>
            </Field>

            <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <span>
                <span className="block text-sm font-medium">Show on website</span>
                <span className="block text-xs text-muted-foreground">
                  Hidden openings stay here but are not listed or selectable on the careers page.
                </span>
              </span>
              <Switch checked={values.published} onCheckedChange={(checked) => set("published", checked)} />
            </label>
          </div>

          <SheetFooter className="flex-row justify-end gap-2 border-t px-5 py-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
              {job ? "Save changes" : "Add opening"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function JobsManager() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ open: boolean; job: JobRow | null; key: number }>({
    open: false,
    job: null,
    key: 0,
  });
  const openEditor = (job: JobRow | null) => setEditor((prev) => ({ open: true, job, key: prev.key + 1 }));
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<JobRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch("/admin/careers");
      if (!res.ok) {
        setError(await readMessage(res, "Could not load job openings."));
        return;
      }
      setJobs(((await res.json()) as CareersContentResponse).jobs);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePublished = async (row: JobRow) => {
    setBusyId(row.id);
    try {
      const res = await apiFetch(`/admin/careers/jobs/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ published: !row.published }),
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not update the opening."));
        return;
      }
      const data = (await res.json()) as { job: JobRow };
      setJobs((list) => list.map((j) => (j.id === row.id ? data.job : j)));
      toast.success(
        row.published
          ? `“${row.title}” is now hidden from the careers page.`
          : `“${row.title}” is now listed on the careers page.`,
      );
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= jobs.length) return;
    const previous = jobs;
    const next = [...jobs];
    [next[index], next[target]] = [next[target], next[index]];
    setJobs(next);
    try {
      const res = await apiFetch("/admin/careers/jobs/order", {
        method: "PUT",
        body: JSON.stringify({ ids: next.map((j) => j.id) }),
      });
      if (!res.ok) {
        setJobs(previous);
        toast.error(await readMessage(res, "Could not save the new order."));
      }
    } catch {
      setJobs(previous);
      toast.error("Could not reach the server.");
    }
  };

  const handleDelete = async (row: JobRow) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/admin/careers/jobs/${row.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not delete the opening."));
        return;
      }
      setJobs((list) => list.filter((j) => j.id !== row.id));
      setPendingDelete(null);
      toast.success(`“${row.title}” was deleted.`);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load job openings</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>{error}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setLoading(true);
              void load();
            }}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const visibleCount = jobs.filter((j) => j.published).length;
  const openCreate = () => openEditor(null);

  return (
    <>
      <Card className="overflow-hidden border-border/70 bg-card/90">
        <CardHeader className="gap-4 border-b border-border/60 bg-muted/20 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BriefcaseIcon className="size-4" />
              </span>
              Job openings
            </CardTitle>
            <CardDescription>
              Listed under “Open Positions” on the careers page and in the application form's role menu.
            </CardDescription>
            <p className="text-xs text-muted-foreground">
              {visibleCount} of {jobs.length} openings visible
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" render={<a href={careersPageUrl} target="_blank" rel="noreferrer" />}>
              <ExternalLinkIcon />
              View page
            </Button>
            <Button onClick={openCreate}>
              <PlusIcon />
              Add opening
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          {jobs.length === 0 ? (
            <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BriefcaseIcon className="size-6" />
              </span>
              <div>
                <p className="font-semibold">No job openings</p>
                <p className="text-sm text-muted-foreground">
                  The careers page shows your “no openings” message and accepts general applications.
                </p>
              </div>
              <Button onClick={openCreate}>
                <PlusIcon />
                Add your first opening
              </Button>
            </div>
          ) : (
            <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
              {jobs.map((row, index) => (
                <li
                  key={row.id}
                  className={cn("flex flex-col gap-3 p-4 sm:flex-row sm:items-center", !row.published && "bg-muted/30")}
                >
                  <div className="flex shrink-0 gap-1 sm:flex-col">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      aria-label={`Move ${row.title} up`}
                      disabled={index === 0}
                      onClick={() => void move(index, -1)}
                    >
                      <ArrowUpIcon />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      aria-label={`Move ${row.title} down`}
                      disabled={index === jobs.length - 1}
                      onClick={() => void move(index, 1)}
                    >
                      <ArrowDownIcon />
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditor(row)}
                    className={cn("min-w-0 flex-1 text-left", !row.published && "opacity-70")}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{row.title}</span>
                      {row.published ? <Badge>On website</Badge> : <Badge variant="secondary">Hidden</Badge>}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      <span>{row.department}</span>
                      <span aria-hidden>·</span>
                      <span>{row.type}</span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPinIcon className="size-3" />
                        {row.location}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{row.experience}</span>
                      <span aria-hidden>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{row.salary}</span>
                    </span>
                    <span className="mt-1 line-clamp-1 text-xs text-muted-foreground">{row.description}</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                    <Button size="sm" variant="outline" onClick={() => openEditor(row)}>
                      <PencilIcon />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === row.id}
                      onClick={() => void togglePublished(row)}
                    >
                      {busyId === row.id ? (
                        <Loader2Icon className="animate-spin" />
                      ) : row.published ? (
                        <EyeOffIcon />
                      ) : (
                        <EyeIcon />
                      )}
                      {row.published ? "Hide" : "Show"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete ${row.title}`}
                      className="text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete(row)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <JobEditor
        key={editor.key}
        open={editor.open}
        job={editor.job}
        jobs={jobs}
        onClose={() => setEditor((prev) => ({ ...prev, open: false }))}
        onSaved={(saved, created) => {
          setJobs((list) => (created ? [...list, saved] : list.map((j) => (j.id === saved.id ? saved : j))));
          setEditor((prev) => ({ ...prev, open: false }));
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
        title={`Delete “${pendingDelete?.title ?? "opening"}”?`}
        description="It will be removed from the careers page. Applications already sent for this role are kept. To take it down only for now, use Hide instead."
        confirmLabel="Delete opening"
        loading={deleting}
        onConfirm={() => {
          if (pendingDelete) void handleDelete(pendingDelete);
        }}
      />
    </>
  );
}
