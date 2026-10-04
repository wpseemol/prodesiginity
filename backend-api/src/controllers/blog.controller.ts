import fs from "fs";
import path from "path";
import multer from "multer";
import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import {
  BLOG_UPLOAD_ROOT,
  fileMatchesMime,
  publicBlogUploadPath,
  UPLOADS_ROOT,
} from "../lib/uploads.js";
import {
  blogImageFileSchema,
  blogSlugParamSchema,
  blogVideoFileSchema,
  createBlogCategorySchema,
  createBlogPostSchema,
  listBlogPostsQuerySchema,
  updateBlogCategorySchema,
  updateBlogPostSchema,
  type BlogBlockInput,
} from "../lib/zod/blog.js";
import type { AuthRequest } from "../middleware/auth.js";

/* ----------------------------------------------------------------- Helpers */

const postInclude = {
  category: { select: { id: true, slug: true, name: true, icon: true, imageUrl: true } },
  author: {
    select: {
      id: true,
      fullName: true,
      role: true,
      photo: { select: { url: true } },
      teamMember: { select: { role: true, photoUrl: true } },
    },
  },
  bylineMember: { select: { id: true, name: true, role: true, photoUrl: true } },
} satisfies Prisma.BlogPostInclude;

type PostRow = Prisma.BlogPostGetPayload<{ include: typeof postInclude }>;

const PUBLIC_WHERE = (): Prisma.BlogPostWhereInput => ({
  status: "published",
  publishedAt: { lte: new Date() },
});

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function serializeAuthor(author: PostRow["author"], byline: PostRow["bylineMember"]) {
  if (byline) {
    return { id: author?.id ?? null, name: byline.name, role: byline.role, photo: byline.photoUrl || null };
  }
  if (!author) return { id: null, name: "ProDesignity Team", role: "Editorial", photo: null };
  return {
    id: author.id,
    name: author.fullName,
    role: author.teamMember?.role ?? (author.role === "admin" ? "Editor" : "Team member"),
    photo: author.teamMember?.photoUrl || author.photo?.url || null,
  };
}

function serializePost(row: PostRow, { withBody = true } = {}) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    categoryId: row.categoryId,
    category: row.category,
    author: serializeAuthor(row.author, row.bylineMember),
    authorId: row.authorId,
    bylineMemberId: row.bylineMemberId,
    coverImage: row.coverImage,
    coverAlt: row.coverAlt,
    videoUrl: row.videoUrl,
    accent: row.accent,
    icon: row.icon,
    ...(withBody
      ? {
          body: asArray(row.body),
          keyTakeaways: asArray(row.keyTakeaways),
          faqs: asArray(row.faqs),
        }
      : {}),
    tags: asArray(row.tags),
    relatedServices: asArray(row.relatedServices),
    seo: (row.seo ?? {}) as Record<string, unknown>,
    featured: row.featured,
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function slugify(value: string, max = 80) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, max);
}

/** Every heading gets a unique, URL-safe id (the table-of-contents anchor). */
function normalizeBody(blocks: BlogBlockInput[]): BlogBlockInput[] {
  const seen = new Set<string>();
  return blocks.map((block) => {
    if (block.type !== "heading") return block;
    const base = slugify(block.id || block.text) || "section";
    let id = base;
    for (let n = 2; seen.has(id); n += 1) id = `${base}-${n}`;
    seen.add(id);
    return { ...block, id };
  });
}

function parseId(raw: unknown): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function firstIssue(error: { issues: { message: string; path: PropertyKey[] }[] }, fallback: string) {
  const issue = error.issues[0];
  if (!issue) return fallback;
  return issue.message;
}

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

const isAdmin = (req: AuthRequest) => req.user?.role === "admin";

function canManagePost(req: AuthRequest, post: { authorId: number | null }) {
  return isAdmin(req) || (post.authorId !== null && post.authorId === req.user?.userId);
}

/**
 * Deletes a replaced upload, but only inside /uploads/blog and only when no
 * other post or category still points at it.
 */
function removeBlogUpload(publicPath: string | null | undefined) {
  if (!publicPath?.startsWith("/uploads/blog/")) return;
  const abs = path.resolve(UPLOADS_ROOT, `.${publicPath.slice("/uploads".length)}`);
  if (!abs.startsWith(BLOG_UPLOAD_ROOT + path.sep)) return;

  void Promise.all([
    prisma.blogPost.count({
      where: { OR: [{ coverImage: publicPath }, { videoUrl: publicPath }] },
    }),
    prisma.blogCategory.count({ where: { imageUrl: publicPath } }),
  ])
    .then(([posts, categories]) => {
      if (posts + categories === 0) return fs.promises.unlink(abs);
    })
    .catch(() => {});
}

