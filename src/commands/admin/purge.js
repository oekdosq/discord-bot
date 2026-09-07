import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { okEmbed, errEmbed } from '../../lib/embed.js';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Hapus pesan terbaru di channel ini (bulk)')
  .addIntegerOption((o) =>
    o.setName('jumlah').setDescription('Jumlah pesan (1-100)').setMinValue(1).setMaxValue(100).setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false);

export async function execute(interaction) {
  const amount = interaction.options.getInteger('jumlah');
  if (!interaction.channel.bulkDeletable) {
    return interaction.reply({ embeds: [errEmbed('Channel ini tidak mendukung penghapusan massal.')], ephemeral: true });
  }

  const deleted = await interaction.channel.bulkDelete(amount, true);
  const msg = await interaction.reply({
    embeds: [okEmbed('Pesan dihapus', `**${deleted.size}** pesan berhasil dihapus.`)],
  });
  setTimeout(() => msg.delete().catch(() => {}), 4000);
}