# Storybook: run the shared design-system preview app.
FROM node:22-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared ./shared
COPY apps ./apps
RUN npm ci --ignore-scripts
WORKDIR /app/apps/storybook
EXPOSE 6006
CMD ["npm", "run", "dev"]
