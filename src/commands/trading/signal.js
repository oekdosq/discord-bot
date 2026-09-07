import { SlashCommandBuilder } from 'discord.js';
import { embed } from '../../lib/embed.js';
import { fetchTradingSignal, signalEmbed, tradingErrorMessage } from '../../lib/trading.js';

export const data = new SlashCommandBuilder()
  .setName('signal')
  .setDescription('Analisis sinyal trading XAUUSD (Smart Money Concept)')
  .addBooleanOption((o) => o.setName('live').setDescription('Pakai mode live (OANDA+LLM). Default demo (cepat)'))
  .setDMPermission(true);

export async function execute(interaction) {
  const live = interaction.options.getBoolean('live') ?? false;
  await interaction.deferReply();

  const { ok, data, error } = await fetchTradingSignal(live);
  if (!ok) {
    const m = tradingErrorMessage(error);
    return interaction.editReply({ embeds: [embed({ color: 0xe74c3c, title: m.title, description: m.description })] });
  }
  if (!data.ok) {
    return interaction.editReply({
      embeds: [embed({ color: 0xe74c3c, title: 'Gagal menghasilkan sinyal', description: (data.errors || ['Analisis gagal.']).join('\n') })],
    });
  }

  return interaction.editReply({ embeds: [signalEmbed(data)] });
}