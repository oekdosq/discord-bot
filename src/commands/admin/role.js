import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { okEmbed, errEmbed } from '../../lib/embed.js';

export const data = new SlashCommandBuilder()
  .setName('role')
  .setDescription('Tambah/hapus role untuk member')
  .addSubcommand((s) =>
    s.setName('tambah').setDescription('Tambahkan role ke member')
      .addUserOption((o) => o.setName('member').setDescription('Member').setRequired(true))
      .addRoleOption((o) => o.setName('role').setDescription('Role yang diberikan').setRequired(true)),
  )
  .addSubcommand((s) =>
    s.setName('hapus').setDescription('Hapus role dari member')
      .addUserOption((o) => o.setName('member').setDescription('Member').setRequired(true))
      .addRoleOption((o) => o.setName('role').setDescription('Role yang dihapus').setRequired(true)),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .setDMPermission(false);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const member = interaction.options.getMember('member');
  const role = interaction.options.getRole('role');

  if (!member) return interaction.reply({ embeds: [errEmbed('Member tidak ditemukan.')], ephemeral: true });
  if (!role) return interaction.reply({ embeds: [errEmbed('Role tidak ditemukan.')], ephemeral: true });
  if (!member.manageable) {
    return interaction.reply({ embeds: [errEmbed('Bot tidak bisa mengubah role member tersebut.')], ephemeral: true });
  }

  if (sub === 'tambah') {
    if (member.roles.cache.has(role.id)) {
      return interaction.reply({ embeds: [errEmbed(`<@${member.id}> sudah punya role <@&${role.id}>.`)], ephemeral: true });
    }
    await member.roles.add(role.id);
    return interaction.reply({ embeds: [okEmbed('Role ditambahkan', `<@${member.id}> sekarang punya <@&${role.id}>.`)] });
  }

  if (!member.roles.cache.has(role.id)) {
    return interaction.reply({ embeds: [errEmbed(`<@${member.id}> tidak punya role <@&${role.id}>.`)], ephemeral: true });
  }
  await member.roles.remove(role.id);
  return interaction.reply({ embeds: [okEmbed('Role dihapus', `<@${member.id}> tidak lagi punya <@&${role.id}>.`)] });
}