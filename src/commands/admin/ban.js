import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { okEmbed, errEmbed } from '../../lib/embed.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban member dari server')
  .addUserOption((o) => o.setName('target').setDescription('Member yang mau di-ban').setRequired(true))
  .addStringOption((o) => o.setName('alasan').setDescription('Alasan ban (opsional)'))
  .addIntegerOption((o) => o.setName('hari').setDescription('Hapus riwayat pesan (hari)'))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const target = interaction.options.getUser('target');
  const reason = interaction.options.getString('alasan') ?? 'Tanpa alasan';
  const days = interaction.options.getInteger('hari') ?? 0;
  const member = interaction.guild.members.cache.get(target.id);

  if (!member) return interaction.reply({ embeds: [errEmbed('Member tidak ada di server ini.')], ephemeral: true });
  if (!member.bannable) {
    return interaction.reply({ embeds: [errEmbed('Bot tidak punya izin untuk ban member tersebut.')], ephemeral: true });
  }

  await member.ban({ reason, deleteMessageSeconds: days * 86400 });
  return interaction.reply({
    embeds: [
      okEmbed('Member di-ban', `<@${target.id}> · ${target.tag}\nAlasan: ${reason}${days ? `\nRiwayat ${days} hari dihapus` : ''}`),
    ],
  });
}