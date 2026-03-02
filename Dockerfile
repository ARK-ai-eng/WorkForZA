# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# pnpm aktivieren
RUN corepack enable && corepack prepare pnpm@latest --activate

# Abhängigkeiten installieren (nur package files zuerst für Layer-Caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Quellcode kopieren
COPY . .

# Produktions-Build
RUN pnpm build

# ── Stage 2: Production (Nginx) ──────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Build-Artefakte aus Stage 1 kopieren
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Nginx-Konfiguration für SPA-Routing
COPY deploy/nginx-spa.conf /etc/nginx/conf.d/default.conf

# Nicht-root-Benutzer für Sicherheit
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
