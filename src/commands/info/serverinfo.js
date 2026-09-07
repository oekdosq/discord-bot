import { SlashCommandBuilder } from 'discord.js';
import { embed } from '../../lib/embed.js';

export const data = new SlashCommandBuilder().setName('serverinfo').setDescription('Informasi server ini').setDMPermission(false);

export async function execute(interaction) {
  const g = interaction.guild;
  const owner = await g.fetchOwner().catch(() => null);

  const fields = [
    { name: 'Pemilik', value: owner ? owner.toString() : '—', inline: true },
    { name: 'ID', value: g.id, inline: true },
    { name: 'Dibuat', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`, inline: true },
    { name: 'Member', value: String(g.memberCount), inline: true },
    { name: 'Online', value: String(g.members.cache.filter((m) => m.presence?.status === 'online').size), inline: true },
    { name: 'Roles', value: String(g.roles.cache.size), inline: true },
    { name: 'Channels', value: String(g.channels.cache.size), inline: true },
    { name: 'Boosts', value: `${g.premiumSubscriptionCount ?? 0} (level ${g.premiumTier ?? 0})`, inline: true },
    { name: 'Verifikasi', value: String(g.verificationLevel), inline: true },
  ];

  const e = embed({
    title: `🏠 ${g.name}`,
    description: `Server dengan **${g.memberCount}** member.`,
    fields,
  });
  if (g.iconURL()) e.setThumbnail(g.iconURL());
  return interaction.reply({ embeds: [e] });
}