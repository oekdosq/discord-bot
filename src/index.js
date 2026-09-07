import { Client, GatewayIntentBits } from 'discord.js';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadCommands() {
  const commands = new Map();
  const base = join(__dirname, 'commands');
  for (const cat of readdirSync(base)) {
    const dir = join(base, cat);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
      const mod = await import(pathToFileURL(join(dir, file)).href);
      if (mod.data?.name && mod.execute) commands.set(mod.data.name, mod);
    }
  }
  return commands;
}

async function loadEvents(client) {
  const dir = join(__dirname, 'events');
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const mod = await import(pathToFileURL(join(dir, file)).href);
    const name = file.replace(/\.js$/, '');
    client.on(name, (...args) => mod.default(client, ...args));
  }
}

async function loadJobs(client) {
  const dir = join(__dirname, 'jobs');
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const mod = await import(pathToFileURL(join(dir, file)).href);
    if (typeof mod.default === 'function') mod.default(client);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = await loadCommands();
await loadEvents(client);
await loadJobs(client);

if (!config.token) {
  console.error('[fatal] DISCORD_TOKEN kosong. Copy .env.example -> .env lalu isi.');
  process.exit(1);
}

client.login(config.token);