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
| `npm run prisma:generate` | Regenerate Prisma Client |

## Demo users (after seed)

- Admin: `admin` / `DemoAdmin1!`
- Employee: `employee` / `DemoEmployee1!`

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
