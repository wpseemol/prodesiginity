# Backend API deploy (Hostinger)

How to run the Express API on Hostinger, put **proxy + htaccess** in `public_html`, keep **pm2** alive, and sync MySQL.

Copy-paste commands only. Paths shown as examples — replace with your real SSH path.

---

## What goes where

| Piece | Where |
| ----- | ----- |
| Node app (`dist/`, `node_modules`, `.env`, `prisma/`) | `~/domains/api.prodesignity.com/nodejs` |
| `proxy.php` + `.htaccess` | `~/domains/api.prodesignity.com/public_html` (document root) |
| MySQL | hPanel → Databases |

Source files in this repo:

- `backend/deploy/proxy.php`
- `backend/deploy/.htaccess`

---

## 1. One-time SSH login

```bash
ssh -p YOUR_SSH_PORT YOUR_USER@YOUR_HOST
pwd
ls ~/domains
```

---

## 2. Create folders + production `.env`

```bash
mkdir -p ~/domains/api.prodesignity.com/nodejs
mkdir -p ~/domains/api.prodesignity.com/public_html
cd ~/domains/api.prodesignity.com/nodejs
nano .env
```

Minimum `.env`:

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

# Optional first admin (only used by seed)
SEED_ADMIN_NAME=Admin
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_EMAIL=you@prodesignity.com
SEED_ADMIN_PASSWORD=YourStrongPass1!
```

Get DB values from **hPanel → Databases**.  
If Hostinger shows a remote MySQL host (not localhost), use that for `DB_HOST` and `DATABASE_URL`.

---

## 3. Install Node tools (once)

```bash
node -v          # need 20+
npm i -g pnpm@10.28.0 pm2
```

---

## 4. Deploy code into `nodejs`

### Option A — GitHub Action (preferred)

Repo secret: `BACKEND_REMOTE_DIR` = absolute path to `nodejs` folder.

Then: **Actions → Deploy Backend API → Run workflow**  
(or push to `main` under `backend/**`).

### Option B — Manual from local PC

```bash
# on your PC (from repo root)
pnpm --filter prodesignity-api run build
rsync -avz --delete \
  -e "ssh -p YOUR_SSH_PORT" \
  backend/dist backend/package.json backend/prisma backend/deploy \
  YOUR_USER@YOUR_HOST:~/domains/api.prodesignity.com/nodejs/
```

On the server:

```bash
cd ~/domains/api.prodesignity.com/nodejs
pnpm install --prod
pnpm exec prisma generate
```

---

## 5. Database (schema + seed)

```bash
cd ~/domains/api.prodesignity.com/nodejs

# Create / update tables
pnpm run db:push
# or: pnpm exec prisma db push

# Homepage CMS + optional admin (needs SEED_ADMIN_* in .env)
pnpm run db:seed:deploy
```

### Import local MySQL dump (optional)

On local PC:

```bash
mysqldump -u admin -p pro_designity_db > prodesignity.sql
```

On Hostinger: **phpMyAdmin → Import**, or:

```bash
mysql -u YOUR_DB_USER -p YOUR_DB_NAME < prodesignity.sql
```

Then run `pnpm run db:push` once so schema matches code.

---

## 6. Put proxy files in `public_html`

From the server `nodejs` folder (after deploy includes `deploy/`):

```bash
cp ~/domains/api.prodesignity.com/nodejs/deploy/proxy.php \
   ~/domains/api.prodesignity.com/public_html/proxy.php

cp ~/domains/api.prodesignity.com/nodejs/deploy/.htaccess \
   ~/domains/api.prodesignity.com/public_html/.htaccess
```

Or upload both files with FTP into the **api** subdomain document root.

Edit port only if needed (top of `proxy.php`):

```php
$BACKEND_ORIGIN = getenv('PRODESIGNITY_BACKEND') ?: 'http://127.0.0.1:4000';
```

hPanel → PHP Config for that domain (recommended):

- `upload_max_filesize = 128M`
- `post_max_size = 128M`
- `max_execution_time = 180`

---

## 7. Start API with pm2 (keeps it from staying dead)

```bash
cd ~/domains/api.prodesignity.com/nodejs

# First start
pm2 delete prodesignity-api 2>/dev/null
pm2 start dist/index.js --name prodesignity-api --time

# Survive reboot
pm2 save
pm2 startup
# → copy/run the command pm2 prints (sudo env PATH=...)

pm2 status
curl -s http://127.0.0.1:4000/api/health
curl -s https://api.prodesignity.com/api/health
```

### After every code deploy

```bash
cd ~/domains/api.prodesignity.com/nodejs
pnpm install --prod
pnpm exec prisma generate
pnpm run db:push
pm2 restart prodesignity-api
pm2 save
curl -s http://127.0.0.1:4000/api/health
```

### If the app “stops” often

```bash
# See why it died
pm2 logs prodesignity-api --lines 200
pm2 describe prodesignity-api

# Auto-restart on crash + memory limit (512MB example)
pm2 delete prodesignity-api
pm2 start dist/index.js --name prodesignity-api --time --max-memory-restart 512M
pm2 save

# Optional: cron ping every 5 min (restarts if health fails)
crontab -e
```

Add this cron line:

```cron
*/5 * * * * curl -fsS http://127.0.0.1:4000/api/health >/dev/null || /usr/bin/pm2 restart prodesignity-api
```

Common stop causes:

| Symptom | Fix |
| ------- | --- |
| 502 from proxy | Node down → `pm2 restart prodesignity-api` |
| Worked then died after SSH logout | You started with `node`/`pnpm dev` instead of **pm2** |
| Dies after deploy | Always `pm2 restart` after upload |
| Memory kill | `--max-memory-restart 512M` + check logs |
| DB errors | Fix `.env` DB_* ; health must show `"database":"connected"` |
| Reboot | `pm2 startup` + `pm2 save` must be done once |

**Never** run `pnpm dev` / `tsx watch` on Hostinger production.

---

## 8. Proxy supports (POST + file uploads)

The bridge forwards:

| Request | Supported |
| ------- | --------- |
| GET / HEAD / OPTIONS | Yes |
| POST / PUT / PATCH / DELETE JSON | Yes |
| POST `multipart/form-data` (photos, logos) | Yes (rebuilds `$_FILES`) |
| PUT / PATCH multipart (team edit with photo) | Yes (raw body) |
| Large homepage video (≤120MB) | Yes if PHP limits ≥128M |

Quick tests:

```bash
# Public
curl -s https://api.prodesignity.com/api/health
curl -s https://api.prodesignity.com/api/team
curl -s https://api.prodesignity.com/api/homepage

