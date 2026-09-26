# Hostinger deploy — ProDesignity

Two targets:

| App                           | URL                            | How it deploys                    |
| ----------------------------- | ------------------------------ | --------------------------------- |
| Frontend (static HTML/CSS/JS) | `https://prodesignity.com`     | GitHub Action → FTP → zip extract |
| Backend (Express API)         | `https://api.prodesignity.com` | GitHub Action → SSH → pm2         |

---

## Secrets you already have

| Secret                                                    | Used by  |
| --------------------------------------------------------- | -------- |
| `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD`            | Frontend |
| `SSH_HOST` / `SSH_USERNAME` / `SSH_PASSWORD` / `SSH_PORT` | Backend  |

## Secrets / variables still to add

### Repository secret (required for backend)

| Name                 | Example                                                |
| -------------------- | ------------------------------------------------------ |
| `BACKEND_REMOTE_DIR` | `/home/u123456789/domains/api.prodesignity.com/nodejs` |

Find the real path over SSH:

```bash
pwd
ls ~/domains
```

### Repository variables (optional — defaults shown)

| Name               | Default                          |
| ------------------ | -------------------------------- |
| `SITE_URL`         | `https://prodesignity.com`       |
| `API_URL`          | `https://api.prodesignity.com`   |
| `STAFF_PORTAL_URL` | `https://dashboard.prodesignity.com` |

GitHub → **Settings → Secrets and variables → Actions → Variables**.

---

## 1. Frontend (already wired)

Push to `main` under `frontend/**` (or run **Deploy Static Site to Hostinger** manually).

Build bakes in:

- `NEXT_PUBLIC_SITE_URL=https://prodesignity.com`
- `NEXT_PUBLIC_API_URL=https://api.prodesignity.com/api`

No Node needed on the main site — Hostinger only serves static files.

---

## 2. Backend one-time VPS setup (do once over SSH)

```bash
ssh -p $SSH_PORT $SSH_USERNAME@$SSH_HOST
```

### A. Create folder + `.env`

```bash
mkdir -p "$HOME/domains/api.prodesignity.com/nodejs"
cd "$HOME/domains/api.prodesignity.com/nodejs"
nano .env
```

Minimum production `.env`:

```env
NODE_ENV=production
PORT=4000
ALLOWED_ORIGINS=https://prodesignity.com,https://www.prodesignity.com,https://dashboard.prodesignity.com

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=pro_designity_db
DATABASE_URL=mariadb://USER:PASSWORD@127.0.0.1:3306/pro_designity_db

JWT_SECRET=long-random-string
```

Put the real Hostinger MySQL host/user/password from **hPanel → Databases**.

### B. Node + pnpm + pm2

```bash
# If Node is missing, install via nvm or Hostinger Node selector
node -v   # need 20+ / 22 preferred
npm i -g pnpm@10.28.0 pm2
```

### C. Point `api.prodesignity.com` at the Node app

In **hPanel**:

1. Create subdomain **`api`** → `api.prodesignity.com`
2. Enable **Node.js** (or reverse-proxy / Cloudflare) so HTTPS hits port `4000` (or the port Hostinger assigns)
3. SSL on for the subdomain

If Hostinger gives you a “Node.js app” entry point, set it to:

```text
dist/index.js
```

and set the application root to `BACKEND_REMOTE_DIR`.

### D. Add `BACKEND_REMOTE_DIR` secret

Value = the absolute path from step A (example above).

### E. First deploy

GitHub → **Actions → Deploy Backend API to Hostinger → Run workflow**  
(optional: enable “Run prisma db push”).

Later pushes to `backend/**` on `main` deploy automatically.

### F. Prisma seed (dashboard login users + CMS)

One-time (or after empty DB), over SSH in `BACKEND_REMOTE_DIR`:

```bash
cd "$HOME/domains/api.prodesignity.com/nodejs"

# optional: create a real admin on seed
# nano .env  → SEED_ADMIN_USERNAME=... SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=...

npm run db:setup:deploy
# or, if schema already pushed:
# npm run db:seed:deploy
```

This seeds homepage CMS (and an admin only if `SEED_ADMIN_*` is set).  
Staff logins are created from the dashboard **Team members** page (auto staff account).

---

## 3. Quick verify

```bash
curl https://api.prodesignity.com/api/health
# → {"status":"ok",...}

curl https://prodesignity.com/
# → 200 homepage
```

Browser: site should call `https://api.prodesignity.com/api/...` (Network tab).  
Dashboard: `https://dashboard.prodesignity.com/login` with seeded admin.

---

## Troubleshooting

| Symptom                                        | Fix                                                       |
| ---------------------------------------------- | --------------------------------------------------------- |
| Frontend deploys but API calls go to localhost | Rebuild frontend after `API_URL` var is set; hard-refresh |
| Backend health 502                             | pm2 not running / proxy not pointing at PORT              |
| Deploy fails: missing `.env`                   | Create `.env` once on the VPS (never commit it)           |
| CORS errors                                    | Add the real site origin to `ALLOWED_ORIGINS`             |
| FTP extract fails                              | Confirm `SITE_URL` variable matches the live domain       |
