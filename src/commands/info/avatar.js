import { SlashCommandBuilder } from 'discord.js';
import { embed } from '../../lib/embed.js';

export const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription('Lihat avatar user')
  .addUserOption((o) => o.setName('target').setDescription('User (default: kamu)'))
  .setDMPermission(true);

export async function execute(interaction) {
  const target = interaction.options.getUser('target') ?? interaction.user;
  const avatar = target.displayAvatarURL({ size: 1024 });

  const e = embed({
    title: `Avatar ${target.username}`,
    description: `[Buka di browser](${avatar})`,
  });
  e.setImage(avatar);
  return interaction.reply({ embeds: [e] });
}