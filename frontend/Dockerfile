FROM node:26-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Настройки, нужные при сборке. В GitHub Actions (.github/workflows/images.yml) .env нет,
# и они приходят аргументами. При локальной сборке аргументы не передаются, переменные
# остаются незаданными, и Next берёт значения из frontend/.env, как раньше.
# NEXT_PUBLIC_* Next вшивает в код для браузера: в готовом образе их уже не поменять
ARG NEXT_PUBLIC_ASSETS_BASE_URL
ARG ASSETS_PATHNAME
ARG ASSETS_DEV_MODE
# Сборка импортирует src/services/strapi.ts, а он требует адрес API. Сам API при
# сборке не нужен: страницы рендерятся на запрос (dynamic в src/app/layout.tsx)
ARG API_BASE_URL
RUN npm run build

FROM node:26-alpine
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
WORKDIR /app
COPY --from=builder /app/public* ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs

CMD ["node", "server.js"]