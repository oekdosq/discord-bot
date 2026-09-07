import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { okEmbed, errEmbed } from '../../lib/embed.js';

export const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Bekukan member sementara (timeout)')
  .addUserOption((o) => o.setName('target').setDescription('Member yang di-timeout').setRequired(true))
  .addIntegerOption((o) => o.setName('menit').setDescription('Durasi dalam menit (default 10)'))
  .addStringOption((o) => o.setName('alasan').setDescription('Alasan (opsional)'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const target = interaction.options.getUser('target');
  const minutes = interaction.options.getInteger('menit') ?? 10;
  const reason = interaction.options.getString('alasan') ?? 'Tanpa alasan';
  const member = interaction.guild.members.cache.get(target.id);

  if (!member) return interaction.reply({ embeds: [errEmbed('Member tidak ada di server ini.')], ephemeral: true });
  if (!member.moderatable) {
    return interaction.reply({ embeds: [errEmbed('Bot tidak punya izin untuk timeout member tersebut.')], ephemeral: true });
  }

  const ms = minutes * 60_000;
  await member.timeout(ms > 0 ? ms : 1, reason);
  return interaction.reply({
    embeds: [
      okEmbed('Timeout dipasang', `<@${target.id}> dibekukan selama **${minutes} menit**.\nAlasan: ${reason}`),
    ],
  });
}