import { getGuild } from '../lib/store.js';
import { embed } from '../lib/embed.js';
import { formatMessage } from '../lib/format.js';
import { LEAVE_KEY } from '../commands/setup/leave.js';

export default async function guildMemberRemove(member) {
  const { guild } = member;
  const settings = getGuild(guild.id);
  const key = LEAVE_KEY;

  if (!settings[key]) return;

  const channel = guild.channels.cache.get(settings[key].channel);
  if (!channel || !channel.permissionsFor(guild.members.me).has('SendMessages')) return;

  const user = member.user ?? { tag: member.tag ?? 'Unknown', id: member.id };
  const text = formatMessage(settings[key].message, { user, guild });
  await channel.send({
    embeds: [embed({ title: '👋 Perpisahan', description: text, color: 0x95a5a6 })],
  }).catch(() => {});
}