# ProDesignity API

Express + Prisma API. Part of the monorepo **pnpm** workspace (`prodesignity-api`).

## Quick start

From repo root:

```bash
pnpm install
pnpm --filter prodesignity-api db:setup   # generate + db push + seed
pnpm --filter prodesignity-api dev        # http://localhost:4000
```

Or inside `backend/`:

```bash
cp .env.example .env   # edit DB + JWT
pnpm install           # from root is preferred
pnpm run db:setup
pnpm run dev
```

Health: `GET http://localhost:4000/api/health`

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm run dev` | Watch mode (`tsx`) |
| `pnpm run build` | Compile to `dist/` (ESM) |
| `pnpm start` | Run `dist/index.js` |
| `pnpm run db:setup` | `prisma generate` + `db push` + seed |
| `pnpm run db:seed` | Demo admin/employee + homepage sections |
| `pnpm run db:seed:deploy` | Full deploy seed (users, homepage, team, settings, services, tracking) |
| `pnpm run db:setup:deploy` | `generate` + `db push` + full deploy seed |
| `pnpm run prisma:generate` | Regenerate Prisma Client |

From monorepo root you can also use:

```bash
pnpm dev:backend
pnpm build:backend
```

## Demo users (after seed)

Login at [dashboard.prodesignity.com](https://dashboard.prodesignity.com/login):

- Admin: `admin` / `DemoAdmin1!`
- Employee: `employee` / `DemoEmployee1!`

Override with `SEED_ADMIN_*` / `SEED_EMPLOYEE_*` in `.env` before seeding production.

## Production / VPS (Hostinger)

```bash
cd /path/to/api   # BACKEND_REMOTE_DIR
# ensure .env has DATABASE_URL + JWT_SECRET + ALLOWED_ORIGINS including dashboard
corepack enable && corepack prepare pnpm@10.28.0 --activate
pnpm install
pnpm run db:setup:deploy
```

Or if schema is already pushed:

```bash
pnpm run db:seed:deploy
```

## Module format

`"type": "module"` — relative imports use `.js` extensions (NodeNext).

## Database

Start MySQL (Docker from repo root):

```bash
docker compose up -d mysql
```

Then `pnpm run db:setup` inside `backend/` (or via `--filter prodesignity-api`).

## Env

See `.env.example`. Required: `DB_*` or `DATABASE_URL`, `JWT_SECRET`, `PORT`.
