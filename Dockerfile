# ---- Base ----
FROM node:24.6.0-alpine AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm@10.15.0

# ---- Dependencies (Production) ----
FROM base AS deps
ARG NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN if [ "$NODE_ENV" = "production" ]; then \
      pnpm install --frozen-lockfile --prod; \
    else \
      pnpm install --frozen-lockfile; \
    fi

# ---- Build ----
FROM base AS builder
ARG NODE_ENV=production
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---- Release (Production) ----
FROM base AS production
ARG NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package.json .
USER appuser
EXPOSE 3000
CMD ["node", "dist/main.js"]

# ---- Development ----
FROM deps AS development
ARG NODE_ENV=development
USER root
RUN apk add --no-cache dumb-init
USER root
COPY . .
EXPOSE 3000
CMD ["dumb-init", "pnpm", "dev"]
