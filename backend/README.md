# ProDesignity API — standalone

Express + Prisma API. Runs with **npm** only (not tied to the monorepo frontend/dashboard).

## Quick start

```bash
cd backend
cp .env.example .env   # edit DB + JWT
npm install
npm run db:setup       # generate + db push + seed
npm run dev            # http://localhost:4000
```

Health: `GET http://localhost:4000/api/health`

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Watch mode (`tsx`) |
| `npm run build` | Compile to `dist/` (ESM) |
| `npm start` | Run `dist/index.js` |
| `npm run db:setup` | `prisma generate` + `db push` + seed |
| `npm run db:seed` | Demo admin/employee + homepage sections |
| `npm run db:seed:deploy` | Full deploy seed (users, homepage, team, settings, services, tracking) |
| `npm run db:setup:deploy` | `generate` + `db push` + full deploy seed |
| `npm run prisma:generate` | Regenerate Prisma Client |

## Demo users (after seed)

Login at [dashboard.prodesignity.com](https://dashboard.prodesignity.com/login):

- Admin: `admin` / `DemoAdmin1!`
- Employee: `employee` / `DemoEmployee1!`

Override with `SEED_ADMIN_*` / `SEED_EMPLOYEE_*` in `.env` before seeding production.

## Production / VPS (Hostinger)

```bash
cd /path/to/api   # BACKEND_REMOTE_DIR
# ensure .env has DATABASE_URL + JWT_SECRET + ALLOWED_ORIGINS including dashboard
npm run db:setup:deploy
```

Or if schema is already pushed:

```bash
npm run db:seed:deploy
```

## Module format

`"type": "module"` — relative imports use `.js` extensions (NodeNext).

## Database

Start MySQL (Docker from repo root):

```bash
docker compose up -d mysql
```

Then `npm run db:setup` inside `backend/`.

## Env

See `.env.example`. Required: `DB_*` or `DATABASE_URL`, `JWT_SECRET`, `PORT`.
