#!/bin/bash
# WorkforZA — Manuelles Deployment-Skript
# Verwendung: ./deploy/deploy.sh
# Voraussetzung: Skript auf dem VPS ausführen als Benutzer 'workforza'

set -e

APP_DIR="/home/workforza/WorkForZA"
LOG_FILE="/home/workforza/deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
  echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

log "🚀 WorkforZA Deployment gestartet"

# Ins App-Verzeichnis wechseln
cd "$APP_DIR" || { log "❌ Verzeichnis $APP_DIR nicht gefunden"; exit 1; }

# Aktuellen Branch und Commit loggen
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "📌 Branch: $CURRENT_BRANCH"

# Neuesten Code holen
log "📥 Code aktualisieren..."
git pull origin main
NEW_COMMIT=$(git rev-parse --short HEAD)
log "📌 Neuer Commit: $NEW_COMMIT"

# Docker-Image bauen
log "🔨 Docker-Image bauen..."
docker build -t workforza:latest . 2>&1 | tee -a "$LOG_FILE"

# Container neu starten (Zero-Downtime soweit möglich)
log "🔄 Container neu starten..."
docker compose down
docker compose up -d

# Auf Container-Start warten
log "⏳ Warten auf Container-Start..."
sleep 5

# Health-Check
if docker compose ps | grep -q "healthy\|Up"; then
  log "✅ Container läuft erfolgreich"
else
  log "⚠️  Container-Status unklar, bitte manuell prüfen"
  docker compose ps
fi

# Alte Docker-Images aufräumen
log "🧹 Alte Images aufräumen..."
docker image prune -f 2>/dev/null || true

log "🎉 Deployment abgeschlossen: $NEW_COMMIT"
echo ""
echo "Status:"
docker compose ps
