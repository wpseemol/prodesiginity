import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FactoryIcon,
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
import { IndustryEditor } from "@/components/industries/IndustryEditor";
import {
  industryPageUrl,
  type IndustryRow,
  type ServiceOption,
} from "@/components/industries/industryTypes";
import {
  COLOR_THEMES,
  readMessage,
  themeKeyFor,
} from "@/components/services/serviceTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type View =
  | { kind: "list" }
  | { kind: "edit"; industry: IndustryRow | null };

function IndustriesManager() {
  const [view, setView] = useState<View>({ kind: "list" });
  const [industries, setIndustries] = useState<IndustryRow[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<IndustryRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const [industriesRes, servicesRes] = await Promise.all([
        apiFetch("/admin/industries"),
        apiFetch("/admin/services"),
      ]);
      if (!industriesRes.ok) {
        setError(await readMessage(industriesRes, "Could not load industries."));
        return;
      }
      const data = await industriesRes.json();
      setIndustries(data.industries ?? []);
      if (servicesRes.ok) {
        const svc = await servicesRes.json();
        setServiceOptions(
          ((svc.services ?? []) as ServiceOption[]).map((s) => ({
            slug: s.slug,
            title: s.title,
            icon: s.icon,
            group: s.group,
            published: s.published,
          })),
        );
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const query = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      industries.filter(
        (row) =>
          !query ||
          row.title.toLowerCase().includes(query) ||
          row.summary.toLowerCase().includes(query),
      ),
    [industries, query],
  );
  const visibleCount = industries.filter((row) => row.published).length;

  const togglePublished = async (row: IndustryRow) => {
    setBusyId(row.id);
    try {
      const res = await apiFetch(`/admin/industries/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ published: !row.published }),
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not update the industry."));
        return;
      }
      setIndustries((list) =>
        list.map((r) =>
          r.id === row.id ? { ...r, published: !row.published } : r,
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
      setBusyId(null);
    }
  };

  const move = async (index: number, by: number) => {
    const target = index + by;
    if (target < 0 || target >= industries.length) return;
    const previous = industries;
    const next = [...industries];
    [next[index], next[target]] = [next[target], next[index]];
    setIndustries(next);
    setSavingOrder(true);
    try {
      const res = await apiFetch("/admin/industries/order", {
        method: "PUT",
        body: JSON.stringify({ ids: next.map((row) => row.id) }),
      });
      if (!res.ok) {
        setIndustries(previous);
        toast.error(await readMessage(res, "Could not save the order."));
      }
    } catch {
      setIndustries(previous);
      toast.error("Could not reach the server.");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = async (row: IndustryRow) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/admin/industries/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not delete the industry."));
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
        Loading industries…
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load industries</AlertTitle>
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
      <IndustryEditor
        key={view.industry?.id ?? "new"}
        initial={view.industry}
        serviceOptions={serviceOptions}
        onCancel={() => setView({ kind: "list" })}
        onSaved={() => {
          setView({ kind: "list" });
          void load();
        }}
      />
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-border/70 bg-card/90">
        <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FactoryIcon className="size-4" />
              </span>
              Industries
            </CardTitle>
            <CardDescription>
              Each industry appears in the website's Industries menu and gets
              its own landing page.
            </CardDescription>
            <p className="text-xs text-muted-foreground">
              {visibleCount} of {industries.length} industries visible
              {savingOrder ? " · Saving order…" : ""}
            </p>
          </div>
          <CardAction>
            <Button
              type="button"
              onClick={() => setView({ kind: "edit", industry: null })}
            >
              <PlusIcon />
              Add industry
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="grid gap-5 pt-5">
          {industries.length === 0 ? (
            <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FactoryIcon className="size-6" />
              </span>
              <div>
                <p className="font-semibold">No industries yet</p>
                <p className="text-sm text-muted-foreground">
                  Add the industries you target and each gets its own page.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setView({ kind: "edit", industry: null })}
              >
                <PlusIcon />
                Add your first industry
              </Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search industries…"
                  className="pl-9"
                />
              </div>

              {query && filtered.length === 0 ? (
                <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No industries match your search.
                </p>
              ) : (
                <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
                  {filtered.map((row) => {
                    const index = industries.findIndex((r) => r.id === row.id);
                    const theme = COLOR_THEMES[themeKeyFor(row.accent)];
                    return (
                      <li
                        key={row.id}
                        className={cn(
                          "flex flex-col gap-3 p-4 sm:flex-row sm:items-center",
                          !row.published && "bg-muted/30",
                        )}
                      >
                        {!query ? (
                          <div className="flex shrink-0 gap-0.5 sm:flex-col">
                            <Button
                              type="button"
                              size="icon-xs"
                              variant="ghost"
                              aria-label={`Move ${row.title} up`}
                              disabled={index === 0 || savingOrder}
                              onClick={() => void move(index, -1)}
                            >
                              <ArrowUpIcon />
                            </Button>
                            <Button
                              type="button"
                              size="icon-xs"
                              variant="ghost"
                              aria-label={`Move ${row.title} down`}
                              disabled={
                                index === industries.length - 1 || savingOrder
                              }
                              onClick={() => void move(index, 1)}
                            >
                              <ArrowDownIcon />
                            </Button>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => setView({ kind: "edit", industry: row })}
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
                              {row.heroImage ? (
                                <Badge variant="outline">Image</Badge>
                              ) : null}
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
                              setView({ kind: "edit", industry: row })
                            }
                          >
                            <PencilIcon />
                            Edit
                          </Button>
                          <Button
                            type="button"
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
                          {row.published ? (
                            <a
                              href={industryPageUrl(row.slug)}
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
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
        title={`Delete “${pendingDelete?.title ?? "industry"}”?`}
        description="Its page and menu entry will be removed from the website. If you only want to take it down for now, use Hide instead."
        confirmLabel="Delete industry"
        destructive
        loading={deleting}
        onConfirm={() => {
          if (pendingDelete) void handleDelete(pendingDelete);
        }}
      />
    </div>
  );
}

export default function AdminIndustriesPage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="Industries"
      description="Add, edit and order the industries you target on your website"
    >
      {() => <IndustriesManager />}
    </DashboardLayout>
  );
}
