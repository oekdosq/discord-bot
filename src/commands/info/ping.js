import { SlashCommandBuilder } from 'discord.js';
import { embed } from '../../lib/embed.js';

export const data = new SlashCommandBuilder().setName('ping').setDescription('Cek latensi bot').setDMPermission(true);

export async function execute(interaction) {
  const t0 = Date.now();
  const m = await interaction.reply({ embeds: [embed({ title: 'Pong!', description: 'Mengukur latensi…' })], fetchReply: true });
  const ws = interaction.client.ws.ping;
  const rt = m.createdTimestamp - t0;
  const lat = rt - ws >= 0 ? Math.max(0, rt - ws) : rt;
  return interaction.editReply({
    embeds: [
      embed({
        title: '🏓 Pong!',
        description: `**WebSocket:** ${Math.round(ws)}ms\n**Round-trip:** ${rt}ms\n**Eksekusi:** ${lat}ms`,
      }),
    ],
  });
}