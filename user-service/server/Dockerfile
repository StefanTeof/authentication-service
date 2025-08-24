# STAGE 1: Build
FROM node:lts-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Transpile TypeScript → JavaScript
RUN npm run build

# Copy YAML file into the build output
RUN mkdir -p dist/openapi && cp src/openapi/openapi.yaml dist/openapi/openapi.yaml

# STAGE 2: Production image
FROM node:lts-alpine

WORKDIR /app

# Copy ONLY the build output
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install only production deps
RUN npm ci --omit=dev

# Use non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 4000

CMD ["node", "dist/index.js"]
