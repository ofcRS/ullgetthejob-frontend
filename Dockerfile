# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN pnpm run build

# Runtime stage
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dumb-init for proper signal handling
RUN apk add --no-cache \
    dumb-init \
    wget \
    curl

# node:20-alpine already has 'node' user with uid/gid 1000
# Just use that user instead of creating a new one

WORKDIR /app

# Copy built application (.svelte-kit output from vite build)
COPY --from=builder --chown=node:node /app/.svelte-kit ./.svelte-kit
COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/vite.config.ts ./vite.config.ts
COPY --from=builder --chown=node:node /app/svelte.config.js ./svelte.config.js

# Ensure /app directory is writable by node user
RUN chown -R node:node /app

# Switch to node user
USER node

EXPOSE 5173

ENV NODE_ENV=production

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the preview server (for production)
CMD ["pnpm", "run", "preview", "--host", "0.0.0.0", "--port", "5173"]