/* ------------------------------------------------------------------ Public */

/** GET /api/blog — published posts (newest first) + categories that have posts. */
export const getPublicBlog = async (_req: Request, res: Response) => {
  try {
    const [categories, posts] = await Promise.all([
      prisma.blogCategory.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { _count: { select: { posts: { where: PUBLIC_WHERE() } } } },
      }),
      prisma.blogPost.findMany({
        where: PUBLIC_WHERE(),
        orderBy: { publishedAt: "desc" },
        include: postInclude,
        take: 500,
      }),
    ]);

    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).json({
      categories: categories
        .filter((c) => c._count.posts > 0)
        .map(({ _count, ...c }) => ({ ...c, postCount: _count.posts })),
      posts: posts.map((p) => serializePost(p)),
    });
  } catch (error) {
    console.error("Public blog error:", error);
    return res.status(500).json({ message: "Failed to load blog" });
  }
};

/** GET /api/blog/:slug — one published post. */
export const getPublicBlogPost = async (req: Request, res: Response) => {
  try {
    const slug = blogSlugParamSchema.safeParse(req.params.slug);
    if (!slug.success) return res.status(400).json({ message: "Invalid article address" });

    const post = await prisma.blogPost.findFirst({
      where: { ...PUBLIC_WHERE(), slug: slug.data },
      include: postInclude,
    });
    if (!post) return res.status(404).json({ message: "Article not found" });

    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).json({ post: serializePost(post) });
  } catch (error) {
    console.error("Public blog post error:", error);
    return res.status(500).json({ message: "Failed to load article" });
  }
};

/* -------------------------------------------------------------- Categories */

export const listBlogCategories = async (_req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { posts: true } } },
    });
    return res.status(200).json({
      categories: categories.map(({ _count, ...c }) => ({ ...c, postCount: _count.posts })),
    });
  } catch (error) {
    console.error("List blog categories error:", error);
    return res.status(500).json({ message: "Failed to load categories" });
  }
};

export const createBlogCategory = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createBlogCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: firstIssue(parsed.error, "Invalid category") });
    }
    const d = parsed.data;
    const count = await prisma.blogCategory.count();
    const category = await prisma.blogCategory.create({
      data: {
        name: d.name,
        slug: d.slug,
        description: d.description ?? null,
        imageUrl: d.imageUrl ?? null,
        icon: d.icon ?? null,
        sortOrder: d.sortOrder ?? count + 1,
      },
    });
    return res.status(201).json({ message: "Category created", category });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({ message: "A category with this slug already exists" });
    }
    console.error("Create blog category error:", error);
    return res.status(500).json({ message: "Failed to create category" });
  }
};

export const updateBlogCategory = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid category id" });

    const parsed = updateBlogCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: firstIssue(parsed.error, "Invalid category") });
    }

    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Category not found" });

    const d = parsed.data;
    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        ...(d.name !== undefined ? { name: d.name } : {}),
        ...(d.slug !== undefined ? { slug: d.slug } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(d.imageUrl !== undefined ? { imageUrl: d.imageUrl } : {}),
        ...(d.icon !== undefined ? { icon: d.icon } : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
      },
    });

    if (d.imageUrl !== undefined && existing.imageUrl !== category.imageUrl) {
      removeBlogUpload(existing.imageUrl);
    }
    return res.status(200).json({ message: "Category updated", category });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({ message: "A category with this slug already exists" });
    }
    console.error("Update blog category error:", error);
    return res.status(500).json({ message: "Failed to update category" });
  }
};

export const deleteBlogCategory = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid category id" });

    const linked = await prisma.blogPost.count({ where: { categoryId: id } });
    if (linked > 0) {
      return res.status(400).json({
        message: `Move or delete ${linked} article(s) in this category first.`,
      });
    }
    const deleted = await prisma.blogCategory.delete({ where: { id } }).catch(() => null);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    removeBlogUpload(deleted.imageUrl);
    return res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    console.error("Delete blog category error:", error);
    return res.status(500).json({ message: "Failed to delete category" });
  }
};

/* ------------------------------------------------------------------- Posts */

