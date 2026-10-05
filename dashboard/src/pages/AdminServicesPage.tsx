import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BriefcaseIcon,
  ClockIcon,
  CopyIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FolderIcon,
  LinkIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TagIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CategoryManager } from "@/components/services/CategoryManager";
import { ServiceEditor } from "@/components/services/ServiceEditor";
import {
  COLOR_THEMES,
  SERVICE_PATH,
  readMessage,
  servicePageUrl,
  themeKeyFor,
  type GroupRow,
  type ServiceRow,
} from "@/components/services/serviceTypes";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const ALL = "all";

type StatusFilter = "all" | "visible" | "hidden";

type EditorTarget =
  | { mode: "create"; groupId?: number }
  | { mode: "edit"; service: ServiceRow }
  | { mode: "copy"; service: ServiceRow };

const byOrder = (a: ServiceRow, b: ServiceRow) =>
  a.sortOrder - b.sortOrder || a.id - b.id;

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

function ServicesManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServiceRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const tab = searchParams.get("tab") === "categories" ? "categories" : "services";

  const load = async () => {
    setError(null);
    try {
      const res = await apiFetch("/admin/services");
      if (!res.ok) {
        setError(await readMessage(res, "Could not load services."));
        return;
      }
      const data = await res.json();
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (highlightId === null) return;
    const el = document.getElementById(`service-row-${highlightId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => setHighlightId(null), 2500);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  const editor = useMemo<EditorTarget | null>(() => {
    const find = (param: string | null) =>
      param ? services.find((s) => String(s.id) === param) : undefined;
    const editing = find(searchParams.get("edit"));
    if (editing) return { mode: "edit", service: editing };
    const copying = find(searchParams.get("copy"));
    if (copying) return { mode: "copy", service: copying };
    if (searchParams.get("new") !== null) {
      const groupId = Number(searchParams.get("category"));
      return {
        mode: "create",
        groupId: Number.isFinite(groupId) && groupId > 0 ? groupId : undefined,
      };
    }
    return null;
  }, [searchParams, services]);

  const openEditor = (params: Record<string, string>) =>
    setSearchParams(params, { state: { fromList: true } });

  const closeEditor = () => {
    if ((location.state as { fromList?: boolean } | null)?.fromList) {
      navigate(-1);
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const setTab = (next: "services" | "categories") =>
    setSearchParams(next === "categories" ? { tab: next } : {}, {
      replace: true,
    });

  const serviceCount = (groupId: number) =>
    services.filter((s) => s.groupId === groupId).length;

  const query = search.trim().toLowerCase();
  const filtersActive =
    query !== "" || categoryFilter !== ALL || statusFilter !== "all";

  const sections = useMemo(() => {
    const matches = (s: ServiceRow) =>
      (statusFilter === "all" ||
        (statusFilter === "visible" ? s.published : !s.published)) &&
      (!query ||
        [s.title, s.summary, s.tagline, s.slug].some((field) =>
          field.toLowerCase().includes(query),
        ));

    return groups
      .filter((g) => categoryFilter === ALL || String(g.id) === categoryFilter)
      .map((group) => ({
        group,
        all: services.filter((s) => s.groupId === group.id).sort(byOrder),
      }))
      .map((section) => ({ ...section, items: section.all.filter(matches) }))
      .filter((section) => section.items.length > 0 || !filtersActive);
  }, [groups, services, query, categoryFilter, statusFilter, filtersActive]);

  const visibleCount = services.filter((s) => s.published).length;
  const hiddenCount = services.length - visibleCount;
  const filteredCount = sections.reduce((n, s) => n + s.items.length, 0);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter(ALL);
    setStatusFilter("all");
  };

  const setPublished = async (row: ServiceRow, published: boolean) => {
    setBusyId(row.id);
    try {
      const res = await apiFetch(`/admin/services/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ published }),
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not update the service."));
        return false;
      }
      setServices((list) =>
        list.map((s) => (s.id === row.id ? { ...s, published } : s)),
      );
      return true;
    } catch {
      toast.error("Could not reach the server.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const togglePublished = async (row: ServiceRow) => {
    const next = !row.published;
    if (!(await setPublished(row, next))) return;
    toast.success(
      next
        ? `“${row.title}” is now visible on the website.`
        : `“${row.title}” is now hidden from the website.`,
      {
        action: {
          label: "Undo",
          onClick: () => void setPublished(row, row.published),
        },
      },
    );
  };

  const move = async (row: ServiceRow, direction: -1 | 1) => {
    const siblings = services
      .filter((s) => s.groupId === row.groupId)
      .sort(byOrder);
    const from = siblings.findIndex((s) => s.id === row.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= siblings.length) return;

    const reordered = [...siblings];
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];

    const slots = siblings.map((s) => s.sortOrder);
    const distinct = new Set(slots).size === slots.length;
    const base = Math.min(...slots);
    const nextOrder = new Map(
      reordered.map((s, index) => [s.id, distinct ? slots[index] : base + index]),
    );
    const changed = reordered.filter((s) => nextOrder.get(s.id) !== s.sortOrder);

    setServices((list) =>
      list.map((s) =>
        nextOrder.has(s.id) ? { ...s, sortOrder: nextOrder.get(s.id)! } : s,
      ),
    );
    setBusyId(row.id);
    try {
      const results = await Promise.all(
        changed.map((s) =>
          apiFetch(`/admin/services/${s.id}`, {
            method: "PUT",
            body: JSON.stringify({ sortOrder: nextOrder.get(s.id) }),
          }),
        ),
      );
      if (results.some((res) => !res.ok)) {
        toast.error("Could not save the new order.");
        await load();
      }
    } catch {
      toast.error("Could not reach the server.");
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (row: ServiceRow) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/admin/services/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not delete the service."));
        return;
      }
      setPendingDelete(null);
      toast.success(`“${row.title}” was deleted.`);
      await load();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDeleting(false);
    }
  };

  const startCreate = (groupId?: number) => {
    if (groups.length === 0) {
      toast.info("Add a category first — every service belongs to one.");
      setTab("categories");
      return;
    }
    openEditor(groupId ? { new: "1", category: String(groupId) } : { new: "1" });
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

  if (editor) {
    const source = editor.mode === "create" ? null : editor.service;
    return (
      <ServiceEditor
        key={`${editor.mode}-${source?.id ?? "new"}`}
        groups={groups}
        initial={source}
        duplicate={editor.mode === "copy"}
        defaultGroupId={editor.mode === "create" ? editor.groupId : undefined}
        onCancel={closeEditor}
        onSaved={(savedId) => {
          closeEditor();
          void load().then(() => {
            if (savedId) setHighlightId(savedId);
          });
        }}
        onManageCategories={() => setSearchParams({ tab: "categories" })}
      />
    );
  }

  const stats: {
    id: StatusFilter | "categories";
    label: string;
    value: number;
    icon: typeof BriefcaseIcon;
    tone: string;
  }[] = [
    { id: "all", label: "All services", value: services.length, icon: BriefcaseIcon, tone: "bg-primary/10 text-primary" },
    { id: "visible", label: "On website", value: visibleCount, icon: EyeIcon, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { id: "hidden", label: "Hidden", value: hiddenCount, icon: EyeOffIcon, tone: "bg-muted text-muted-foreground" },
    { id: "categories", label: "Categories", value: groups.length, icon: FolderIcon, tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const active =
            stat.id === "categories"
              ? tab === "categories"
              : tab === "services" && statusFilter === stat.id;
          return (
            <button
              key={stat.id}
              type="button"
              onClick={() => {
                if (stat.id === "categories") {
                  setTab("categories");
                } else {
                  setTab("services");
                  setStatusFilter(stat.id);
                }
              }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40",
                active && "border-primary ring-2 ring-primary/15",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  stat.tone,
                )}
              >
                <stat.icon className="size-5" />
              </span>
              <span>
                <span className="block text-2xl font-semibold leading-none">
                  {stat.value}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden border-border/70 bg-card/90">
        <CardHeader className="gap-4 border-b border-border/60 bg-muted/20 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {tab === "categories" ? (
                  <FolderIcon className="size-4" />
                ) : (
                  <BriefcaseIcon className="size-4" />
                )}
              </span>
              {tab === "categories" ? "Categories" : "Services"}
            </CardTitle>
            <CardDescription>
              {tab === "categories"
                ? "Categories are the headings that group services in the website menu."
                : "Everything here appears on the website's Services page, the Services menu and the homepage cards. Changes show up on the website right after you save."}
            </CardDescription>
          </div>
          {tab === "services" ? (
            <Button type="button" onClick={() => startCreate()}>
              <PlusIcon />
              Add service
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="grid gap-5 pt-5">
          <div className="flex gap-1 rounded-xl bg-muted p-1 sm:w-fit">
            {(
              [
                { id: "services", label: "Services", icon: BriefcaseIcon, count: services.length },
                { id: "categories", label: "Categories", icon: FolderIcon, count: groups.length },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors sm:flex-none",
                  tab === t.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="size-4" />
                {t.label}
                <span className="text-xs text-muted-foreground">{t.count}</span>
              </button>
            ))}
          </div>

          {tab === "categories" ? (
            <CategoryManager
              groups={groups}
              serviceCount={serviceCount}
              onChanged={load}
            />
          ) : services.length === 0 ? (
            <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BriefcaseIcon className="size-6" />
              </span>
              <div>
                <p className="font-semibold">No services yet</p>
                <p className="text-sm text-muted-foreground">
                  Add your first service and it will show up on the website.
                </p>
              </div>
              <Button type="button" onClick={() => startCreate()}>
                <PlusIcon />
                Add your first service
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setSearch("");
                    }}
                    placeholder="Search by name, tagline or page address…"
                    className="pl-9 pr-16"
                  />
                  {search ? (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => {
                        setSearch("");
                        searchRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  ) : (
                    <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground sm:block">
                      /
                    </kbd>
                  )}
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value ?? ALL)}
                >
                  <SelectTrigger className="w-full sm:w-52">
                    <SelectValue>
                      {categoryFilter === ALL
                        ? "All categories"
                        : groups.find((g) => String(g.id) === categoryFilter)
                            ?.title}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All categories</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter((value as StatusFilter | null) ?? "all")
                  }
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue>
                      {statusFilter === "all"
                        ? "Any status"
                        : statusFilter === "visible"
                          ? "On website"
                          : "Hidden"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any status</SelectItem>
                    <SelectItem value="visible">On website</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filtersActive ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    Showing {filteredCount} of {services.length} services
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={clearFilters}
                  >
                    <XIcon />
                    Clear filters
                  </Button>
                </div>
              ) : null}

              {filtersActive && filteredCount === 0 ? (
                <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  <SearchIcon className="size-5" />
                  No services match these filters.
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Show all services
                  </Button>
                </div>
              ) : null}

              {sections.map(({ group, all, items }) => (
                <section key={group.id} className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <ServiceIcon
                      name={group.icon}
                      className="size-4 text-muted-foreground"
                    />
                    <h3 className="text-sm font-semibold">{group.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {filtersActive && items.length !== all.length
                        ? `${items.length} of ${all.length}`
                        : all.length}
                    </span>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      className="ml-auto text-muted-foreground"
                      onClick={() => startCreate(group.id)}
                    >
                      <PlusIcon />
                      Add service here
                    </Button>
                  </div>

                  {items.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => startCreate(group.id)}
                      className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      No services in this category yet. Click to add one.
                    </button>
                  ) : (
                    <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
                      {items.map((row) => {
                        const theme = COLOR_THEMES[themeKeyFor(row.accent)];
                        const position = all.findIndex((s) => s.id === row.id);
                        const busy = busyId === row.id;
                        return (
                          <li
                            key={row.id}
                            id={`service-row-${row.id}`}
                            className={cn(
                              "flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center",
                              !row.published && "bg-muted/30",
                              highlightId === row.id && "bg-primary/10",
                            )}
                          >
                            {!filtersActive ? (
                              <div className="hidden flex-col sm:flex">
                                <Button
                                  type="button"
                                  size="icon-xs"
                                  variant="ghost"
                                  aria-label={`Move ${row.title} up`}
                                  disabled={busy || position <= 0}
                                  onClick={() => void move(row, -1)}
                                >
                                  <ArrowUpIcon />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon-xs"
                                  variant="ghost"
                                  aria-label={`Move ${row.title} down`}
                                  disabled={busy || position >= all.length - 1}
                                  onClick={() => void move(row, 1)}
                                >
                                  <ArrowDownIcon />
                                </Button>
                              </div>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => openEditor({ edit: String(row.id) })}
                              className="flex min-w-0 flex-1 items-center gap-3 text-left"
                            >
                              <span
                                className={cn(
                                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                                  theme.preview,
                                  !row.published && "opacity-50",
                                )}
                              >
                                <ServiceIcon name={row.icon} className="size-5" />
                              </span>
                              <span className="grid min-w-0 gap-0.5">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium">{row.title}</span>
                                  {row.published ? null : (
                                    <Badge variant="secondary">Hidden</Badge>
                                  )}
                                </span>
                                <span className="line-clamp-1 text-xs text-muted-foreground">
                                  {row.tagline || row.summary}
                                </span>
                                <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                                  {row.timeline ? (
                                    <span className="inline-flex items-center gap-1">
                                      <ClockIcon className="size-3" />
                                      {row.timeline}
                                    </span>
                                  ) : null}
                                  {row.startingAt ? (
                                    <span className="inline-flex items-center gap-1">
                                      <TagIcon className="size-3" />
                                      {row.startingAt}
                                    </span>
                                  ) : null}
                                  <span className="inline-flex min-w-0 items-center gap-1">
                                    <LinkIcon className="size-3 shrink-0" />
                                    <span className="truncate">
                                      {SERVICE_PATH}/{row.slug}
                                    </span>
                                  </span>
                                </span>
                              </span>
                            </button>

                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                              <div
                                className="flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium"
                                title={
                                  row.published
                                    ? "Visible on the website — switch off to hide it"
                                    : "Hidden — switch on to show it on the website"
                                }
                              >
                                {busy ? (
                                  <Loader2Icon className="size-3.5 animate-spin" />
                                ) : null}
                                <span
                                  className={cn(
                                    "w-16",
                                    row.published
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {row.published ? "On website" : "Hidden"}
                                </span>
                                <Switch
                                  size="sm"
                                  checked={row.published}
                                  disabled={busy}
                                  aria-label={`Show ${row.title} on the website`}
                                  onCheckedChange={() => void togglePublished(row)}
                                />
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => openEditor({ edit: String(row.id) })}
                              >
                                <PencilIcon />
                                Edit
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      type="button"
                                      size="icon-sm"
                                      variant="ghost"
                                      aria-label={`More actions for ${row.title}`}
                                    />
                                  }
                                >
                                  <MoreHorizontalIcon />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                  {row.published ? (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        window.open(
                                          servicePageUrl(row.slug),
                                          "_blank",
                                          "noopener,noreferrer",
                                        )
                                      }
                                    >
                                      <ExternalLinkIcon />
                                      View on website
                                    </DropdownMenuItem>
                                  ) : null}
                                  <DropdownMenuItem
                                    onClick={() => openEditor({ copy: String(row.id) })}
                                  >
                                    <CopyIcon />
                                    Duplicate
                                  </DropdownMenuItem>
                                  {!filtersActive ? (
                                    <>
                                      <DropdownMenuItem
                                        className="sm:hidden"
                                        disabled={position <= 0}
                                        onClick={() => void move(row, -1)}
                                      >
                                        <ArrowUpIcon />
                                        Move up
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="sm:hidden"
                                        disabled={position >= all.length - 1}
                                        onClick={() => void move(row, 1)}
                                      >
                                        <ArrowDownIcon />
                                        Move down
                                      </DropdownMenuItem>
                                    </>
                                  ) : null}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setPendingDelete(row)}
                                  >
                                    <Trash2Icon />
                                    Delete…
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              ))}

              {!filtersActive && services.length > 1 ? (
                <p className="text-center text-xs text-muted-foreground">
                  Use the arrows to change the order services appear in on the
                  website.
                </p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
        title={`Delete “${pendingDelete?.title ?? "service"}”?`}
        description="Its page will be removed from the website. This cannot be undone. If you only want to take it down for now, switch it to Hidden instead."
        confirmLabel="Delete service"
        destructive
        loading={deleting}
        onConfirm={() => {
          if (pendingDelete) void handleDelete(pendingDelete);
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
      description="Add, edit and organise the services shown on your website"
    >
      {() => <ServicesManager />}
    </DashboardLayout>
  );
}
