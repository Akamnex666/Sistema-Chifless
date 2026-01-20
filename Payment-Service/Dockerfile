# ========================================
# Stage 1: Dependencies
# ========================================
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# ========================================
# Stage 2: Builder
# ========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build
RUN npm run build

# ========================================
# Stage 3: Runner
# ========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

# Copiar dependencias
COPY --from=deps /app/node_modules ./node_modules

# Copiar build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Cambiar ownership
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3002

ENV PORT=3002

CMD ["node", "dist/main.js"]