/** Admin sees every post; staff only see their own. */
export const listManagedPosts = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = listBlogPostsQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ message: "Invalid filters" });
    const { status, categoryId, q } = parsed.data;

    const posts = await prisma.blogPost.findMany({
      where: {
        ...(isAdmin(req) ? {} : { authorId: req.user!.userId }),
        ...(status ? { status } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(q ? { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: postInclude,
      take: 500,
    });

    return res.status(200).json({ posts: posts.map((p) => serializePost(p, { withBody: false })) });
  } catch (error) {
    console.error("List blog posts error:", error);
    return res.status(500).json({ message: "Failed to load articles" });
  }
};

export const getManagedPost = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid article id" });

    const post = await prisma.blogPost.findUnique({ where: { id }, include: postInclude });
    if (!post) return res.status(404).json({ message: "Article not found" });
    if (!canManagePost(req, post)) {
      return res.status(403).json({ message: "You can only open your own articles" });
    }
    return res.status(200).json({ post: serializePost(post) });
  } catch (error) {
    console.error("Get blog post error:", error);
    return res.status(500).json({ message: "Failed to load article" });
  }
};

async function categoryExists(id: number) {
  return (await prisma.blogCategory.count({ where: { id } })) > 0;
}

async function memberExists(id: number) {
  return (await prisma.teamMember.count({ where: { id } })) > 0;
}

/** Team members an admin can pick as an article byline. */
export const listBylineMembers = async (_req: AuthRequest, res: Response) => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true, name: true, role: true, photoUrl: true },
    });
    return res.status(200).json({ members });
  } catch (error) {
    console.error("List byline members error:", error);
    return res.status(500).json({ message: "Failed to load team members" });
  }
};

function resolvePublishedAt(
  status: "draft" | "published",
  requested: Date | "" | null | undefined,
  current: Date | null,
): Date | null {
  if (requested instanceof Date) return requested;
  if (requested === "" || requested === null) return status === "published" ? new Date() : null;
  if (status === "published") return current ?? new Date();
  return current;
}

export const createBlogPost = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createBlogPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: firstIssue(parsed.error, "Invalid article") });
    }
    const d = parsed.data;
    if (!(await categoryExists(d.categoryId))) {
      return res.status(400).json({ message: "Selected category does not exist" });
    }

    const bylineMemberId = isAdmin(req) ? (d.bylineMemberId ?? null) : null;
    if (bylineMemberId !== null && !(await memberExists(bylineMemberId))) {
      return res.status(400).json({ message: "Selected byline team member does not exist" });
    }

    const status = d.status ?? "draft";
    const featured = isAdmin(req) ? (d.featured ?? false) : false;

    const post = await prisma.$transaction(async (tx) => {
      if (featured) await tx.blogPost.updateMany({ where: { featured: true }, data: { featured: false } });
      return tx.blogPost.create({
        data: {
          title: d.title,
          slug: d.slug,
          excerpt: d.excerpt,
          categoryId: d.categoryId,
          authorId: req.user!.userId,
          bylineMemberId,
          coverImage: d.coverImage ?? null,
          coverAlt: d.coverAlt ?? null,
          videoUrl: d.videoUrl ?? null,
          accent: d.accent ?? "indigo",
          icon: d.icon ?? null,
          body: normalizeBody(d.body) as Prisma.InputJsonValue,
          keyTakeaways: (d.keyTakeaways ?? []) as Prisma.InputJsonValue,
          faqs: (d.faqs ?? []) as Prisma.InputJsonValue,
          tags: (d.tags ?? []) as Prisma.InputJsonValue,
          relatedServices: (d.relatedServices ?? []) as Prisma.InputJsonValue,
          seo: (d.seo ?? {}) as Prisma.InputJsonValue,
          featured,
          status,
          publishedAt: resolvePublishedAt(status, d.publishedAt, null),
        },
        include: postInclude,
      });
    });

    return res.status(201).json({ message: "Article created", post: serializePost(post) });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({ message: "An article with this URL slug already exists" });
    }
    console.error("Create blog post error:", error);
    return res.status(500).json({ message: "Failed to create article" });
  }
};

