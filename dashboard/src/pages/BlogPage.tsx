import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExternalLinkIcon,
  FileTextIcon,
  FolderIcon,
  Loader2Icon,
  NewspaperIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const STATUS_FILTERS = { all: "All statuses", published: "Published", draft: "Drafts" } as const;
type StatusFilter = keyof typeof STATUS_FILTERS;

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
  const [opening, setOpening] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BlogPostRow | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (statusFilter === "all" || p.status === statusFilter) &&
        (!q || p.title.toLowerCase().includes(q) || p.category.name.toLowerCase().includes(q)),
    );
  }, [posts, search, statusFilter]);

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
        key={view.post?.id ?? "new"}
        initial={view.post}
        categories={categories}
        isAdmin={isAdmin}
        onCancel={() => setView({ kind: "list" })}
        onSaved={() => {
          setView({ kind: "list" });
          void load();
        }}
      />
    );
  }

  const published = posts.filter((p) => p.status === "published").length;

  const postList =
    posts.length === 0 ? (
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
      <div className="grid gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="pl-9"
              maxLength={120}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter((v as StatusFilter) ?? "all")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue>{STATUS_FILTERS[statusFilter]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_FILTERS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No articles match your filters.
          </p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {filtered.map((post) => {
              const cover = mediaUrl(post.coverImage ?? post.category.imageUrl);
              const scheduled =
                post.status === "published" && post.publishedAt && new Date(post.publishedAt) > new Date();
              return (
                <li key={post.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
                  <button
                    type="button"
                    onClick={() => void openEditor(post)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg",
                        ACCENT_SWATCH[post.accent]?.preview,
                      )}
                    >
                      {cover ? (
                        <img src={cover} alt="" className="size-full object-cover" />
                      ) : (
                        <ServiceIcon name={post.icon ?? post.category.icon ?? "FileText"} className="size-5" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{post.title}</span>
                        {post.status === "published" ? (
                          <Badge>{scheduled ? "Scheduled" : "Published"}</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                        {post.featured ? (
                          <Badge variant="outline">
                            <StarIcon />
                            Featured
                          </Badge>
                        ) : null}
                      </span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {post.category.name}
                        {isAdmin ? ` · by ${post.author.name}` : ""} · updated {formatDate(post.updatedAt)}
                        {post.publishedAt ? ` · published ${formatDate(post.publishedAt)}` : ""}
                      </span>
                    </span>
                  </button>
                  <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={opening === post.id}
                      onClick={() => void openEditor(post)}
                    >
                      {opening === post.id ? <Loader2Icon className="animate-spin" /> : <PencilIcon />}
                      Edit
                    </Button>
                    {post.status === "published" && !scheduled ? (
                      <a
                        href={blogPostUrl(post.slug)}
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
                      aria-label={`Delete ${post.title}`}
                      className="text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete(post)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-border/70 bg-card/90">
        <CardHeader className="gap-4 border-b border-border/60 bg-muted/20 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <NewspaperIcon className="size-4" />
              </span>
              {isAdmin ? "Blog" : "My articles"}
            </CardTitle>
            <CardDescription>
              Published articles appear on the website’s /blog page and in search engines.
            </CardDescription>
            <p className="text-xs text-muted-foreground">
              {published} of {posts.length} published · {categories.length} categories
            </p>
          </div>
          <Button type="button" onClick={startCreate}>
            <PlusIcon />
            New article
          </Button>
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
              <TabsContent value="posts" className="pt-3">
                {postList}
              </TabsContent>
              <TabsContent value="categories" className="pt-3">
                <BlogCategoryManager categories={categories} onChanged={load} />
              </TabsContent>
            </Tabs>
          ) : (
            postList
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
        title={`Delete “${pendingDelete?.title ?? "article"}”?`}
        description="It will be removed from the website. To take it down temporarily, switch it back to draft instead."
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
