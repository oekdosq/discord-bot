import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { okEmbed, errEmbed } from '../../lib/embed.js';
import { setGuild, removeKey } from '../../lib/store.js';

export const LEAVE_KEY = 'leave';

export const data = new SlashCommandBuilder()
  .setName('leave')
  .setDescription('Atur pesan perpisahan saat member keluar')
  .addSubcommand((s) =>
    s.setName('set')
      .setDescription('Atur channel & pesan perpisahan')
      .addChannelOption((o) => o.setName('channel').setDescription('Channel tujuan').addChannelTypes(ChannelType.GuildText).setRequired(true))
      .addStringOption((o) => o.setName('pesan').setDescription('Contoh: {user} baru saja keluar.')),
  )
  .addSubcommand((s) => s.setName('hapus').setDescription('Nonaktifkan pesan perpisahan'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'hapus') {
    removeKey(interaction.guildId, LEAVE_KEY);
    return interaction.reply({ embeds: [okEmbed('Pesan perpisahan dinonaktifkan', 'Pengaturan leave dihapus.')], ephemeral: true });
  }

  const channel = interaction.options.getChannel('channel');
  const pesan = interaction.options.getString('pesan') ?? 'Sampai jumpa {user}.';
  setGuild(interaction.guildId, { [LEAVE_KEY]: { channel: channel.id, message: pesan } });
  return interaction.reply({
    embeds: [okEmbed('Pesan perpisahan diatur', `Channel: <#${channel.id}>\nPesan:\n> ${pesan}`)],
  });
}