export const updateBlogPost = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid article id" });

    const parsed = updateBlogPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: firstIssue(parsed.error, "Invalid article") });
    }

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Article not found" });
    if (!canManagePost(req, existing)) {
      return res.status(403).json({ message: "You can only edit your own articles" });
    }

    const d = parsed.data;
    if (d.categoryId !== undefined && !(await categoryExists(d.categoryId))) {
      return res.status(400).json({ message: "Selected category does not exist" });
    }

    const bylineMemberId = isAdmin(req) ? d.bylineMemberId : undefined;
    if (
      bylineMemberId !== undefined &&
      bylineMemberId !== null &&
      !(await memberExists(bylineMemberId))
    ) {
      return res.status(400).json({ message: "Selected byline team member does not exist" });
    }

    const status = d.status ?? existing.status;
    const featured = isAdmin(req) ? d.featured : undefined;
    const statusOrDateChanged = d.status !== undefined || d.publishedAt !== undefined;

    const post = await prisma.$transaction(async (tx) => {
      if (featured) {
        await tx.blogPost.updateMany({
          where: { featured: true, NOT: { id } },
          data: { featured: false },
        });
      }
      return tx.blogPost.update({
        where: { id },
        data: {
          ...(d.title !== undefined ? { title: d.title } : {}),
          ...(d.slug !== undefined ? { slug: d.slug } : {}),
          ...(d.excerpt !== undefined ? { excerpt: d.excerpt } : {}),
          ...(d.categoryId !== undefined ? { categoryId: d.categoryId } : {}),
          ...(d.coverImage !== undefined ? { coverImage: d.coverImage } : {}),
          ...(d.coverAlt !== undefined ? { coverAlt: d.coverAlt } : {}),
          ...(d.videoUrl !== undefined ? { videoUrl: d.videoUrl } : {}),
          ...(d.accent !== undefined ? { accent: d.accent } : {}),
          ...(d.icon !== undefined ? { icon: d.icon } : {}),
          ...(d.body !== undefined
            ? { body: normalizeBody(d.body) as Prisma.InputJsonValue }
            : {}),
          ...(d.keyTakeaways !== undefined
            ? { keyTakeaways: d.keyTakeaways as Prisma.InputJsonValue }
            : {}),
          ...(d.faqs !== undefined ? { faqs: d.faqs as Prisma.InputJsonValue } : {}),
          ...(d.tags !== undefined ? { tags: d.tags as Prisma.InputJsonValue } : {}),
          ...(d.relatedServices !== undefined
            ? { relatedServices: d.relatedServices as Prisma.InputJsonValue }
            : {}),
          ...(bylineMemberId !== undefined ? { bylineMemberId } : {}),
          ...(d.seo !== undefined ? { seo: d.seo as Prisma.InputJsonValue } : {}),
          ...(featured !== undefined ? { featured } : {}),
          ...(d.status !== undefined ? { status } : {}),
          ...(statusOrDateChanged
            ? { publishedAt: resolvePublishedAt(status, d.publishedAt, existing.publishedAt) }
            : {}),
        },
        include: postInclude,
      });
    });

    if (d.coverImage !== undefined && existing.coverImage !== post.coverImage) {
      removeBlogUpload(existing.coverImage);
    }
    if (d.videoUrl !== undefined && existing.videoUrl !== post.videoUrl) {
      removeBlogUpload(existing.videoUrl);
    }

    return res.status(200).json({ message: "Article updated", post: serializePost(post) });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({ message: "An article with this URL slug already exists" });
    }
    console.error("Update blog post error:", error);
    return res.status(500).json({ message: "Failed to update article" });
  }
};

export const deleteBlogPost = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid article id" });

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Article not found" });
    if (!canManagePost(req, existing)) {
      return res.status(403).json({ message: "You can only delete your own articles" });
    }

    await prisma.blogPost.delete({ where: { id } });
    removeBlogUpload(existing.coverImage);
    removeBlogUpload(existing.videoUrl);
    return res.status(200).json({ message: "Article deleted" });
  } catch (error) {
    console.error("Delete blog post error:", error);
    return res.status(500).json({ message: "Failed to delete article" });
  }
};

/* ------------------------------------------------------------------- Media */

function discardUpload(filePath: string) {
  fs.promises.unlink(filePath).catch(() => {});
}

/** POST /api/manage/blog/media — returns `{ url, kind }` for an image or video. */
export const uploadBlogMedia = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const isVideo = file.mimetype.startsWith("video/");
    const parsed = (isVideo ? blogVideoFileSchema : blogImageFileSchema).safeParse({
      mimetype: file.mimetype,
      size: file.size,
      filename: file.filename,
    });

    if (!parsed.success) {
      discardUpload(file.path);
      return res.status(400).json({ message: firstIssue(parsed.error, "Invalid file") });
    }

    if (!fileMatchesMime(file.path, file.mimetype)) {
      discardUpload(file.path);
      console.warn(`[security] rejected spoofed upload (${file.mimetype}) from user ${req.user?.userId}`);
      return res.status(400).json({ message: "File content does not match its type" });
    }

    return res.status(201).json({
      message: "Media uploaded",
      url: publicBlogUploadPath(parsed.data.filename),
      kind: isVideo ? "video" : "image",
      mimeType: parsed.data.mimetype,
      size: parsed.data.size,
    });
  } catch (error) {
    console.error("Upload blog media error:", error);
    return res.status(500).json({ message: "Failed to upload media" });
  }
};

export function blogUploadErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Images max 5 MB, videos max 120 MB." });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof Error) return res.status(400).json({ message: err.message });
  return next(err);
}
