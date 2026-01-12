# Stage 1: Build backend
FROM node:20-alpine AS backend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Stage 2: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --silent
COPY frontend .
RUN npm run build

# Stage 3: Final image
FROM node:20-alpine
WORKDIR /app
# Copy backend runtime files
COPY --from=backend-build /app/dist ./dist
# Copy necessary runtime dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production
# Expose backend API port
EXPOSE 3000
CMD ["node", "dist/server.js"]
