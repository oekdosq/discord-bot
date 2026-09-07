import { errEmbed } from '../lib/embed.js';

export default async function interactionCreate(client, interaction) {
  if (!interaction?.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({ embeds: [errEmbed('Perintah tidak ditemukan.')], ephemeral: true });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[error] ${interaction.commandName}:`, error);
    const msg = errEmbed(`Terjadi error: \`${error.message || 'unknown'}\``);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [msg] }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [msg], ephemeral: true }).catch(() => {});
    }
  }
}