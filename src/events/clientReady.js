import { ActivityType } from 'discord.js';

export default async function ready(client) {
  const name = client.user.username;
  const guilds = client.guilds.cache.size;
  client.user.setPresence({
    activities: [{ name: `${guilds} server`, type: ActivityType.Watching }],
    status: 'online',
  });
  console.log(`[ready] ${name} online di ${guilds} server.`);
}