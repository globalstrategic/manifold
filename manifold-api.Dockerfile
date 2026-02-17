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
 && yarn --cwd=backend/api build

FROM node:20-alpine
WORKDIR /app

RUN yarn global add pm2

COPY --from=builder /app/backend/api/dist/ ./
COPY --from=builder /app/backend/api/ecosystem.config.js ./

RUN yarn install --frozen-lockfile --production

EXPOSE 80/tcp
CMD ["pm2-runtime", "ecosystem.config.js"]
