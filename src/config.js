import 'dotenv/config';

const env = (name, fallback = '') => process.env[name] ?? fallback;
const required = ['DISCORD_TOKEN', 'CLIENT_ID'];

for (const key of required) {
  if (!env(key)) {
    console.warn(`[config] Env wajib hilang: ${key} (copy .env.example -> .env lalu isi)`);
  }
}

export const config = {
  token: env('DISCORD_TOKEN'),
  clientId: env('CLIENT_ID'),
  guildId: env('GUILD_ID', ''),
  tradingApi: env('TRADING_API_URL', 'http://localhost:8000').replace(/\/+$/, ''),
  dataFile: env('DATA_FILE', 'data/settings.json'),
  embeds: {
    base: parseInt(env('EMBED_COLOR', '0x2b6bb0'), 16),
    success: 0x2ecc71,
    error: 0xe74c3c,
    buy: 0x2ecc71,
    sell: 0xe74c3c,
    hold: 0xf1c40f,
  },
};