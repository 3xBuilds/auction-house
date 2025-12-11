# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY apps/worker/package.json ./apps/worker/
COPY packages/queue/package.json ./packages/queue/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/queue ./packages/queue
COPY apps/worker ./apps/worker

# Build the queue package
WORKDIR /app/packages/queue
RUN npm run build

# Build the worker
WORKDIR /app/apps/worker
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/queue/package.json ./packages/queue/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files
COPY --from=builder /app/packages/queue/dist ./packages/queue/dist
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

WORKDIR /app/apps/worker

CMD ["node", "dist/index.js"]


