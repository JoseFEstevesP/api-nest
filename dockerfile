FROM node:24.6.0-alpine

RUN npm install -g pnpm@10.14.0

WORKDIR /home/app

COPY pnpm-lock.yaml ./
COPY package.json ./

RUN pnpm config set global-bin-dir /usr/local/bin

RUN pnpm install \
    && pnpm add -g -E @nestjs/cli

COPY . .

RUN pnpm build

CMD ["pnpm", "start"]