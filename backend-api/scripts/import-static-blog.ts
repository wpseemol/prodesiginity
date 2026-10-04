/**
 * Copies the hand-written articles in frontend/src/data/blog/posts/*.json into
 * the database so they can be edited from the dashboard.
 *
 *   pnpm db:import-blog            # add articles that are not in the DB yet
 *   pnpm db:import-blog --force    # also overwrite DB articles with the same slug
 *
 * Every article goes through the same Zod schema as the dashboard API, so the
 * SQL-injection / XSS checks and block validation apply here too.
 */
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";
import { createBlogPostSchema } from "../src/lib/zod/blog.js";

type StaticPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  accent?: string;
  icon?: string;
  cover?: string;
  coverAlt?: string;
  video?: string;
  publishedAt: string;
  updatedAt?: string;
  featured?: boolean;
  author: { name: string; role: string; photo?: string };
  tags?: string[];
  keyTakeaways?: string[];
  body: unknown[];
  faqs?: { q: string; a: string }[];
  relatedServices?: string[];
  seo?: { title?: string; description?: string; keywords?: string[] };
};

const POSTS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../frontend/src/data/blog/posts",
);
const force = process.argv.includes("--force");

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Cover paths under /public are not uploads; the API only stores /uploads or https. */
function storableMedia(src: string | undefined) {
  if (!src) return null;
  return src.startsWith("/uploads/") || src.startsWith("https://") ? src : null;
}

async function loadPosts(): Promise<StaticPost[]> {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith(".json")).sort();
  return Promise.all(
    files.map(async (f) => JSON.parse(await readFile(path.join(POSTS_DIR, f), "utf8")) as StaticPost),
  );
}

async function ensureCategories(posts: StaticPost[]) {
  const ids = new Map<string, number>();
  const existingCount = await prisma.blogCategory.count();
  let order = existingCount;

  for (const post of posts) {
    if (ids.has(post.category)) continue;
    const slug = slugify(post.category);
    const found = await prisma.blogCategory.findUnique({ where: { slug } });
    if (found) {
      ids.set(post.category, found.id);
      continue;
    }
    const created = await prisma.blogCategory.create({
      data: { slug, name: post.category, icon: post.icon ?? null, sortOrder: order++ },
    });
    console.log(`+ category "${created.name}" (/${created.slug})`);
    ids.set(post.category, created.id);
  }
  return ids;
}

async function main() {
  const posts = await loadPosts();
  console.log(`Found ${posts.length} articles in ${POSTS_DIR}`);

  const members = await prisma.teamMember.findMany({
    select: { id: true, name: true, userId: true },
  });
  const memberByName = new Map(members.map((m) => [m.name.trim().toLowerCase(), m]));

  const categoryIds = await ensureCategories(posts);
  const importSlugs = posts.map((p) => p.slug);
  const otherFeatured = await prisma.blogPost.count({
    where: { featured: true, slug: { notIn: importSlugs } },
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (existing && !force) {
      console.log(`= ${post.slug} (already in the database)`);
      skipped++;
      continue;
    }

    const parsed = createBlogPostSchema.safeParse({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      categoryId: categoryIds.get(post.category),
      coverImage: storableMedia(post.cover),
      coverAlt: storableMedia(post.cover) ? post.coverAlt : undefined,
      videoUrl: post.video,
      accent: post.accent,
      icon: post.icon,
      body: post.body,
      keyTakeaways: post.keyTakeaways ?? [],
      faqs: post.faqs ?? [],
      tags: post.tags ?? [],
      relatedServices: post.relatedServices ?? [],
      seo: post.seo ?? {},
      featured: Boolean(post.featured) && otherFeatured === 0,
      status: "published",
      publishedAt: post.publishedAt,
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      console.error(`! ${post.slug}: ${issue?.path.join(".")} — ${issue?.message}`);
      failed++;
      continue;
    }
    const d = parsed.data;

    const member = memberByName.get(post.author.name.trim().toLowerCase());
    if (!member) console.warn(`  ${post.slug}: no team member named "${post.author.name}", byline falls back to the team`);

    const data = {
      title: d.title,
      excerpt: d.excerpt,
      categoryId: d.categoryId,
      authorId: member?.userId ?? null,
      bylineMemberId: member && !member.userId ? member.id : null,
      coverImage: d.coverImage ?? null,
      coverAlt: d.coverAlt ?? null,
      videoUrl: d.videoUrl ?? null,
      accent: d.accent ?? "indigo",
      icon: d.icon ?? null,
      body: d.body as Prisma.InputJsonValue,
      keyTakeaways: (d.keyTakeaways ?? []) as Prisma.InputJsonValue,
      faqs: (d.faqs ?? []) as Prisma.InputJsonValue,
      tags: (d.tags ?? []) as Prisma.InputJsonValue,
      relatedServices: (d.relatedServices ?? []) as Prisma.InputJsonValue,
      seo: (d.seo ?? {}) as Prisma.InputJsonValue,
      featured: d.featured ?? false,
      status: "published" as const,
      publishedAt: d.publishedAt instanceof Date ? d.publishedAt : new Date(post.publishedAt),
      updatedAt: new Date(post.updatedAt ?? post.publishedAt),
    };

    await prisma.$transaction(async (tx) => {
      if (data.featured) {
        await tx.blogPost.updateMany({
          where: { featured: true, NOT: { slug: post.slug } },
          data: { featured: false },
        });
      }
      if (existing) {
        await tx.blogPost.update({ where: { id: existing.id }, data });
      } else {
        await tx.blogPost.create({ data: { ...data, slug: d.slug } });
      }
    });

    if (existing) {
      console.log(`~ ${post.slug} (overwritten)`);
      updated++;
    } else {
      console.log(`+ ${post.slug}`);
      created++;
    }
  }

  console.log(
    `\nDone: ${created} added, ${updated} overwritten, ${skipped} skipped, ${failed} failed.`,
  );
  await prisma.$disconnect();
  if (failed) process.exit(1);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
