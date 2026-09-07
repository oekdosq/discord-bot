import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function collect() {
  const cmds = [];
  const base = join(__dirname, 'commands');
  for (const cat of readdirSync(base)) {
    const dir = join(base, cat);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
      const mod = await import(pathToFileURL(join(dir, file)).href);
      if (mod.data?.name) cmds.push(mod.data.toJSON());
    }
  }
  return cmds;
}

if (!config.token || !config.clientId) {
  console.error('[deploy] DISCORD_TOKEN & CLIENT_ID wajib di .env');
  process.exit(1);
}

const body = await collect();
const rest = new REST({ version: '10' }).setToken(config.token);

try {
  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body });
    console.log(`[deploy] ${body.length} command global? -> GUILD ${config.guildId}`);
  } else {
    await rest.put(Routes.applicationCommands(config.clientId), { body });
    console.log(`[deploy] ${body.length} slash command global terdaftar (butuh aktualisasi CLI: sampai ~1 jam).`);
  }
} catch (e) {
  console.error('[deploy] gagal:', e.message);
  process.exit(1);
}