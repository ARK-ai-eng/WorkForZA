# WorkforZA — Deployment-Plan für Linux VPS

> **Marke:** WorkforZA by AISmarterFlow  
> **Exklusivvertrieb:** DEM Personalservice GmbH  
> **Stack:** React 19 + Vite (Static SPA) · Node.js 22 · Nginx · Docker · GitHub Actions  
> **Zielumgebung:** Ubuntu 22.04 LTS VPS (min. 1 vCPU, 1 GB RAM, 20 GB SSD)

---

## Inhaltsverzeichnis

1. [Voraussetzungen](#1-voraussetzungen)
2. [Server-Grundkonfiguration](#2-server-grundkonfiguration)
3. [Docker-Setup](#3-docker-setup)
4. [Nginx als Reverse Proxy](#4-nginx-als-reverse-proxy)
5. [SSL mit Let's Encrypt](#5-ssl-mit-lets-encrypt)
6. [Manuelles Deployment](#6-manuelles-deployment)
7. [CI/CD mit GitHub Actions](#7-cicd-mit-github-actions)
8. [Monitoring & Logs](#8-monitoring--logs)
9. [Backup-Strategie](#9-backup-strategie)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Voraussetzungen

| Anforderung | Mindest | Empfohlen |
|---|---|---|
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB |
| Disk | 20 GB SSD | 40 GB SSD |
| Ports offen | 22, 80, 443 | 22, 80, 443 |
| Domain | Pflicht | `app.workforza.de` |

**Benötigte Software auf dem VPS:**
- Docker Engine 24+
- Docker Compose v2
- Nginx 1.24+
- Certbot (Let's Encrypt)
- Git 2.40+

---

## 2. Server-Grundkonfiguration

> **IONOS-Hinweis:** Das vollautomatische Setup-Skript `deploy/setup-vps.sh` erledigt alle Schritte 2–6 in einem Durchlauf:
> ```bash
> curl -fsSL https://raw.githubusercontent.com/ARK-ai-eng/WorkForZA/main/deploy/setup-vps.sh | bash
> ```

### 2.1 Erstanmeldung und System-Update

```bash
# Als root einloggen
ssh root@<VPS-IP>

# System aktualisieren
apt update && apt upgrade -y

# Zeitzone setzen
timedatectl set-timezone Europe/Berlin

# Nicht-root-Benutzer anlegen
adduser workforza
usermod -aG sudo workforza

# SSH-Key für neuen Benutzer einrichten
mkdir -p /home/workforza/.ssh
cp ~/.ssh/authorized_keys /home/workforza/.ssh/
chown -R workforza:workforza /home/workforza/.ssh
chmod 700 /home/workforza/.ssh
chmod 600 /home/workforza/.ssh/authorized_keys
```

### 2.2 Firewall konfigurieren (UFW)

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

### 2.3 SSH-Absicherung

```bash
# /etc/ssh/sshd_config anpassen:
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd
```

---

## 3. Docker-Setup

### 3.1 Docker installieren

```bash
# Als workforza-Benutzer
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# HINWEIS: Nicht 'apt install docker-compose-plugin' ohne das offizielle Repo verwenden!
# Das Standard-Ubuntu-Repo (z.B. bei IONOS) kennt docker-compose-plugin nicht.
# Das obige Vorgehen über download.docker.com ist die korrekte Methode.

# Benutzer zur Docker-Gruppe hinzufügen
sudo usermod -aG docker workforza
newgrp docker

# Test
docker --version
docker compose version
```

### 3.2 Dockerfile

Die Datei `Dockerfile` liegt im Root des Repositories:

```dockerfile
# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# pnpm installieren
RUN corepack enable && corepack prepare pnpm@latest --activate

# Abhängigkeiten installieren
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Quellcode kopieren und bauen
COPY . .
RUN pnpm build

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Build-Artefakte kopieren
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Nginx-Konfiguration für SPA-Routing
COPY deploy/nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3.3 Docker Compose

Die Datei `docker-compose.yml` liegt im Root des Repositories:

```yaml
version: "3.9"

services:
  workforza:
    image: ghcr.io/ark-ai-eng/workforza:latest
    container_name: workforza_app
    restart: unless-stopped
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    labels:
      - "com.workforza.service=frontend"

  # Optional: Watchtower für automatische Container-Updates
  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 300 --cleanup workforza_app
```

---

## 4. Nginx als Reverse Proxy

### 4.1 Nginx installieren

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4.2 Nginx-Konfiguration für SPA-Routing

Datei: `deploy/nginx-spa.conf` (für den Docker-Container):

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip-Komprimierung
    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml application/xml+rss text/javascript;

    # Cache-Header für statische Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA-Fallback: alle Routen auf index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security-Header
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### 4.3 Nginx als Reverse Proxy auf dem Host

Datei: `/etc/nginx/sites-available/workforza`:

```nginx
server {
    listen 80;
    server_name app.workforza.de;

    # Weiterleitung zu HTTPS (nach SSL-Setup aktivieren)
    # return 301 https://$host$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Site aktivieren
sudo ln -s /etc/nginx/sites-available/workforza /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. SSL mit Let's Encrypt

```bash
# Certbot installieren
sudo apt install -y certbot python3-certbot-nginx

# Zertifikat ausstellen (Domain muss auf VPS-IP zeigen!)
sudo certbot --nginx -d app.workforza.de

# Automatische Erneuerung testen
sudo certbot renew --dry-run

# Cronjob für automatische Erneuerung (wird von Certbot automatisch eingerichtet)
# Prüfen mit:
sudo systemctl status certbot.timer
```

Nach dem SSL-Setup die Nginx-Konfiguration anpassen und die HTTP→HTTPS-Weiterleitung aktivieren (Zeile `return 301` einkommentieren).

---

## 6. Manuelles Deployment

### 6.1 Repository klonen und deployen

```bash
# Als workforza-Benutzer auf dem VPS
cd /home/workforza

# Repository klonen (einmalig)
git clone https://github.com/ARK-ai-eng/WorkForZA.git
cd WorkForZA

# Docker-Image bauen
docker build -t workforza:latest .

# Container starten
docker compose up -d

# Status prüfen
docker compose ps
docker compose logs -f workforza
```

### 6.2 Update deployen

```bash
cd /home/workforza/WorkForZA

# Neuesten Stand holen
git pull origin main

# Image neu bauen und Container neu starten
docker compose down
docker build -t workforza:latest .
docker compose up -d

# Logs prüfen
docker compose logs --tail=50 workforza
```

### 6.3 Deployment-Skript (deploy.sh)

```bash
#!/bin/bash
set -e

echo "🚀 WorkforZA Deployment gestartet..."

APP_DIR="/home/workforza/WorkForZA"
cd "$APP_DIR"

echo "📥 Code aktualisieren..."
git pull origin main

echo "🔨 Docker-Image bauen..."
docker build -t workforza:latest .

echo "🔄 Container neu starten..."
docker compose down
docker compose up -d

echo "⏳ Warten auf Container-Start..."
sleep 5

echo "✅ Status:"
docker compose ps

echo "🎉 Deployment abgeschlossen!"
```

```bash
chmod +x deploy.sh
```

---

## 7. CI/CD mit GitHub Actions

### 7.1 GitHub Secrets konfigurieren

Im GitHub-Repository unter **Settings → Secrets and variables → Actions** folgende Secrets anlegen:

| Secret | Beschreibung | Beispiel |
|---|---|---|
| `VPS_HOST` | IP-Adresse des VPS | `123.456.789.0` |
| `VPS_USER` | SSH-Benutzer | `workforza` |
| `VPS_SSH_KEY` | Privater SSH-Key (PEM-Format) | `-----BEGIN OPENSSH...` |
| `VPS_PORT` | SSH-Port | `22` |

### 7.2 GitHub Actions Workflow

Datei: `.github/workflows/deploy.yml`:

```yaml
name: Deploy WorkforZA to VPS

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-test:
    name: Build & Type-Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: latest

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type-Check
        run: pnpm exec tsc --noEmit

      - name: Build
        run: pnpm build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 1

  deploy:
    name: Deploy to VPS
    runs-on: ubuntu-latest
    needs: build-and-test
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script: |
            cd /home/workforza/WorkForZA
            git pull origin main
            docker build -t workforza:latest .
            docker compose down
            docker compose up -d
            echo "✅ Deployment erfolgreich: $(date)"

      - name: Health-Check
        run: |
          sleep 10
          curl -f https://app.workforza.de || exit 1
          echo "✅ Health-Check bestanden"
```

---

## 8. Monitoring & Logs

### 8.1 Container-Logs

```bash
# Live-Logs
docker compose logs -f workforza

# Letzte 100 Zeilen
docker compose logs --tail=100 workforza

# Nginx-Access-Logs im Container
docker exec workforza_app tail -f /var/log/nginx/access.log
```

### 8.2 System-Ressourcen

```bash
# Container-Ressourcenverbrauch
docker stats workforza_app

# Disk-Usage
df -h
docker system df
```

### 8.3 Uptime-Monitoring (optional)

Empfehlung: **UptimeRobot** (kostenlos, 5-Minuten-Intervall) auf `https://app.workforza.de` einrichten. Bei Ausfall automatische E-Mail-Benachrichtigung.

---

## 9. Backup-Strategie

Da WorkforZA ein reines Static-Frontend ohne eigene Datenbank ist, beschränkt sich das Backup auf:

```bash
# Tägliches Backup der Nginx-Konfiguration und Docker-Compose-Dateien
cat > /home/workforza/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/workforza/backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Konfigurationsdateien sichern
cp -r /etc/nginx "$BACKUP_DIR/nginx"
cp /home/workforza/WorkForZA/docker-compose.yml "$BACKUP_DIR/"

# Alte Backups löschen (älter als 30 Tage)
find /home/workforza/backups -type d -mtime +30 -exec rm -rf {} +

echo "Backup abgeschlossen: $BACKUP_DIR"
EOF

chmod +x /home/workforza/backup.sh

# Cronjob einrichten (täglich um 03:00 Uhr)
(crontab -l 2>/dev/null; echo "0 3 * * * /home/workforza/backup.sh") | crontab -
```

---

## 10. Troubleshooting

### Container startet nicht

```bash
# Logs prüfen
docker compose logs workforza

# Container-Status
docker compose ps

# Image neu bauen (ohne Cache)
docker build --no-cache -t workforza:latest .
docker compose up -d
```

### Nginx-Fehler 502 Bad Gateway

```bash
# Prüfen ob Container läuft
docker ps | grep workforza

# Port-Binding prüfen
ss -tlnp | grep 3000

# Nginx-Konfiguration testen
sudo nginx -t
sudo systemctl reload nginx
```

### SSL-Zertifikat abgelaufen

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Deployment schlägt fehl (GitHub Actions)

1. SSH-Verbindung manuell testen: `ssh -i <key> workforza@<VPS-IP>`
2. GitHub Secrets auf Korrektheit prüfen (kein Zeilenumbruch am Ende des SSH-Keys)
3. VPS-Firewall prüfen: `sudo ufw status`

---

## Schnellübersicht: Wichtige Befehle

| Aktion | Befehl |
|---|---|
| App starten | `docker compose up -d` |
| App stoppen | `docker compose down` |
| Logs anzeigen | `docker compose logs -f workforza` |
| Manuell deployen | `./deploy.sh` |
| Nginx neu laden | `sudo systemctl reload nginx` |
| SSL erneuern | `sudo certbot renew` |
| Container-Status | `docker compose ps` |
| Ressourcen | `docker stats workforza_app` |

---

*Dokumentation erstellt von AISmarterFlow · WorkforZA Deployment Guide v1.0 · Februar 2026*
