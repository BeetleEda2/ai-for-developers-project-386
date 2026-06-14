# Stage 1: build frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ .
RUN npm run build

# Stage 2: build backend
FROM node:22-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# Stage 3: runtime
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV FRONTEND_DIST_PATH=/app/frontend/dist

# Copy backend dist + production dependencies
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/node_modules ./node_modules

# Copy frontend static
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
