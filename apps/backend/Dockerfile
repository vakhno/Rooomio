# Dev stage (default): run nodemon
# Uses root package.json/lock for monorepo workspace deps (@shared/*)
FROM node:22-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared ./shared
COPY apps ./apps
RUN npm ci --ignore-scripts
WORKDIR /app/apps/backend
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production: build then run compiled app
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json .env ./
COPY shared ./shared
COPY apps ./apps
RUN npm ci --ignore-scripts
WORKDIR /app/apps/backend
RUN npm run build

FROM node:22-alpine AS prod
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared ./shared
COPY apps ./apps
RUN npm ci --ignore-scripts --omit=dev
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
WORKDIR /app/apps/backend
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "--env-file=../../.env", "./dist/index.js"]
