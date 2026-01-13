# Production image for the CrewWork backend
# Uses a multi‑stage build to keep image size small.

# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app
# Install build dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source and build
COPY src ./src
COPY tsconfig.json ./
RUN npm run build

# ---------- Final stage ----------
FROM node:20-alpine
WORKDIR /app

# Copy only the compiled output and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]

