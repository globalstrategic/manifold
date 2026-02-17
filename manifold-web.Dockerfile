FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=localhost:8088
ARG NEXT_PUBLIC_FIREBASE_ENV=DEV
ARG NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Prevent build-time prerender from trying to load GCP secrets
ARG DOMAIN=localhost
ARG FIREBASE_API_KEY=placeholder
ARG FIREBASE_AUTH_DOMAIN=placeholder
ARG FIREBASE_PROJECT_ID=placeholder
ARG FIREBASE_STORAGE_BUCKET=placeholder
ARG FIREBASE_MESSAGING_SENDER_ID=placeholder
ARG FIREBASE_APP_ID=placeholder
ARG API_ENDPOINT=http://localhost:8088

# Prevent build-time prerender from trying to load GCP secrets
ENV DOMAIN=${DOMAIN}
ENV FIREBASE_API_KEY=${FIREBASE_API_KEY}
ENV FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
ENV FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
ENV FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
ENV FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
ENV FIREBASE_APP_ID=${FIREBASE_APP_ID}
ENV SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-placeholder}
ENV API_ENDPOINT=${API_ENDPOINT}
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
