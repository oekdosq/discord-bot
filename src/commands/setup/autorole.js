import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { okEmbed, errEmbed } from '../../lib/embed.js';
import { setGuild, removeKey } from '../../lib/store.js';

export const AUTOROLE_KEY = 'autorole';

export const data = new SlashCommandBuilder()
  .setName('autorole')
  .setDescription('Role otomatis untuk member baru')
  .addSubcommand((s) => s.setName('set').setDescription('Atur role otomatis').addRoleOption((o) => o.setName('role').setDescription('Role yang diberikan').setRequired(true)))
  .addSubcommand((s) => s.setName('hapus').setDescription('Nonaktifkan role otomatis'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'hapus') {
    removeKey(interaction.guildId, AUTOROLE_KEY);
    return interaction.reply({ embeds: [okEmbed('Autorole dinonaktifkan', 'Role otomatis dihapus dari pengaturan.')], ephemeral: true });
  }

  const role = interaction.options.getRole('role');
  if (role.managed) {
    return interaction.reply({ embeds: [errEmbed('Role terkelola bot integrasi tidak bisa di-assign manual.')], ephemeral: true });
  }

  setGuild(interaction.guildId, { [AUTOROLE_KEY]: role.id });
  return interaction.reply({
    embeds: [okEmbed('Autorole diatur', `Member baru akan otomatis dapat role <@&${role.id}>.`)],
  });
}