# Login (JSON POST)
curl -s -X POST https://api.prodesignity.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"YourStrongPass1!"}'

# File POST (team photo) — needs admin Bearer token
curl -s -X POST https://api.prodesignity.com/api/admin/team \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Test User" \
  -F "role=Designer" \
  -F "username=testuser" \
  -F "password=TestUser1!" \
  -F "photo=@./photo.jpg"
```

If JSON POST works but file POST fails:

1. PHP `upload_max_filesize` / `post_max_size` too small  
2. Proxy not updated (old `proxy.php` broke multipart)  
3. Node not running (`curl http://127.0.0.1:4000/api/health`)

---

## 9. CORS / frontend URLs

Production clients must call **`https://api.prodesignity.com/api/...`** (through the proxy), not `localhost:4000`.

`.env` must include every browser origin that writes:

```env
ALLOWED_ORIGINS=https://prodesignity.com,https://www.prodesignity.com,https://dashboard.prodesignity.com
```

Then:

```bash
pm2 restart prodesignity-api
```

---

## 10. Useful pm2 cheatsheet

```bash
pm2 status
pm2 logs prodesignity-api --lines 100
pm2 restart prodesignity-api
pm2 stop prodesignity-api
pm2 start prodesignity-api
pm2 delete prodesignity-api
pm2 save
pm2 resurrect
```

---

## 11. Verify checklist

```bash
curl -s http://127.0.0.1:4000/api/health
# → {"status":"ok","database":"connected",...}

curl -s https://api.prodesignity.com/api/health
# → same via proxy

pm2 status
# → prodesignity-api online

ls ~/domains/api.prodesignity.com/public_html
# → proxy.php  .htaccess
```

Browser: open site Network tab → API host should be `api.prodesignity.com`.  
Dashboard login: `https://dashboard.prodesignity.com/login`.

---

## Related

- Repo overview: `deploy/HOSTINGER.md`
- Proxy source: `backend/deploy/proxy.php`
- Rewrite rules: `backend/deploy/.htaccess`
