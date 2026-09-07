#!/bin/bash
# =========================================================
# Install otomatis: AI Trading API + Discord Bot di Termux
# Jalankan:  pkg install -y curl && sh <(curl -sL <RAW-URL>)
# Semua data NYATA (spot gold-api di API, chart asli via IP HP).
# =========================================================
set -u
say() { echo; echo "==> $1"; }

say "Cek Termux"
if [ -d /data/data/com.termux ]; then :; else echo "!! Bukan Termux, berhenti."; exit 1; fi

say "Update paket (sekali doang, bisa lama ~5 menit)"
pkg update -y || true
pkg upgrade -y || true

say "Install kebutuhan (git, node, python)"
pkg install -y git nodejs-lts python python-pip termux-api || exit 1

say "Pasang hasilkali/numpy Termux (repo utama -> tur untuk pandas)"
pkg install -y python-numpy || exit 1
pkg install -y tur-repo || exit 1
pkg install -y python-pandas || exit 1

say "Clone repo"
cd ~ || exit 1
[ -d ai-trading ] && (cd ai-trading && git pull --ff-only) || git clone https://github.com/oekdosq/ai-trading || exit 1
[ -d discord-bot ] && (cd discord-bot && git pull --ff-only) || git clone https://github.com/oekdosq/discord-bot || exit 1

say "Pasang web app (Python)"
cd ~/ai-trading || exit 1
python -m venv --system-site-packages .venv
source .venv/bin/activate
pip install -r requirements.txt || exit 1

say "Pasang bot (Node)"
cd ~/discord-bot || exit 1
npm install || exit 1

say "Isi .env bot (bikin otomatis)"
if [ -f .env ] && grep -q 'DISCORD_TOKEN=[A-Za-z0-9._-]\+' .env; then
  echo "   .env udah ada tokennya — pake itu."
else
  echo -n "   Tempel token Discord bot (kena 2x kontrol-v): "
  read -r TOK
  printf 'DISCORD_TOKEN=%s\nCLIENT_ID=1546409396299628554\nGUILD_ID=1546174516449902652\nTRADING_API_URL=http://127.0.0.1:8000\n' "$TOK" > .env
  echo "   .env dibuat."
fi

say "Daplikasi slash command ke server"
node src/deployCommands.js || echo "   (deploy gagal ntar cek log; bot tetap dicoba nyala)"

say "Bikin supervisor auto-restart"
cat > ~/supervise.sh <<'EOF'
#!/bin/bash
while :; do
  pgrep -f 'uvicorn app.mai[n]:app' >/dev/null || \
    { cd ~/ai-trading && setsid .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 >>/tmp/uvicorn.log 2>&1 & echo "[$(date -Is)] api restart" >>/tmp/supervise.log; }
  pgrep -f 'node src/index[.]js' >/dev/null || \
    { cd ~/discord-bot && setsid node src/index.js >>/tmp/discord_bot.log 2>&1 & echo "[$(date -Is)] bot restart" >>/tmp/supervise.log; }
  sleep 5
done
EOF
chmod +x ~/supervise.sh

say "Nyalain API + bot"
: > /tmp/uvicorn.log; : > /tmp/discord_bot.log; : > /tmp/supervise.log
setsid ~/supervise.sh >>/tmp/supervise.log 2>&1 &

say "Wake-lock biar HP nggak tidur"
termux-wake-lock 2>/dev/null && echo "   wake-lock ON" || echo "   (termux-api nggak aktif — biarkan Termux tetap fokus/muka layar nyala)"

say "Tes awal (tunggu ~15 detik)"
sleep 15
echo -n "   API spot:  "; curl -s -m 8 http://127.0.0.1:8000/api/price
echo
echo -n "   Bot health:"; curl -s -m 8 -o /dev/null -w " %{http_code}\n" http://127.0.0.1:8080/ || echo " (bot masih booting, cek ~/discord-bot lalu `tail -20 /tmp/discord_bot.log`)"
echo
echo "============================================"
echo " SELESAI. Bot + API jalan & auto-restart."
echo " Log:      tail -f /tmp/discord_bot.log   /   /tmp/uvicorn.log"
echo " Cek bot:  buka Discord -> ketik /help  /harga  /signal"
echo " Data:     spot NYATA (gold-api); di IP HP, TradingView/Dukascopy"
echo "           biasanya kebuka -> /signal mode real/live = chart asli."
echo " Hentikan: pkill -f supervise.sh (bot & API ikut mati)"
echo "============================================"