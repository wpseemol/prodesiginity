-- Blog tables (BlogCategory, BlogPost). Safe to run more than once.
-- Run with: pnpm db:ensure-blog

CREATE TABLE IF NOT EXISTS `blog_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` VARCHAR(512) NULL,
    `image_url` VARCHAR(512) NULL,
    `icon` VARCHAR(64) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_categories_slug_key`(`slug`),
    INDEX `blog_categories_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blog_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(160) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `excerpt` VARCHAR(600) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `author_id` INTEGER NULL,
    `cover_image` VARCHAR(512) NULL,
    `cover_alt` VARCHAR(255) NULL,
    `video_url` VARCHAR(512) NULL,
    `accent` VARCHAR(16) NOT NULL DEFAULT 'indigo',
    `icon` VARCHAR(64) NULL,
    `body` JSON NOT NULL,
    `key_takeaways` JSON NOT NULL,
    `faqs` JSON NOT NULL,
    `tags` JSON NOT NULL,
    `seo` JSON NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    INDEX `blog_posts_category_id_idx`(`category_id`),
    INDEX `blog_posts_author_id_idx`(`author_id`),
    INDEX `blog_posts_status_published_at_idx`(`status`, `published_at`),
    PRIMARY KEY (`id`),
    CONSTRAINT `blog_posts_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `blog_posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
