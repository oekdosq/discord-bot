import { Client, GatewayIntentBits } from 'discord.js';
import { readFileSync } from 'node:fs';

const env = readFileSync('.env', 'utf8');
const token = (env.match(/^DISCORD_TOKEN=(.+)$/m) || [])[1]?.trim();
if (!token) {
  console.error('DISCORD_TOKEN kosong di .env');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('clientReady', (c) => {
  const guilds = [...c.guilds.cache.values()];
  console.log(`server terhubung (${guilds.length}):`);
  for (const g of guilds) console.log(`  ${g.id}  ${g.name}`);
  c.destroy();
  process.exit(0);
});

client.login(token).catch((e) => {
  console.error('login gagal:', e.message);
  process.exit(1);
});