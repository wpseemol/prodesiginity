# Prodesignity

Full-stack website for [Prodesignity](https://prodesignity.com) — marketing site, auth, and API in one pnpm monorepo.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js (static export), React, Tailwind |
| Dashboard | Vite admin app |
| Backend | **Standalone** Express API (`backend/`) — npm + ESM + Prisma |

Backend is **not** part of the pnpm workspace. Run it separately:

```bash
cd backend
npm install
npm run db:setup
npm run dev
```

## Project structure

```text
prodesiginity/
├── frontend/          # Next.js site (prodesignity)
├── backend/           # Express API (prodesignity-api)
├── docker-compose.yml # MySQL + phpMyAdmin
├── pnpm-workspace.yaml
└── package.json       # root scripts
```

## Prerequisites

- Node.js 20+ (project tested on Node 26)
- [pnpm](https://pnpm.io) 10+
- Docker Desktop (for local MySQL)

## Quick start

### 1. Install dependencies

From the repo root:

```bash
pnpm install
```

### 2. Start the database

```bash
docker compose up -d
```

- MySQL: `localhost:3306`
- phpMyAdmin: [http://localhost:8183](http://localhost:8183)

DB settings live in `.env.dev` (used by Docker). Do not commit real production secrets.

### 3. Configure the API

Create `backend/.env` (see keys below). Then sync Prisma:

```bash
cd backend
pnpm exec prisma generate
pnpm exec prisma db push
cd ..
```

### 4. Run the app

From the repo root:

```bash
pnpm dev
```

| App | Default URL |
| --- | --- |
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:8000](http://localhost:8000) (or `PORT` in `backend/.env`) |

Run packages alone:

```bash
pnpm dev:frontend
pnpm dev:backend
```

Point the frontend at the API with `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8000/api`).

## Root scripts

| Command | Description |
| --- | --- |
| `pnpm install` | Install all workspace packages |
| `pnpm dev` | Frontend + backend in parallel |
| `pnpm dev:frontend` | Next.js only |
| `pnpm dev:backend` | API only |
| `pnpm build` | Build frontend and backend |
| `pnpm lint` | Lint frontend |

## Environment

### Backend (`backend/.env`)

Typical keys:

```env
PORT=8000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=
DB_NAME=pro_designity_db
DATABASE_URL=mysql://admin:password@127.0.0.1:3306/pro_designity_db
JWT_SECRET=change-me
```

Optional mail: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `TARGET_MAIL`.

### Frontend

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Main features

**Frontend**

- Marketing pages: home, about, services, blog, careers, contact
- Auth: login / register
- Dashboard (authenticated)
- API health check page

**Backend**

- Auth API: register, login (JWT)
- Prisma + MySQL/MariaDB
- CORS via `ALLOWED_ORIGINS`

Auth endpoint details: [`backend/API.md`](backend/API.md).

## Docs

- [`deploy/HOSTINGER.md`](deploy/HOSTINGER.md) — Hostinger frontend (FTP) + API (SSH) deploy
- [`backend/API.md`](backend/API.md) — authentication API
- [`backend/README.md`](backend/README.md) — Prisma commands
- [`frontend/DEPLOY.MD`](frontend/DEPLOY.MD) — frontend FTP extract details

## License

Private project — all rights reserved.
