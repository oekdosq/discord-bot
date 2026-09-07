import { SlashCommandBuilder } from 'discord.js';
import { embed } from '../../lib/embed.js';
import { fetchTradingSignal, signalEmbed, tradingErrorMessage } from '../../lib/trading.js';

export const data = new SlashCommandBuilder()
  .setName('signal')
  .setDescription('Analisis sinyal trading XAUUSD (Smart Money Concept)')
  .addStringOption((o) =>
    o.setName('mode')
      .setDescription('Sumber data (default demo)')
      .addChoices(
        { name: 'demo — cepat (data sintetis)', value: 'demo' },
        { name: 'real — chart asli gratis', value: 'real' },
        { name: 'live — OANDA + LLM', value: 'live' },
      ),
  )
  .setDMPermission(true);

export async function execute(interaction) {
  const mode = interaction.options.getString('mode') ?? 'demo';
  await interaction.deferReply();

  const timeout = mode === 'live' ? 150_000 : 40_000;
  const { ok, data, error } = await fetchTradingSignal(mode, timeout);
  if (!ok) {
    const m = tradingErrorMessage(error);
    return interaction.editReply({ embeds: [embed({ color: 0xe74c3c, title: m.title, description: m.description })] });
  }
  if (!data.ok) {
    const errors = data.errors || ['Analisis gagal.'];
    let desc = errors.join('\n');
    if (data.spot_price) {
      const t = data.spot_updated_at ? new Date(data.spot_updated_at).toLocaleString('id-ID') : '';
      desc += `\n\n**Harga emas asli (${data.spot_source ?? '?'}):** $${data.spot_price}${t ? ` (${t})` : ''}`;
    }
    return interaction.editReply({
      embeds: [embed({ color: 0xe74c3c, title: 'Gagal menghasilkan sinyal', description: desc.slice(0, 2000) })],
    });
  }

  return interaction.editReply({ embeds: [signalEmbed(data)] });
}