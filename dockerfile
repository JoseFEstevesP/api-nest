# ---- Base ----
FROM node:24.6.0-alpine AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm@10.15.0

# ---- Dependencies ----
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ---- Build ----
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ---- Release ----
FROM base AS release
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY package.json .

# NestJS usa 'reflect-metadata' que puede requerir que package.json esté presente
# aunque las dependencias ya estén copiadas.

# Crear un usuario y grupo no root para la aplicación
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Cambiar al usuario no root
USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]
