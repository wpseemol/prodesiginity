import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  BriefcaseIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
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
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ACCENTS: Record<
  string,
  { iconBg: string; iconColor: string; hoverBorder: string; wash: string }
> = {
  violet: {
    iconBg: "bg-brand-violet/10 dark:bg-dark-brand-violet/15",
    iconColor: "text-brand-violet dark:text-dark-brand-violet",
    hoverBorder:
      "group-hover:border-brand-violet/40 dark:group-hover:border-dark-brand-violet/40",
    wash: "from-brand-violet/18 via-primary/12 to-brand-blue/15",
  },
  blue: {
    iconBg: "bg-brand-blue/10 dark:bg-dark-brand-blue/15",
    iconColor: "text-brand-blue dark:text-dark-brand-blue",
    hoverBorder:
      "group-hover:border-brand-blue/40 dark:group-hover:border-dark-brand-blue/40",
    wash: "from-brand-blue/18 via-primary/12 to-cyan-400/15",
  },
  indigo: {
    iconBg: "bg-primary/10 dark:bg-dark-primary/15",
    iconColor: "text-primary dark:text-dark-primary",
    hoverBorder:
      "group-hover:border-primary/40 dark:group-hover:border-dark-primary/40",
    wash: "from-primary/18 via-brand-violet/12 to-brand-blue/15",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "group-hover:border-emerald-500/40",
    wash: "from-emerald-500/18 via-primary/10 to-brand-blue/15",
  },
  orange: {
    iconBg: "bg-brand-orange/10 dark:bg-dark-brand-orange/15",
    iconColor: "text-brand-orange dark:text-dark-brand-orange",
    hoverBorder:
      "group-hover:border-brand-orange/40 dark:group-hover:border-dark-brand-orange/40",
    wash: "from-brand-orange/18 via-primary/10 to-brand-violet/15",
  },
};

const ACCENT_SWATCH: Record<string, string> = {
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  orange: "bg-orange-500",
};

type GroupRow = {
  id: number;
  slug: string;
  title: string;
  blurb: string;
  icon: string;
  sortOrder: number;
};

type ServiceRow = {
  id: number;
  slug: string;
  title: string;
  groupId: number;
  group?: string;
  icon: string;
  tagline: string;
  summary: string;
  intro: string[];
  deliverables: string[];
  idealFor: string[];
  process: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  timeline: string;
  startingAt: string;
  accent: (typeof ACCENTS)[string];
  seo: { title: string; description: string; keywords: string[] };
  sortOrder: number;
  published: boolean;
};

