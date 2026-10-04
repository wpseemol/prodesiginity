import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

async function columnExists(table: string, column: string) {
  const rows = await prisma.$queryRawUnsafe<{ Field: string }[]>(
    `SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`,
  );
  return rows.length > 0;
}

async function indexExists(table: string, index: string) {
  const rows = await prisma.$queryRawUnsafe<{ Key_name: string }[]>(
    `SHOW INDEX FROM \`${table}\` WHERE Key_name = '${index}'`,
  );
  return rows.length > 0;
}

async function main() {
  if (!(await columnExists("blog_posts", "byline_member_id"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `blog_posts` ADD COLUMN `byline_member_id` INTEGER NULL AFTER `author_id`",
    );
    console.log("Added blog_posts.byline_member_id");
  }
  if (!(await indexExists("blog_posts", "blog_posts_byline_member_id_idx"))) {
    await prisma.$executeRawUnsafe(
      "CREATE INDEX `blog_posts_byline_member_id_idx` ON `blog_posts`(`byline_member_id`)",
    );
  }
  const fk = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT COUNT(*) AS n FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blog_posts'
       AND CONSTRAINT_NAME = 'blog_posts_byline_member_id_fkey'`,
  );
  if (Number(fk[0]?.n ?? 0) === 0) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_byline_member_id_fkey` FOREIGN KEY (`byline_member_id`) REFERENCES `team_members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE",
    );
    console.log("Added byline foreign key");
  }
  if (!(await columnExists("blog_posts", "related_services"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `blog_posts` ADD COLUMN `related_services` JSON NULL AFTER `tags`",
    );
    console.log("Added blog_posts.related_services");
  }
  console.log("Blog columns are up to date.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
