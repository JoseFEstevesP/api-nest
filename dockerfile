FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /home/app

COPY pnpm-lock.yaml ./
COPY package.json ./

RUN pnpm config set global-bin-dir /usr/local/bin

RUN pnpm install \
    && pnpm add -g -E @nestjs/cli

COPY . .

RUN if [ "$NODE_ENV" = "production" ]; then pnpm build; fi

CMD if [ "$NODE_ENV" = "production" ]; then pnpm start:prod; else pnpm dev; fi