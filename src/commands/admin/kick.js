import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { okEmbed, errEmbed } from '../../lib/embed.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Keluarkan member dari server')
  .addUserOption((o) => o.setName('target').setDescription('Member yang mau dikeluarkan').setRequired(true))
  .addStringOption((o) => o.setName('alasan').setDescription('Alasan kick (opsional)'))
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const target = interaction.options.getUser('target');
  const reason = interaction.options.getString('alasan') ?? 'Tanpa alasan';
  const member = interaction.guild.members.cache.get(target.id);

  if (!member) return interaction.reply({ embeds: [errEmbed('Member tidak ada di server ini.')], ephemeral: true });
  if (!member.kickable) {
    return interaction.reply({ embeds: [errEmbed('Bot tidak punya izin untuk kick member tersebut.')], ephemeral: true });
  }

  await member.kick(reason);
  return interaction.reply({
    embeds: [
      okEmbed('Member dikick', `<@${target.id}> · ${target.tag}\nAlasan: ${reason}`),
    ],
  });
}