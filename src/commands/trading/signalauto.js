import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { embed } from '../../lib/embed.js';
import { getGuild, setGuild, removeKey } from '../../lib/store.js';

const KEY = 'signalAuto';
const MIN_INTERVAL = 5;

export const data = new SlashCommandBuilder()
  .setName('signalauto')
  .setDescription('Auto-posting sinyal XAUUSD berkala ke channel')
  .addSubcommand((s) =>
    s.setName('set')
      .setDescription('Aktifkan auto-posting sinyal')
      .addChannelOption((o) => o.setName('channel').setDescription('Channel tujuan').addChannelTypes(ChannelType.GuildText).setRequired(true))
      .addIntegerOption((o) => o.setName('menit').setDescription(`Interval dalam menit (min ${MIN_INTERVAL}, default 15)`).setMinValue(MIN_INTERVAL)),
  )
  .addSubcommand((s) => s.setName('hapus').setDescription('Matikan auto-posting'))
  .addSubcommand((s) => s.setName('status').setDescription('Lihat pengaturan auto-posting'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'hapus') {
    removeKey(interaction.guildId, KEY);
    return interaction.reply({ embeds: [embed({ color: 0x2ecc71, title: 'Auto-signal dimatikan' })], ephemeral: true });
  }

  if (sub === 'status') {
    const s = getGuild(interaction.guildId)[KEY];
    if (!s) return interaction.reply({ embeds: [embed({ title: 'Auto-signal', description: 'Belum aktif. Gunakan `/signalauto set`.', color: 0xe67e22 })], ephemeral: true });
    return interaction.reply({
      embeds: [embed({ title: 'Auto-signal aktif', description: `Channel: <#${s.channel}>\nInterval: **${s.intervalMin} menit**` })],
      ephemeral: true,
    });
  }

  const channel = interaction.options.getChannel('channel');
  const intervalMin = interaction.options.getInteger('menit') ?? 15;
  setGuild(interaction.guildId, { [KEY]: { channel: channel.id, intervalMin, lastRun: Date.now() } });
  return interaction.reply({
    embeds: [
      embed({
        color: 0x2ecc71,
        title: 'Auto-signal diatur',
        description: `Sinyal akan diposting tiap **${intervalMin} menit** ke <#${channel.id}>.\nMode **demo** (cepat; tanpa OANDA).\nPastikan bot punya izin **Send Messages** di channel itu.`,
      }),
    ],
  });
}