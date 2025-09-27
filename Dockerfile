FROM node:20-slim

# Install curl and required system libraries for ONNX Runtime
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files for backend
COPY package*.json ./

# Install backend dependencies
RUN npm ci

# Copy source code
COPY . .

# Build backend
RUN npm run build

# Build frontend
WORKDIR /app/frontend
RUN npm ci
RUN npm run build

# Go back to app directory and ensure frontend build is accessible
WORKDIR /app

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev
RUN cd frontend && npm prune --omit=dev

# Create data directory for SQLite and model cache
RUN mkdir -p /app/data /app/.cache

# Expose ports
EXPOSE 8080 8090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Start the application
CMD ["npm", "start"]
