# Dev stage (default): run Vite dev server
# Uses root package.json/lock for monorepo workspace deps (@shared/*)
FROM node:22-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared ./shared
COPY apps ./apps
RUN npm ci --ignore-scripts
WORKDIR /app/apps/frontend
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Production: build then serve static files
FROM node:22-alpine AS builder
WORKDIR /app
ARG VITE_APP_URL
ARG VITE_API_URL
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package.json package-lock.json ./
COPY shared ./shared
COPY apps ./apps
RUN npm ci --ignore-scripts
WORKDIR /app/apps/frontend
RUN npm run build

FROM node:22-alpine AS prod
WORKDIR /app
RUN corepack enable && npm install -g serve
COPY --from=builder /app/frontend/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
