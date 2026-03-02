#!/bin/bash
# WorkforZA VPS Setup - IONOS Ubuntu 20.04 / 22.04
# Als root ausfuehren: bash setup-vps.sh
set -e

log()  { echo "[OK] $1"; }
warn() { echo "[!]  $1"; }

[ "$EUID" -ne 0 ] && echo "Bitte als root ausfuehren: sudo bash setup-vps.sh" && exit 1

echo ""
echo "=== WorkforZA VPS Setup by AISmarterFlow ==="
echo ""

# System aktualisieren
log "System aktualisieren..."
apt update -qq && apt upgrade -y -qq

# Grundpakete
log "Grundpakete installieren..."
apt install -y -qq git curl wget ufw nginx certbot python3-certbot-nginx

# Docker offiziell installieren (IONOS-kompatibel)
log "Docker offiziell installieren (nicht apt docker.io)..."
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -qq
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
log "Docker Version: $(docker --version)"
log "Docker Compose Version: $(docker compose version)"

# Benutzer workforza anlegen
if id "workforza" &>/dev/null; then
  warn "Benutzer 'workforza' existiert bereits"
else
  log "Benutzer 'workforza' anlegen..."
  adduser --disabled-password --gecos "" workforza
fi
usermod -aG sudo workforza
usermod -aG docker workforza

# SSH-Verzeichnis fuer workforza
mkdir -p /home/workforza/.ssh
chmod 700 /home/workforza/.ssh
touch /home/workforza/.ssh/authorized_keys
chmod 600 /home/workforza/.ssh/authorized_keys
chown -R workforza:workforza /home/workforza/.ssh
log "SSH-Verzeichnis fuer workforza eingerichtet"

# Repo klonen
log "WorkforZA Repo klonen..."
if [ -d "/home/workforza/WorkForZA" ]; then
  warn "Repo existiert bereits - wird aktualisiert"
  cd /home/workforza/WorkForZA && git pull origin main
else
  git clone https://github.com/ARK-ai-eng/WorkForZA.git /home/workforza/WorkForZA
fi
chown -R workforza:workforza /home/workforza/WorkForZA

# Firewall konfigurieren
log "Firewall konfigurieren (SSH + HTTP + HTTPS)..."
ufw --force reset > /dev/null
ufw default deny incoming > /dev/null
ufw default allow outgoing > /dev/null
ufw allow 22/tcp > /dev/null
ufw allow 80/tcp > /dev/null
ufw allow 443/tcp > /dev/null
ufw --force enable > /dev/null
log "Firewall aktiv"

# Nginx als Reverse Proxy konfigurieren
log "Nginx konfigurieren..."
cat > /etc/nginx/sites-available/workforza << 'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/workforza /etc/nginx/sites-enabled/workforza
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl reload nginx
log "Nginx konfiguriert und aktiv"

# Ersten Docker-Build starten
log "Ersten Docker-Build starten (dauert ca. 2-3 Minuten)..."
cd /home/workforza/WorkForZA
docker build -t workforza:latest .
docker compose up -d
sleep 8
docker compose ps

echo ""
echo "============================================"
echo "  Setup abgeschlossen!"
echo "============================================"
echo ""
echo "Naechste Schritte:"
echo ""
echo "1. SSH-Key fuer GitHub Actions eintragen:"
echo "   Auf deinem Mac: cat ~/.ssh/workforza_deploy.pub"
echo "   Dann einfuegen in: /home/workforza/.ssh/authorized_keys"
echo ""
echo "2. Domain auf diese IP zeigen lassen (IONOS DNS)"
echo ""
echo "3. SSL-Zertifikat einrichten:"
echo "   certbot --nginx -d app.workforza.de --non-interactive --agree-tos -m deine@email.de"
echo ""
echo "4. GitHub Actions Secrets setzen:"
echo "   VPS_HOST = $(curl -s ifconfig.me 2>/dev/null || echo 'DEINE_IP')"
echo "   VPS_USER = workforza"
echo "   VPS_SSH_KEY = Inhalt von ~/.ssh/workforza_deploy (privater Key)"
echo "   VPS_PORT = 22"
echo ""
echo "5. Test: curl -I http://$(curl -s ifconfig.me 2>/dev/null || echo 'DEINE_IP')"
echo ""
