FROM node:20-alpine AS builder
RUN apk add --no-cache rsync
WORKDIR /app

COPY package.json yarn.lock ./
COPY common/package.json common/
COPY backend/api/package.json backend/api/
COPY backend/shared/package.json backend/shared/
COPY backend/scheduler/package.json backend/scheduler/
COPY backend/scripts/package.json backend/scripts/
COPY backend/discord-bot/package.json backend/discord-bot/
COPY web/package.json web/
COPY client-common/package.json client-common/

RUN yarn install --frozen-lockfile

COPY common/ common/
COPY backend/ backend/
COPY client-common/ client-common/
COPY web/ web/
COPY tsconfig* ./

RUN yarn --cwd=common build \
 && yarn --cwd=backend/shared build \
 && yarn --cwd=backend/api build \
 && yarn --cwd=backend/scheduler build

FROM node:20-alpine
WORKDIR /app

RUN yarn global add pm2

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/common/lib ./common/lib
COPY --from=builder /app/common/package.json ./common/
COPY --from=builder /app/backend/shared/lib ./backend/shared/lib
COPY --from=builder /app/backend/shared/package.json ./backend/shared/
COPY --from=builder /app/backend/api/lib ./backend/api/lib
COPY --from=builder /app/backend/api/package.json ./backend/api/
COPY --from=builder /app/backend/api/ecosystem.config.js ./backend/api/
COPY --from=builder /app/backend/scheduler/lib ./backend/scheduler/lib
COPY --from=builder /app/backend/scheduler/package.json ./backend/scheduler/

EXPOSE 80/tcp
CMD ["pm2-runtime", "backend/api/ecosystem.config.js"]
