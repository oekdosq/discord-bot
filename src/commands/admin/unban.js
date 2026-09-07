import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { okEmbed, errEmbed } from '../../lib/embed.js';

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Cabut ban seorang user')
  .addUserOption((o) => o.setName('target').setDescription('User yang mau di-unban').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const target = interaction.options.getUser('target');
  let banned = false;
  try {
    const ban = await interaction.guild.bans.fetch(target.id);
    banned = Boolean(ban);
  } catch {
    banned = false;
  }

  if (!banned) {
    return interaction.reply({ embeds: [errEmbed(`<@${target.id}> tidak ada di daftar ban.`)], ephemeral: true });
  }

  await interaction.guild.bans.remove(target.id, `Unban oleh ${interaction.user.tag}`);
  return interaction.reply({
    embeds: [okEmbed('Ban dicabut', `<@${target.id}> · ${target.tag} sekarang bisa join lagi.`)],
  });
}