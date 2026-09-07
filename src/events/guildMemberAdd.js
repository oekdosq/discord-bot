import { getGuild } from '../lib/store.js';
import { embed } from '../lib/embed.js';
import { formatMessage } from '../lib/format.js';
import { WELCOME_KEY } from '../commands/setup/welcome.js';
import { AUTOROLE_KEY } from '../commands/setup/autorole.js';

export default async function guildMemberAdd(client, member) {
  const { guild } = member;
  const settings = getGuild(guild.id);
  const key = WELCOME_KEY;

  if (settings[key]) {
    const channel = guild.channels.cache.get(settings[key].channel);
    if (channel && channel.permissionsFor(guild.members.me).has('SendMessages')) {
      const text = formatMessage(settings[key].message, { user: member.user, guild });
      await channel.send({
        embeds: [embed({ title: `👋 Welcome`, description: text })],
      }).catch(() => {});
    }
  }

  if (settings[AUTOROLE_KEY]) {
    const role = guild.roles.cache.get(settings[AUTOROLE_KEY]);
    if (role && role.editable) {
      await member.roles.add(role.id).catch((e) => console.error('[autorole]', e.message));
    }
  }
}