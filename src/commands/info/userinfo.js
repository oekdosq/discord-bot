import { SlashCommandBuilder } from 'discord.js';
import { embed } from '../../lib/embed.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Informasi tentang user')
  .addUserOption((o) => o.setName('target').setDescription('User (default: kamu)'))
  .setDMPermission(true);

export async function execute(interaction) {
  const target = interaction.options.getUser('target') ?? interaction.user;
  const member = interaction.guild ? interaction.guild.members.cache.get(target.id) : null;

  const fields = [
    { name: 'ID', value: target.id, inline: true },
    { name: 'Dibuat', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:D>`, inline: true },
  ];
  if (member) {
    fields.push({ name: 'Gabung', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true });
    const roles = member.roles.cache.filter((r) => r.id !== interaction.guild.id).map((r) => `<@&${r.id}>`);
    fields.push({ name: 'Roles', value: roles.slice(0, 10).join(' ') || '—', inline: false });
  }

  const e = embed({
    title: `${target.username}${target.bot ? ' (🤖 bot)' : ''}`,
    description: member ? 'Member server ini.' : 'Bukan member server ini.',
    fields,
  });
  e.setThumbnail(target.displayAvatarURL({ size: 256 }));
  return interaction.reply({ embeds: [e] });
}