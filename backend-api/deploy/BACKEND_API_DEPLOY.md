# Backend API deploy (Hostinger) — simple

## Folders

| What | Path |
|------|------|
| Node app | `~/domains/api.prodesignity.com/nodejs` |
| Proxy | `~/domains/api.prodesignity.com/public_html` |

Repo files: `backend-api/deploy/proxy.php` + `backend-api/deploy/.htaccess`

---

## 1. `.env` (once)

```bash
cd ~/domains/api.prodesignity.com/nodejs
nano .env
```

```env
NODE_ENV=production
PORT=4000
ALLOWED_ORIGINS=https://prodesignity.com,https://www.prodesignity.com,https://dashboard.prodesignity.com
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=YOUR_DB_NAME
DATABASE_URL=mysql://YOUR_DB_USER:YOUR_DB_PASSWORD@127.0.0.1:3306/YOUR_DB_NAME
JWT_SECRET=long-random-string-change-me
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_EMAIL=you@prodesignity.com
SEED_ADMIN_PASSWORD=YourStrongPass1!
```

(DB values from hPanel → Databases)

---

## 2. Install + DB (once / after deploy)

```bash
cd ~/domains/api.prodesignity.com/nodejs
pnpm install --prod
pnpm exec prisma generate
pnpm run db:push
pnpm run db:seed:deploy
```

---

## 3. Proxy → `public_html`

```bash
cp ~/domains/api.prodesignity.com/nodejs/deploy/proxy.php \
   ~/domains/api.prodesignity.com/public_html/proxy.php
cp ~/domains/api.prodesignity.com/nodejs/deploy/.htaccess \
   ~/domains/api.prodesignity.com/public_html/.htaccess
```

hPanel PHP: `upload_max_filesize=128M`, `post_max_size=128M`

---

## 4. Start with pm2

```bash
cd ~/domains/api.prodesignity.com/nodejs
npx pm2 delete prodesignity-api 2>/dev/null
npx pm2 start dist/index.js --name "prodesignity-api" --max-memory-restart 200M
npx pm2 save
npx pm2 startup
```

**After every deploy:**

```bash
cd ~/domains/api.prodesignity.com/nodejs
pnpm install --prod
pnpm exec prisma generate
pnpm run db:push
npx pm2 restart prodesignity-api
npx pm2 save
```

---

## 5. Check

```bash
curl https://api.prodesignity.com/api/health
# → {"status":"ok","database":"connected",...}

curl -s http://127.0.0.1:4000/api/health
npx pm2 status
```

Also OK: `/api/team` `/api/homepage` `/api/services` `/api/settings`

Proxy supports JSON + file uploads (POST/PUT multipart).

---

## 6. If API stops

```bash
npx pm2 logs prodesignity-api --lines 100
npx pm2 restart prodesignity-api
# or recreate:
npx pm2 delete prodesignity-api
npx pm2 start dist/index.js --name "prodesignity-api" --max-memory-restart 200M
npx pm2 save
```

Optional cron (every 5 min):

```cron
*/5 * * * * curl -fsS http://127.0.0.1:4000/api/health >/dev/null || npx pm2 restart prodesignity-api
```

**Do not** use `pnpm dev` on Hostinger — only **pm2** + `dist/index.js`.

---

## 7. CORS — when the site or dashboard says "CORS error" / "Failed to fetch"

How the API decides (`src/config/cors.ts`, production only):

| Request | From an origin in `ALLOWED_ORIGINS` | From any other origin |
|---------|-------------------------------------|-----------------------|
| `GET` (services, blog, team…) | allowed, with cookies | allowed, no cookies |
| `POST` / `PUT` / `PATCH` / `DELETE` (login, forms, dashboard saves) | allowed | **blocked** |

So if public pages load but logins, contact forms or dashboard saves fail, the
origin is missing from `ALLOWED_ORIGINS`.

**Fix checklist**

1. Find the exact origin: browser DevTools → Network → the failed request →
   Request Headers → `Origin` (e.g. `https://dashboard.prodesignity.com`).
2. Check the API log — every blocked origin is printed once an hour:
   ```bash
   npx pm2 logs prodesignity-api --lines 200 | grep "\[cors\]"
   # [cors] blocked POST /api/auth/login from https://… — add it to ALLOWED_ORIGINS
   ```
   On start the API also prints `[cors] trusted origins: …` — confirm yours is there.
3. Add it to `.env` and restart:
   ```env
   ALLOWED_ORIGINS=https://prodesignity.com,https://dashboard.prodesignity.com
   ```
   ```bash
   npx pm2 restart prodesignity-api --update-env
   ```
4. Still failing with a **502** in the Network tab? That is not CORS — Node is
   down. See section 6.

**Good to know**

- Trailing slashes, paths and capital letters are ignored, and the `www.`
  twin of every entry is allowed automatically.
- `SITE_URL` and `STAFF_PORTAL_URL` (or `DASHBOARD_URL`) are trusted too if set.
- `https://*.prodesignity.com` trusts one subdomain level of your own domain.
  Never add `*.vercel.app` or other shared hosts — anyone can deploy there.
  If the dashboard runs on a Vercel URL, add that exact URL instead.
- `NODE_ENV` must be `production` on the server; in development every origin
  is allowed, which hides these problems locally.
- The frontend must be built with `NEXT_PUBLIC_API_URL=https://api.prodesignity.com/api`
  and the dashboard with the matching API URL; a build pointing at `localhost`
  looks like a CORS error in the browser.

---

## pm2 short list

```bash
npx pm2 status
npx pm2 logs prodesignity-api --lines 100
npx pm2 restart prodesignity-api
npx pm2 start dist/index.js --name "prodesignity-api" --max-memory-restart 200M
npx pm2 save
```
