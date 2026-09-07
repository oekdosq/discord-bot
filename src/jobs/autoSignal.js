import { allGuilds, setGuild } from '../lib/store.js';
import { fetchTradingSignal, signalEmbed } from '../lib/trading.js';

const KEY = 'signalAuto';
const TICK_MS = 60_000;

export default function start(client) {
  const tick = async () => {
    const now = Date.now();
    for (const [guildId, settings] of Object.entries(allGuilds())) {
      const auto = settings[KEY];
      if (!auto) continue;
      if (now - (auto.lastRun ?? 0) < auto.intervalMin * 60_000) continue;

      const guild = client.guilds.cache.get(guildId);
      const me = guild?.members?.me;
      const channel = guild?.channels.cache.get(auto.channel);
      if (!channel || !me || !channel.permissionsFor(me)?.has('SendMessages')) {
        setGuild(guildId, { [KEY]: { ...auto, lastRun: now } });
        continue;
      }

      const { ok, data } = await fetchTradingSignal('demo');
      if (ok && data.ok) {
        await channel.send({ embeds: [signalEmbed(data)] }).catch(() => {});
      }
      setGuild(guildId, { [KEY]: { ...auto, lastRun: now } });
    }
  };

  const interval = setInterval(tick, TICK_MS);
  client.once('ready', () => tick());

  const cleanup = () => clearInterval(interval);
  process.once('SIGINT', cleanup);
  process.once('SIGTERM', cleanup);
}