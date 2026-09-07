# Deploy bot Discord ke Oracle Cloud (Always Free / VPS)

Bot harus online 24/7 — pakai `systemd` di VM supaya auto-jalan & auto-restart.

## Siapkan di VM (sekali)

```bash
# Node 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# clone & install
sudo mkdir -p /opt/bots && sudo chown $USER: /opt/bots
cd /opt/bots
git clone <url-repo-discord-bot> discord-bot   # atau: scp -r discord-bot ubuntu@IP:~/
cd discord-bot
npm install --omit=dev
cp .env.example .env
nano .env                 # isi DISCORD_TOKEN, CLIENT_ID, GUILD_ID
npm run deploy            # daftarkan slash command
node src/index.js         # tes jalan — muncul "[ready] ... online"
```

## Jalankan sebagai service

1. Salin unit systemd:
   ```bash
   sudo cp deploy/discord-bot.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now discord-bot
   sudo systemctl status discord-bot
   ```

2. Cek log:
   ```bash
   journalctl -u discord-bot -f
   ```

## Gotcha

- `npm install` di bawah Node 20 pakai flag `--openssl-legacy-provider`? Tidak perlu; pakai Node 20 LTS.
- Bot perlu izin **Slash Commands** saat diundang (scope `applications.commands`) — ulangi URL invite kalau command tak muncul.
- `.env` & `data/` tidak boleh ikut di-download publik — sudah di-`.gitignore`.
- Kalau berada di VM yang sama dengan web ai-trading, service beda — tidak bentrok (bot tanpa port HTTP).