type ProcessStep = { title: string; bodyHtml: string };
type FaqItem = { q: string; aHtml: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function matchAccentKey(accent: ServiceRow["accent"]) {
  for (const [key, preset] of Object.entries(ACCENTS)) {
    if (preset.iconColor === accent?.iconColor) return key;
  }
  return "indigo";
}

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border bg-card/80 p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function ServicesManager() {
  const [tab, setTab] = useState<"services" | "groups">("services");
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [groupId, setGroupId] = useState<string>("");
  const [icon, setIcon] = useState("Sparkles");
  const [accentKey, setAccentKey] = useState("indigo");
  const [tagline, setTagline] = useState("");
  const [summaryHtml, setSummaryHtml] = useState("<p></p>");
  const [introHtml, setIntroHtml] = useState("<p></p>");
  const [deliverablesHtml, setDeliverablesHtml] = useState(
    "<ul><li><p></p></li></ul>",
  );
  const [idealForHtml, setIdealForHtml] = useState(
    "<ul><li><p></p></li></ul>",
  );
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    { title: "Discover", bodyHtml: textToHtml("We learn your goals.") },
    { title: "Deliver", bodyHtml: textToHtml("We ship the work.") },
  ]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [timeline, setTimeline] = useState("");
  const [startingAt, setStartingAt] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescriptionHtml, setSeoDescriptionHtml] = useState("<p></p>");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [published, setPublished] = useState(true);

  const [gTitle, setGTitle] = useState("");
  const [gSlug, setGSlug] = useState("");
  const [gBlurb, setGBlurb] = useState("");
  const [gIcon, setGIcon] = useState("Layout");
  const [editingGroup, setEditingGroup] = useState<GroupRow | null>(null);
  const [pendingDeleteService, setPendingDeleteService] =
    useState<ServiceRow | null>(null);
  const [pendingDeleteGroup, setPendingDeleteGroup] = useState<GroupRow | null>(
    null,
  );
  const [deletingTarget, setDeletingTarget] = useState(false);

  const groupName = useMemo(() => {
    const map = new Map(groups.map((g) => [g.id, g.title]));
    return (id: number) => map.get(id) ?? "—";
  }, [groups]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/admin/services");
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "Could not load services.",
        );
        return;
      }
      setGroups(data.groups ?? []);
      setServices(data.services ?? []);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resetServiceForm = () => {
    setEditing(null);
    setShowForm(false);
    setTitle("");
    setSlug("");
    setGroupId(groups[0] ? String(groups[0].id) : "");
    setIcon("Sparkles");
    setAccentKey("indigo");
    setTagline("");
    setSummaryHtml("<p></p>");
    setIntroHtml("<p></p>");
    setDeliverablesHtml("<ul><li><p></p></li></ul>");
    setIdealForHtml("<ul><li><p></p></li></ul>");
    setProcessSteps([
      { title: "Discover", bodyHtml: textToHtml("We learn your goals.") },
      { title: "Deliver", bodyHtml: textToHtml("We ship the work.") },
    ]);
    setFaqs([]);
    setTimeline("1–2 weeks");
    setStartingAt("Custom quote");
    setSeoTitle("");
    setSeoDescriptionHtml("<p></p>");
    setSeoKeywords("");
    setPublished(true);
    setFormKey((k) => k + 1);
  };

  const startCreate = () => {
    resetServiceForm();
    setShowForm(true);
    setGroupId(groups[0] ? String(groups[0].id) : "");
    setFormKey((k) => k + 1);
  };

  const startEdit = (row: ServiceRow) => {
    setEditing(row);
    setShowForm(true);
    setTitle(row.title);
    setSlug(row.slug);
    setGroupId(String(row.groupId));
    setIcon(row.icon);
    setAccentKey(matchAccentKey(row.accent));
    setTagline(row.tagline);
    setSummaryHtml(textToHtml(row.summary));
    setIntroHtml(paragraphsToHtml(row.intro));
    setDeliverablesHtml(listToHtml(row.deliverables));
    setIdealForHtml(listToHtml(row.idealFor));
    setProcessSteps(
      (row.process ?? []).map((s) => ({
        title: s.title,
        bodyHtml: textToHtml(s.body),
      })),
    );
    setFaqs(
      (row.faqs ?? []).map((f) => ({
        q: f.q,
        aHtml: textToHtml(f.a),
      })),
    );
    setTimeline(row.timeline);
    setStartingAt(row.startingAt);
    setSeoTitle(row.seo?.title ?? "");
    setSeoDescriptionHtml(textToHtml(row.seo?.description ?? ""));
    setSeoKeywords((row.seo?.keywords ?? []).join(", "));
    setPublished(row.published);
    setFormKey((k) => k + 1);
  };

  const handleSaveService = async (e: FormEvent) => {
    e.preventDefault();
    if (!groupId) {
      toast.error("Pick a service group.");
      return;
    }

    const summary = htmlToText(summaryHtml);
    const introList = htmlToParagraphs(introHtml);
    const deliverablesList = htmlToList(deliverablesHtml);
    const idealForList = htmlToList(idealForHtml);
    const process = processSteps
      .map((s) => ({
        title: s.title.trim(),
        body: htmlToText(s.bodyHtml),
      }))
      .filter((s) => s.title && s.body);
    const faqPayload = faqs
      .map((f) => ({
        q: f.q.trim(),
        a: htmlToText(f.aHtml),
      }))
      .filter((f) => f.q && f.a);

    if (!summary) {
      toast.error("Add a card summary.");
      return;
    }
    if (!introList.length || !deliverablesList.length || !idealForList.length) {
      toast.error("Intro, deliverables, and ideal-for need content.");
      return;
    }
    if (!process.length) {
      toast.error("Add at least one process step.");
      return;
    }

    const payload = {
      title,
      slug: slug || slugify(title),
      groupId: Number(groupId),
      icon,
      tagline,
      summary,
      intro: introList,
      deliverables: deliverablesList,
      idealFor: idealForList,
      process,
      faqs: faqPayload,
      timeline,
      startingAt,
      accent: ACCENTS[accentKey] ?? ACCENTS.indigo,
      seo: {
        title: seoTitle || title,
        description: htmlToText(seoDescriptionHtml) || summary,
        keywords: seoKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      },
      published,
    };

    setSaving(true);
    try {
      const res = await apiFetch(
        editing ? `/admin/services/${editing.id}` : "/admin/services",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string" ? data.message : "Save failed.",
        );
        return;
      }
      toast.success(editing ? "Service updated." : "Service created.");
      resetServiceForm();
      await load();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (row: ServiceRow) => {
    setDeletingTarget(true);
    try {
      const res = await apiFetch(`/admin/services/${row.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string" ? data.message : "Delete failed.",
        );
        return;
      }
      setPendingDeleteService(null);
      toast.success("Service deleted.");
      if (editing?.id === row.id) resetServiceForm();
      await load();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDeletingTarget(false);
    }
  };

  const handleSaveGroup = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: gTitle,
        slug: gSlug || slugify(gTitle),
        blurb: gBlurb,
        icon: gIcon,
      };
      const res = await apiFetch(
        editingGroup
          ? `/admin/services/groups/${editingGroup.id}`
          : "/admin/services/groups",
        {
          method: editingGroup ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string" ? data.message : "Save failed.",
        );
        return;
      }
      toast.success(editingGroup ? "Group updated." : "Group created.");
      setEditingGroup(null);
      setGTitle("");
      setGSlug("");
      setGBlurb("");
      setGIcon("Layout");
      await load();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (row: GroupRow) => {
    setDeletingTarget(true);
    try {
      const res = await apiFetch(`/admin/services/groups/${row.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string" ? data.message : "Delete failed.",
        );
        return;
      }
      setPendingDeleteGroup(null);
      toast.success("Group deleted.");
      await load();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDeletingTarget(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2Icon className="size-5 animate-spin" />
        Loading services…
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load services</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>{error}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void load()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-border/70 bg-card/90">
        <CardHeader className="gap-3 border-b border-border/60 bg-muted/20 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BriefcaseIcon className="size-4" />
              </span>
              Services CMS
            </CardTitle>
            <CardDescription>
              Edit Types of Work We Do, menus, and service detail pages.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("services")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold",
                tab === "services"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              Services ({services.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("groups")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold",
                tab === "groups"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              Groups ({groups.length})
            </button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-5 pt-5">
          {tab === "services" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Click a service to edit, or add a new one.
                </p>
                <Button type="button" size="sm" onClick={startCreate}>
                  <PlusIcon />
                  Add service
                </Button>
              </div>

              {showForm ? (
                <form
                  key={formKey}
                  className="grid gap-4"
                  onSubmit={handleSaveService}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-muted/20 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ServiceIcon name={icon} className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {editing ? `Edit: ${editing.title}` : "New service"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {slug
                            ? `/services/our-service/${slug}`
                            : "Fill title to generate URL"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={resetServiceForm}
                    >
                      <XIcon />
                      Close
                    </Button>
                  </div>

                  <SectionCard title="Basics" hint="Name, URL, group, publish">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="svcTitle">Title</Label>
                        <Input
                          id="svcTitle"
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            if (!editing) setSlug(slugify(e.target.value));
                          }}
                          required
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="svcSlug">URL slug</Label>
                        <Input
                          id="svcSlug"
                          value={slug}
                          onChange={(e) => setSlug(slugify(e.target.value))}
                          required
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label>Group</Label>
                        <Select
                          value={groupId}
                          onValueChange={(value) => {
                            if (value) setGroupId(value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map((g) => (
                              <SelectItem key={g.id} value={String(g.id)}>
                                {g.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                          id="tagline"
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-1.5 sm:col-span-2">
                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-2.5 text-sm">
                          <span>
                            <span className="font-medium">Published</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              Show on website when enabled
                            </span>
                          </span>
                          <input
                            type="checkbox"
                            className="size-4 accent-primary"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                          />
                        </label>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Icon"
                    hint="Pick the icon shown on cards and menus"
                  >
                    <IconPicker value={icon} onChange={setIcon} />
                  </SectionCard>

                  <SectionCard title="Accent color" hint="Card colour theme">
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(ACCENTS).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setAccentKey(key)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                            accentKey === key
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40",
                          )}
                        >
                          <span
                            className={cn(
                              "size-3 rounded-full",
                              ACCENT_SWATCH[key],
                            )}
                          />
                          {key}
                        </button>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Card summary"
                    hint="Short text for Types of Work We Do cards"
                  >
                    <SimpleEditor
                      value={summaryHtml}
                      onChange={setSummaryHtml}
                      placeholder="One or two sentences for the homepage card…"
                      minHeight="88px"
                    />
                  </SectionCard>

                  <SectionCard
                    title="Detail intro"
                    hint="Paragraphs on the service page — add a new paragraph with Enter"
                  >
                    <SimpleEditor
                      value={introHtml}
                      onChange={setIntroHtml}
                      placeholder="Write the introduction…"
                      minHeight="140px"
                    />
                  </SectionCard>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <SectionCard
                      title="Deliverables"
                      hint="Use the bullet list button"
                    >
                      <SimpleEditor
                        value={deliverablesHtml}
                        onChange={setDeliverablesHtml}
                        placeholder="What the client gets…"
                        listMode
                        minHeight="140px"
                      />
                    </SectionCard>
                    <SectionCard
                      title="Ideal for"
                      hint="Use the bullet list button"
                    >
                      <SimpleEditor
                        value={idealForHtml}
                        onChange={setIdealForHtml}
                        placeholder="Who this service suits…"
                        listMode
                        minHeight="140px"
                      />
                    </SectionCard>
                  </div>

                  <SectionCard title="Process steps" hint="Add or remove steps">
                    <div className="grid gap-3">
                      {processSteps.map((step, index) => (
                        <div
                          key={`process-${formKey}-${index}`}
                          className="grid gap-2 rounded-xl border bg-muted/10 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Step {index + 1}</Badge>
                            <Input
                              value={step.title}
                              onChange={(e) => {
                                const next = [...processSteps];
                                next[index] = {
                                  ...step,
                                  title: e.target.value,
                                };
                                setProcessSteps(next);
                              }}
                              placeholder="Step title"
                              required
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
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
                            value={step.bodyHtml}
                            onChange={(html) => {
                              const next = [...processSteps];
                              next[index] = { ...step, bodyHtml: html };
                              setProcessSteps(next);
                            }}
                            placeholder="Describe this step…"
                            minHeight="72px"
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
                            {
                              title: "",
                              bodyHtml: "<p></p>",
                            },
                          ])
                        }
                      >
                        <PlusIcon />
                        Add step
                      </Button>
                    </div>
                  </SectionCard>

                  <SectionCard title="FAQs" hint="Optional — add Q&A pairs">
                    <div className="grid gap-3">
                      {faqs.map((faq, index) => (
                        <div
                          key={`faq-${formKey}-${index}`}
                          className="grid gap-2 rounded-xl border bg-muted/10 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Input
                              value={faq.q}
                              onChange={(e) => {
                                const next = [...faqs];
                                next[index] = { ...faq, q: e.target.value };
                                setFaqs(next);
                              }}
                              placeholder="Question"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
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
                            minHeight="72px"
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
                        Add FAQ
                      </Button>
                    </div>
                  </SectionCard>

                  <SectionCard title="Pricing cues">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="timeline">Timeline</Label>
                        <Input
                          id="timeline"
                          value={timeline}
                          onChange={(e) => setTimeline(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="startingAt">Starting at</Label>
                        <Input
                          id="startingAt"
                          value={startingAt}
                          onChange={(e) => setStartingAt(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="SEO" hint="Search title and description">
                    <div className="grid gap-4">
                      <div className="grid gap-1.5">
                        <Label htmlFor="seoTitle">SEO title</Label>
                        <Input
                          id="seoTitle"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label>SEO description</Label>
                        <SimpleEditor
                          value={seoDescriptionHtml}
                          onChange={setSeoDescriptionHtml}
                          placeholder="Meta description…"
                          minHeight="72px"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="seoKw">
                          Keywords (comma-separated)
                        </Label>
                        <Input
                          id="seoKw"
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                        />
                      </div>
                    </div>
                  </SectionCard>

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        <SaveIcon />
                      )}
                      {editing ? "Save changes" : "Create service"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetServiceForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : null}

              <Separator />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ServiceIcon name={row.icon} className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium">{row.title}</p>
                            <p className="text-xs text-muted-foreground">
                              /services/our-service/{row.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{groupName(row.groupId)}</TableCell>
                      <TableCell>
                        {row.published ? (
                          <Badge>Live</Badge>
                        ) : (
                          <Badge variant="secondary">Hidden</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(row)}
                          >
                            <PencilIcon />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => setPendingDeleteService(row)}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <>
              <form
                className="grid gap-4 rounded-2xl border bg-muted/15 p-4"
                onSubmit={handleSaveGroup}
              >
                <p className="text-sm font-semibold">
                  {editingGroup
                    ? `Edit group: ${editingGroup.title}`
                    : "Add group"}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Title</Label>
                    <Input
                      value={gTitle}
                      onChange={(e) => {
                        setGTitle(e.target.value);
                        if (!editingGroup) setGSlug(slugify(e.target.value));
                      }}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Slug</Label>
                    <Input
                      value={gSlug}
                      onChange={(e) => setGSlug(slugify(e.target.value))}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label>Blurb</Label>
                    <Input
                      value={gBlurb}
                      onChange={(e) => setGBlurb(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Icon</Label>
                  <IconPicker value={gIcon} onChange={setGIcon} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <SaveIcon />
                    )}
                    {editingGroup ? "Save group" : "Add group"}
                  </Button>
                  {editingGroup ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingGroup(null);
                        setGTitle("");
                        setGSlug("");
                        setGBlurb("");
                        setGIcon("Layout");
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </form>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ServiceIcon name={row.icon} className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium">{row.title}</p>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {row.blurb}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{row.slug}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingGroup(row);
                              setGTitle(row.title);
                              setGSlug(row.slug);
                              setGBlurb(row.blurb);
                              setGIcon(row.icon);
                            }}
                          >
                            <PencilIcon />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => setPendingDeleteGroup(row)}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingDeleteService !== null}
        onOpenChange={(open) => {
          if (!open && !deletingTarget) setPendingDeleteService(null);
        }}
        title={`Delete “${pendingDeleteService?.title ?? "service"}”?`}
        description="This permanently removes the service page. This cannot be undone."
        confirmLabel="Delete service"
        loading={deletingTarget}
        onConfirm={() => {
          if (pendingDeleteService) void handleDeleteService(pendingDeleteService);
        }}
      />

      <ConfirmDialog
        open={pendingDeleteGroup !== null}
        onOpenChange={(open) => {
          if (!open && !deletingTarget) setPendingDeleteGroup(null);
        }}
        title={`Delete group “${pendingDeleteGroup?.title ?? "group"}”?`}
        description="Services in this group will need a new group assigned. This cannot be undone."
        confirmLabel="Delete group"
        loading={deletingTarget}
        onConfirm={() => {
          if (pendingDeleteGroup) void handleDeleteGroup(pendingDeleteGroup);
        }}
      />
    </div>
  );
}

export default function AdminServicesPage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="Services"
      description="Types of work we do — add and edit service pages"
    >
      {() => <ServicesManager />}
    </DashboardLayout>
  );
}
