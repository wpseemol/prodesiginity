# Why the thumbnails were blank — and the fix

Two separate things break `next/image`, and both look identical on screen: an empty box.

## 1. The host isn't whitelisted

Any remote image must have its hostname declared, or Next refuses to serve it. Your live site already loads from `i.ytimg.com` and `images.unsplash.com`, so those are probably in place — `picsum.photos` (used by the demo data) is not.

Merge this into your `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      // add your own CDN / Shopify / S3 host here when the real assets land
      // { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
```

Restart the dev server after editing this file — Next does not hot-reload it.

## 2. The local path doesn't exist

`"/portfolio/video/northbrew-cover.jpg"` resolves to `public/portfolio/video/northbrew-cover.jpg`. If that file isn't there, nothing renders and nothing is logged in the browser.

Rules:

- The file lives in `public/…`
- The `src` string never includes the word `public`
- Paths are case-sensitive on the server even if they aren't on your machine — `Northbrew-Cover.JPG` and `northbrew-cover.jpg` are different files in production

Quick check from the project root:

```bash
ls public/portfolio/video/
```

## Swapping demo art for real assets

Every demo image comes from one function in `src/data/portfolioData.ts`:

```ts
export const demoImage = (seed: string, w = 1200, h = 750) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;
```

When your real files are in `public/portfolio/`, either replace the individual `thumbnail:` strings, or point the helper at your folder and rename the files to match the seeds:

```ts
export const demoImage = (seed: string) => `/portfolio/${seed}.jpg`;
```

YouTube covers need no local file at all — `youtubeThumb("dQw4w9WgXcQ")` pulls the real
`maxresdefault.jpg` straight from YouTube. Note that not every video has a maxres version;
if one comes back blank, `hqdefault.jpg` always exists.

## The safety net

`SmartImage.tsx` wraps `next/image` and listens for the load error. When an image fails it
draws a labelled grey placeholder instead of nothing, so a missing asset shows up as a
missing asset during review rather than as a hole in the layout. Every card and modal uses
it — you should never see an empty box again, only a placeholder telling you which file to
go and find.
