FROM node:20-alpine AS base

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable


FROM base AS deps

# Copy only lock files for caching
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile


FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build


FROM node:20-alpine AS runner

WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production

# Copy only necessary files
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]