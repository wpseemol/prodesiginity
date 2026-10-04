import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FolderIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type View =
  | { kind: "list" }
  | { kind: "edit"; service: ServiceRow | null };

const ALL = "all";

function ServicesManager() {
  const [tab, setTab] = useState<"services" | "categories">("services");
  const [view, setView] = useState<View>({ kind: "list" });
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServiceRow | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const serviceCount = (groupId: number) =>
    services.filter((s) => s.groupId === groupId).length;

  const sections = useMemo(() => {
    const query = search.trim().toLowerCase();
    return groups
      .filter((g) => categoryFilter === ALL || String(g.id) === categoryFilter)
      .map((group) => ({
        group,
        items: services.filter(
          (s) =>
            s.groupId === group.id &&
            (!query ||
              s.title.toLowerCase().includes(query) ||
              s.summary.toLowerCase().includes(query)),
        ),
      }))
      .filter((section) => section.items.length > 0 || !query);
  }, [groups, services, search, categoryFilter]);

  const visibleCount = services.filter((s) => s.published).length;
  const filteredCount = sections.reduce((n, s) => n + s.items.length, 0);

  const togglePublished = async (row: ServiceRow) => {
    setTogglingId(row.id);
    try {
      const res = await apiFetch(`/admin/services/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ published: !row.published }),
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not update the service."));
        return;
      }
      setServices((list) =>
        list.map((s) =>
          s.id === row.id ? { ...s, published: !row.published } : s,
        ),
      );
      toast.success(
        row.published
          ? `“${row.title}” is now hidden from the website.`
          : `“${row.title}” is now visible on the website.`,
      );
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setTogglingId(null);
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

  if (view.kind === "edit") {
    return (
      <ServiceEditor
        key={view.service?.id ?? "new"}
        groups={groups}
        initial={view.service}
        onCancel={() => setView({ kind: "list" })}
        onSaved={() => {
          setView({ kind: "list" });
          void load();
        }}
        onManageCategories={() => {
          setView({ kind: "list" });
          setTab("categories");
        }}
      />
    );
  }

  const startCreate = () => {
    if (groups.length === 0) {
      toast.info("Add a category first — every service belongs to one.");
      setTab("categories");
      return;
    }
    setView({ kind: "edit", service: null });
  };

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-border/70 bg-card/90">
        <CardHeader className="gap-4 border-b border-border/60 bg-muted/20 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BriefcaseIcon className="size-4" />
              </span>
              Services
            </CardTitle>
            <CardDescription>
              Everything here appears on the website's Services page, the
              Services menu and the homepage cards.
            </CardDescription>
            <p className="text-xs text-muted-foreground">
              {visibleCount} of {services.length} services visible ·{" "}
              {groups.length} categories
            </p>
          </div>
          <Button type="button" onClick={startCreate}>
            <PlusIcon />
            Add service
          </Button>
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
              <Button type="button" onClick={startCreate}>
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
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search services…"
                    className="pl-9"
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value ?? ALL)}
                >
                  <SelectTrigger className="w-full sm:w-56">
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
              </div>

              {search.trim() && filteredCount === 0 ? (
                <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No services match your search.
                </p>
              ) : null}

              {sections.map(({ group, items }) => (
                <section key={group.id} className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <ServiceIcon
                      name={group.icon}
                      className="size-4 text-muted-foreground"
                    />
                    <h3 className="text-sm font-semibold">{group.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {items.length}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                      No services in this category yet.
                    </p>
                  ) : (
                    <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
                      {items.map((row) => {
                        const theme =
                          COLOR_THEMES[themeKeyFor(row.accent)];
                        return (
                          <li
                            key={row.id}
                            className={cn(
                              "flex flex-col gap-3 p-4 sm:flex-row sm:items-center",
                              !row.published && "bg-muted/30",
                            )}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setView({ kind: "edit", service: row })
                              }
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
                              <span className="min-w-0">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium">{row.title}</span>
                                  {row.published ? (
                                    <Badge>On website</Badge>
                                  ) : (
                                    <Badge variant="secondary">Hidden</Badge>
                                  )}
                                </span>
                                <span className="line-clamp-1 text-xs text-muted-foreground">
                                  {row.summary}
                                </span>
                              </span>
                            </button>

                            <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setView({ kind: "edit", service: row })
                                }
                              >
                                <PencilIcon />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={togglingId === row.id}
                                onClick={() => void togglePublished(row)}
                              >
                                {togglingId === row.id ? (
                                  <Loader2Icon className="animate-spin" />
                                ) : row.published ? (
                                  <EyeOffIcon />
                                ) : (
                                  <EyeIcon />
                                )}
                                {row.published ? "Hide" : "Show"}
                              </Button>
                              {row.published ? (
                                <a
                                  href={servicePageUrl(row.slug)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[0.8rem] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                  <ExternalLinkIcon className="size-3.5" />
                                  View
                                </a>
                              ) : null}
                              <Button
                                type="button"
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
                        );
                      })}
                    </ul>
                  )}
                </section>
              ))}
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
        description="Its page will be removed from the website. If you only want to take it down for now, use Hide instead."
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
