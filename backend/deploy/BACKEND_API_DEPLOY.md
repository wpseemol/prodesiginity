# Backend API deploy (Hostinger) — simple

## Folders

| What | Path |
|------|------|
| Node app | `~/domains/api.prodesignity.com/nodejs` |
| Proxy | `~/domains/api.prodesignity.com/public_html` |

Repo files: `backend/deploy/proxy.php` + `backend/deploy/.htaccess`

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

## pm2 short list

```bash
npx pm2 status
npx pm2 logs prodesignity-api --lines 100
npx pm2 restart prodesignity-api
npx pm2 start dist/index.js --name "prodesignity-api" --max-memory-restart 200M
npx pm2 save
```
