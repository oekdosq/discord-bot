#!/usr/bin/env bash
# Provioning Oracle Cloud Free Tier — web app ai-trading + Discord bot + Ollama(opsional)
# Jalankan sekali:  bash setup-oracle.sh   (di user `ubuntu`, sudo tanpa password)
set -euo pipefail

GH_USER="${GH_USER:-oekdosq}"
DOMAIN="${DOMAIN:-}"                       # isi mis. bot.example.com utk certbot HTTPS
INSTALL_OLLAMA="${INSTALL_OLLAMA:-yes}"    # yes/no — wajib utk mode live LLM
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen3:0.6b}"

AI_DIR="/home/ubuntu/ai-trading"
BOT_DIR="/opt/bots/discord-bot"
PORT_APP=8000

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

say "1/8 Package dasar"
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  python3-venv python3-pip build-essential git curl ca-certificates \
  nginx certbot python3-certbot-nginx ufw

say "2/8 Node.js 20 (NodeSource — bot butuh >=18)"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y -qq nodejs
fi
node -v && npm -v

say "3/8 Klon repos"
# repos publik, tanpa auth
[ -d "$AI_DIR/.git" ] || { sudo install -d /home/ubuntu -o ubuntu -g ubuntu; git -C /home/ubuntu clone -q "https://github.com/$GH_USER/ai-trading.git" "$AI_DIR"; }
[ -d "$BOT_DIR/.git" ] || { sudo install -d /opt/bots -o ubuntu -g ubuntu; git -C /opt clone -q "https://github.com/$GH_USER/discord-bot.git" "$BOT_DIR"; }

say "4/8 Web app: venv + dependensi"
sudo chown -R ubuntu:ubuntu /home/ubuntu /opt/bots 2>/dev/null || true
cd "$AI_DIR"
[ -x .venv/bin/uvicorn ] || { python3 -m venv .venv; .venv/bin/pip install -q -U pip wheel; .venv/bin/pip install -q -r requirements.txt; }
[ -f .env ] || { cp .env.example .env; say "   EDIT dulu  $AI_DIR/.env  (WEB_SECRET + OANDA kredensial) sebelum restart service"; }

say "5/8 Bot: node_modules + .env placeholder"
cd "$BOT_DIR"
[ -d node_modules ] || npm install --no-audit --no-fund --silent
[ -f .env ] || { cp .env.example .env; say "   ISI  $BOT_DIR/.env  (DISCORD_TOKEN + CLIENT_ID) lalu: cd $BOT_DIR && npm run deploy"; }

say "6/8 systemd units"
sudo cp "$AI_DIR/deploy/ai-trading.service" "$BOT_DIR/deploy/discord-bot.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now ai-trading
sudo systemctl enable --now discord-bot

say "7/8 Nginx reverse proxy (:${PORT_APP} -> 80)"
if [ ! -f /etc/nginx/sites-enabled/ai-trading ]; then
  sed -e "s@127.0.0.1:8000@127.0.0.1:$PORT_APP@g" "$AI_DIR/deploy/nginx-ai-trading.conf" \
    | sudo tee /etc/nginx/sites-enabled/ai-trading >/dev/null
fi
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

say "8/8 Firewall (80/443)"
sudo ufw allow OpenSSH >/dev/null 2>&1 || sudo ufw allow 22
sudo ufw allow 80,443/tcp
sudo ufw --force enable

if [ "$INSTALL_OLLAMA" = "yes" ] && ! command -v ollama >/dev/null; then
  say "Opsional) Ollama (arch: $(uname -m))"
  case "$(uname -m)" in
    aarch64|arm64) OLL="ollama-linux-arm64.tgz" ;;
    x86_64|amd64)  OLL="ollama-linux-amd64.tgz" ;;
    *) say "   arsitektur tak dikenal — lewati"; OLL="";;
  esac
  if [ -n "$OLL" ]; then
    curl -fsSL -o /tmp/$OLL "https://ollama.com/download/$OLL"
    sudo tar -C /usr/local -xzf /tmp/$OLL
    sudo systemctl enable --now ollama 2>/dev/null || nohup ollama serve >/tmp/ollama.log 2>&1 &
    sleep 4
    ollama pull "$OLLAMA_MODEL" || true
  fi
fi

say "SELESAI — CEK:"
systemctl --no-pager status ai-trading --no-legend | head -3
systemctl --no-pager status discord-bot --no-legend | head -3
printf 'curl -s http://127.0.0.1:%d/api/signal | head -c 200\n' "$PORT_APP"
if [ -n "$DOMAIN" ]; then
  sudo certbot --nginx -d "$DOMAIN" --agree-tos 2>/dev/null || say "   Jalankan manual: sudo certbot --nginx -d $DOMAIN"
fi