# =======================================================
# Stage 1: Build the React Frontend
# =======================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# =======================================================
# Stage 2: Production Server (Express + MCP + Frontend)
# =======================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install backend dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx

# Copy backend source files
COPY server.ts ./
COPY client.ts ./
COPY api-bridge.ts ./
COPY tsconfig.json ./
COPY database.sql ./

# Copy compiled frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

CMD ["npx", "tsx", "api-bridge.ts"]
