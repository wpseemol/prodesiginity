# Prodesignity API (Express + Prisma)
# Build from monorepo root:
#   docker build -f backend/Dockerfile -t prodesignity-api .

FROM node:22-bookworm-slim AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY backend/package.json ./backend/
# Needed before pnpm install because postinstall runs `prisma generate`
COPY backend/prisma ./backend/prisma

RUN pnpm install --filter prodesignity-api...

COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

RUN pnpm --filter prodesignity-api exec prisma generate
RUN pnpm --filter prodesignity-api run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/.npmrc ./
COPY --from=build /app/backend/package.json ./backend/
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules

WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "dist/index.js"]
