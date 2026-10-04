import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClockIcon,
  EyeOffIcon,
  ExternalLinkIcon,
  FilePenLineIcon,
  FileTextIcon,
  FolderIcon,
  GlobeIcon,
  HistoryIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  NewspaperIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { blogDraftKey, loadLocalDraft } from "@/lib/blogDrafts";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ServiceIcon } from "@/components/ServiceIcon";
import { BlogCategoryManager } from "@/components/blog/BlogCategoryManager";
import { BlogPostEditor } from "@/components/blog/BlogPostEditor";
import {
  ACCENT_SWATCH,
  blogPostUrl,
  formatDate,
  type BlogCategoryRow,
  type BlogPostRow,
} from "@/components/blog/blogTypes";
import { readMessage } from "@/components/services/serviceTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { DashboardUser } from "@/lib/session";

type View = { kind: "list" } | { kind: "edit"; post: BlogPostRow | null };

type PostState = "published" | "scheduled" | "draft";
type StatusFilter = "all" | PostState;

const STATE_STYLE: Record<PostState, { label: string; className: string }> = {
  published: {
    label: "Live",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  scheduled: {
    label: "Scheduled",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  draft: {
    label: "Draft",
    className: "border-border bg-muted text-muted-foreground",
  },
};

const STATUS_TILES: { value: StatusFilter; label: string; hint: string; icon: LucideIcon }[] = [
  { value: "all", label: "All articles", hint: "Everything you can edit", icon: NewspaperIcon },
  { value: "published", label: "Live", hint: "Visible on the website", icon: GlobeIcon },
  { value: "scheduled", label: "Scheduled", hint: "Go live automatically", icon: CalendarClockIcon },
  { value: "draft", label: "Drafts", hint: "Only the dashboard sees these", icon: FilePenLineIcon },
];

function stateOf(post: BlogPostRow): PostState {
  if (post.status !== "published") return "draft";
  return post.publishedAt && new Date(post.publishedAt) > new Date() ? "scheduled" : "published";
}

const timeOf = (ms: number) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(ms);

function BlogManager({ user }: { user: DashboardUser }) {
  const isAdmin = user.role === "admin";
  const [tab, setTab] = useState<"posts" | "categories">("posts");
  const [view, setView] = useState<View>({ kind: "list" });
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [categories, setCategories] = useState<BlogCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [opening, setOpening] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BlogPostRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingPublish, setPendingPublish] = useState<BlogPostRow | null>(null);
  const [changing, setChanging] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [postsRes, catsRes] = await Promise.all([
        apiFetch("/manage/blog/posts"),
        apiFetch("/manage/blog/categories"),
      ]);
      if (!postsRes.ok || !catsRes.ok) {
        setError(await readMessage(postsRes.ok ? catsRes : postsRes, "Could not load the blog."));
        return;
      }
      const [postsData, catsData] = await Promise.all([postsRes.json(), catsRes.json()]);
      setPosts(postsData.posts ?? []);
      setCategories(catsData.categories ?? []);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: posts.length, published: 0, scheduled: 0, draft: 0 };
    for (const p of posts) c[stateOf(p)] += 1;
    return c;
  }, [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (statusFilter === "all" || stateOf(p) === statusFilter) &&
        (categoryFilter === "all" || String(p.category.id) === categoryFilter) &&
        (!q ||
          p.title.toLowerCase().includes(q) ||
          p.slug.includes(q) ||
          p.category.name.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q)),
    );
  }, [posts, search, statusFilter, categoryFilter]);

  const filtersActive = search.trim() !== "" || statusFilter !== "all" || categoryFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const openEditor = async (post: BlogPostRow) => {
    setOpening(post.id);
    try {
      const res = await apiFetch(`/manage/blog/posts/${post.id}`);
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not open the article."));
        return;
      }
      const data = (await res.json()) as { post: BlogPostRow };
      setView({ kind: "edit", post: data.post });
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setOpening(null);
    }
  };

  const startCreate = () => {
    if (categories.length === 0) {
      if (isAdmin) {
        toast.info("Create a category first. Every article belongs to one.");
        setTab("categories");
      } else {
        toast.info("No categories yet. Ask an admin to create one.");
      }
      return;
    }
    setView({ kind: "edit", post: null });
  };

  const changeStatus = async (post: BlogPostRow, status: "draft" | "published") => {
    setChanging(post.id);
    try {
      const res = await apiFetch(`/manage/blog/posts/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({ status, expectedUpdatedAt: post.updatedAt }),
      });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not change the article status."));
        if (res.status === 409) await load();
        return;
      }
      toast.success(
        status === "published"
          ? `“${post.title}” is now live on the website.`
          : `“${post.title}” was taken off the website and moved to drafts.`,
      );
      await load();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setChanging(null);
      setPendingPublish(null);
    }
  };

  const handleDelete = async (post: BlogPostRow) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/manage/blog/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(await readMessage(res, "Could not delete the article."));
        return;
      }
      toast.success(`“${post.title}” was deleted.`);
      setPendingDelete(null);
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
        Loading blog…
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load the blog</AlertTitle>
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
      <BlogPostEditor
        key={view.post ? `${view.post.id}:${view.post.updatedAt}` : "new"}
        initial={view.post}
        categories={categories}
        isAdmin={isAdmin}
        userId={user.id}
        onCancel={() => {
          setView({ kind: "list" });
          void load();
        }}
        onSaved={() => {
          setView({ kind: "list" });
          void load();
        }}
        onReload={() => {
          if (view.post) void openEditor(view.post);
        }}
      />
    );
  }

  const unfinishedNew = loadLocalDraft(blogDraftKey(user.id, null));
  const hasLocalChanges = (post: BlogPostRow) => loadLocalDraft(blogDraftKey(user.id, post.id)) !== null;

  const postList =
    posts.length === 0 && !unfinishedNew ? (
      <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <NewspaperIcon className="size-6" />
        </span>
        <div>
          <p className="font-semibold">No articles yet</p>
          <p className="text-sm text-muted-foreground">Write your first article. Save it as a draft until it’s ready.</p>
        </div>
        <Button type="button" onClick={startCreate}>
          <PlusIcon />
          Write an article
        </Button>
      </div>
    ) : (
      <div className="grid gap-4">
        {unfinishedNew ? (
          <Alert>
            <HistoryIcon />
            <AlertTitle>You have an unfinished new article</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-2">
              <span>Last edited {timeOf(unfinishedNew.savedAt)} — it is kept on this device only.</span>
              <Button type="button" size="sm" onClick={startCreate}>
                Continue writing
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {STATUS_TILES.map((tile) => {
            const active = statusFilter === tile.value;
            return (
              <button
                key={tile.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(active && tile.value !== "all" ? "all" : tile.value)}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border p-3 text-left transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30" : "hover:border-primary/30 hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <tile.icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xl leading-none font-semibold tabular-nums">{counts[tile.value]}</span>
                  <span className="mt-1 block text-sm font-medium">{tile.label}</span>
                  <span className="hidden text-xs text-muted-foreground sm:block">{tile.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAdmin ? "Search by title, category or author…" : "Search by title or category…"}
              aria-label="Search articles"
              className="pl-9"
              maxLength={120}
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-52" aria-label="Filter by category">
              <SelectValue>
                {categoryFilter === "all"
                  ? "All categories"
                  : (categories.find((c) => String(c.id) === categoryFilter)?.name ?? "All categories")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtersActive ? (
            <Button type="button" variant="ghost" onClick={clearFilters}>
              <XIcon />
              Clear
            </Button>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No articles match your filters.
            {filtersActive ? (
              <Button type="button" size="sm" variant="outline" onClick={clearFilters}>
                Show all articles
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {filtered.map((post) => {
              const cover = mediaUrl(post.coverImage ?? post.category.imageUrl);
              const state = stateOf(post);
              const busy = opening === post.id || changing === post.id;
              return (
                <li
                  key={post.id}
                  className="group/row flex items-center gap-3 p-3 transition-colors hover:bg-muted/30 sm:p-4"
                >
                  <button
                    type="button"
                    onClick={() => void openEditor(post)}
                    disabled={busy}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span
                      className={cn(
                        "flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:w-24",
                        ACCENT_SWATCH[post.accent]?.preview,
                      )}
                    >
                      {cover ? (
                        <img src={cover} alt="" loading="lazy" className="size-full object-cover" />
                      ) : (
                        <ServiceIcon name={post.icon ?? post.category.icon ?? "FileText"} className="size-5" />
                      )}
                    </span>
                    <span className="grid min-w-0 gap-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className={STATE_STYLE[state].className}>
                          {STATE_STYLE[state].label}
                        </Badge>
                        {post.featured ? (
                          <Badge variant="outline">
                            <StarIcon />
                            Featured
                          </Badge>
                        ) : null}
                        {hasLocalChanges(post) ? (
                          <Badge
                            variant="outline"
                            className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          >
                            <HistoryIcon />
                            Unsaved changes
                          </Badge>
                        ) : null}
                      </span>
                      <span className="line-clamp-1 font-medium group-hover/row:text-primary">{post.title}</span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {post.category.name}
                        {isAdmin ? ` · by ${post.author.name}` : ""}
                        {state === "scheduled" && post.publishedAt
                          ? ` · goes live ${formatDate(post.publishedAt)}`
                          : state === "published" && post.publishedAt
                            ? ` · published ${formatDate(post.publishedAt)}`
                            : ` · edited ${formatDate(post.updatedAt)}`}
                      </span>
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="hidden sm:inline-flex"
                      disabled={busy}
                      onClick={() => void openEditor(post)}
                    >
                      {opening === post.id ? <Loader2Icon className="animate-spin" /> : <PencilIcon />}
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`More actions for ${post.title}`}
                            disabled={busy}
                          />
                        }
                      >
                        {changing === post.id ? <Loader2Icon className="animate-spin" /> : <MoreHorizontalIcon />}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem className="sm:hidden" onClick={() => void openEditor(post)}>
                          <PencilIcon />
                          Edit
                        </DropdownMenuItem>
                        {state === "published" ? (
                          <DropdownMenuItem
                            onClick={() => window.open(blogPostUrl(post.slug), "_blank", "noopener,noreferrer")}
                          >
                            <ExternalLinkIcon />
                            View on website
                          </DropdownMenuItem>
                        ) : null}
                        {state === "draft" ? (
                          <DropdownMenuItem onClick={() => setPendingPublish(post)}>
                            <GlobeIcon />
                            Publish now
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => void changeStatus(post, "draft")}>
                            <EyeOffIcon />
                            Move to drafts
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setPendingDelete(post)}>
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
        {filtered.length > 0 && filtersActive ? (
          <p className="text-center text-xs text-muted-foreground">
            Showing {filtered.length} of {posts.length} articles
          </p>
        ) : null}
      </div>
    );

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-border/70 bg-card/90">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <NewspaperIcon className="size-4" />
            </span>
            {isAdmin ? "Blog" : "My articles"}
          </CardTitle>
          <CardDescription>
            Live articles appear on the website’s blog and in search engines. Drafts stay private to the dashboard.
          </CardDescription>
          <CardAction>
            <Button type="button" onClick={startCreate}>
              <PlusIcon />
              <span className="hidden sm:inline">New article</span>
              <span className="sm:hidden">New</span>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="pt-5">
          {isAdmin ? (
            <Tabs value={tab} onValueChange={(v) => setTab(v as "posts" | "categories")}>
              <TabsList>
                <TabsTrigger value="posts">
                  <FileTextIcon />
                  Articles
                  <span className="text-xs text-muted-foreground">{posts.length}</span>
                </TabsTrigger>
                <TabsTrigger value="categories">
                  <FolderIcon />
                  Categories
                  <span className="text-xs text-muted-foreground">{categories.length}</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="posts" className="pt-4">
                {postList}
              </TabsContent>
              <TabsContent value="categories" className="pt-4">
                <BlogCategoryManager categories={categories} onChanged={load} />
              </TabsContent>
            </Tabs>
          ) : (
            postList
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingPublish !== null}
        onOpenChange={(open) => {
          if (!open && changing === null) setPendingPublish(null);
        }}
        title={`Publish “${pendingPublish?.title ?? "article"}”?`}
        description="Everyone visiting the website will be able to read it and search engines will index it. You can move it back to drafts at any time."
        confirmLabel="Publish now"
        destructive={false}
        loading={pendingPublish !== null && changing === pendingPublish.id}
        onConfirm={() => {
          if (pendingPublish) void changeStatus(pendingPublish, "published");
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
        title={`Delete “${pendingDelete?.title ?? "article"}”?`}
        description="This permanently removes the article and cannot be undone. To take it down temporarily, choose “Move to drafts” instead."
        confirmLabel="Delete article"
        loading={deleting}
        onConfirm={() => {
          if (pendingDelete) void handleDelete(pendingDelete);
        }}
      />
    </div>
  );
}

export function AdminBlogPage() {
  return (
    <DashboardLayout expectedRole="admin" title="Blog" description="Write articles and manage blog categories">
      {({ user }) => <BlogManager user={user} />}
    </DashboardLayout>
  );
}

export function StaffBlogPage() {
  return (
    <DashboardLayout expectedRole="employer" title="My articles" description="Write and edit your blog articles">
      {({ user }) => <BlogManager user={user} />}
    </DashboardLayout>
  );
}
