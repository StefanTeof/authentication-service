# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# --- build ---
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_CLIENT_SUCCESS_REDIRECT
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_CLIENT_SUCCESS_REDIRECT=${NEXT_PUBLIC_CLIENT_SUCCESS_REDIRECT}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- run ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
