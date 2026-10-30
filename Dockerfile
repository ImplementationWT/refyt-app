FROM node:24-bookworm-slim AS base
RUN corepack enable
WORKDIR /app

# Builds the backend (dist/) and the SPA (web/dist/).
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
COPY web ./web
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/
# The SPA's packages are build-time only (devDependencies), so only the
# backend runtime dependencies are installed here.
RUN pnpm install --prod --frozen-lockfile && pnpm store prune
COPY --from=build /app/dist ./dist
COPY --from=build /app/web/dist ./web/dist

# Configuration (MONGODB_*, SESSION_SECRET, …) is injected at runtime only,
# never baked into layers.
USER node
EXPOSE 3000
# Liveness only: /health never touches the database.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "dist/index.js"]
