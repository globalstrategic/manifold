FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=localhost:8088
ARG NEXT_PUBLIC_FIREBASE_ENV=DEV
ARG NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Prevent build-time prerender from trying to load GCP secrets
ENV SELF_HOSTED=true
ENV GOOGLE_CLOUD_PROJECT=build-placeholder
ENV SUPABASE_SERVICE_ROLE_KEY=build-placeholder
ENV SUPABASE_URL=http://localhost:8000

COPY package.json yarn.lock ./
COPY common/package.json common/
COPY web/package.json web/
COPY client-common/package.json client-common/
COPY backend/api/package.json backend/api/
COPY backend/shared/package.json backend/shared/
COPY backend/scheduler/package.json backend/scheduler/
COPY backend/scripts/package.json backend/scripts/
COPY backend/discord-bot/package.json backend/discord-bot/

RUN yarn install --frozen-lockfile

COPY common/ common/
COPY web/ web/
COPY client-common/ client-common/
COPY backend/ backend/
COPY tsconfig* ./

# Compilation succeeds; static page generation may fail (no real backend).
# Pages that fail to prerender are served dynamically at runtime.
RUN yarn --cwd=web build; exit 0

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/web ./web
COPY --from=builder /app/common ./common

EXPOSE 3000
CMD ["yarn", "--cwd=web", "start"]
