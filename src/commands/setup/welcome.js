import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { okEmbed, errEmbed } from '../../lib/embed.js';
import { setGuild, removeKey } from '../../lib/store.js';

export const WELCOME_KEY = 'welcome';

export const data = new SlashCommandBuilder()
  .setName('welcome')
  .setDescription('Atur pesan selamat datang (server setup)')
  .addSubcommand((s) =>
    s.setName('set')
      .setDescription('Atur channel & pesan welcome')
      .addChannelOption((o) => o.setName('channel').setDescription('Channel tujuan').addChannelTypes(ChannelType.GuildText).setRequired(true))
      .addStringOption((o) => o.setName('pesan').setDescription(`Contoh: Selamat datang {mention}!`)),
  )
  .addSubcommand((s) => s.setName('hapus').setDescription('Nonaktifkan pesan welcome'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'hapus') {
    removeKey(interaction.guildId, WELCOME_KEY);
    return interaction.reply({ embeds: [okEmbed('Welcome dinonaktifkan', 'Pesan selamat datang dihapus dari pengaturan.')], ephemeral: true });
  }

  const channel = interaction.options.getChannel('channel');
  const pesan = interaction.options.getString('pesan') ?? 'Selamat datang {mention} di {server}!';
  setGuild(interaction.guildId, { [WELCOME_KEY]: { channel: channel.id, message: pesan } });
  return interaction.reply({
    embeds: [okEmbed('Welcome diatur', `Channel: <#${channel.id}>\nPesan:\n> ${pesan}\n\nBelum aktif? Pastikan bot punya izin **Send Messages** di channel itu.`)],
  });
}