import { SlashCommandBuilder } from 'discord.js';
import { embed, errEmbed } from '../../lib/embed.js';
import { config } from '../../config.js';

const ARROW = { buy: '🔼 BUY', sell: '🔽 SELL', hold: '⏸ HOLD' };

function fmt(v, unit = '') {
  if (v === null || v === undefined || v === '') return '—';
  return `${Number(v)}${unit}`;
}

export const data = new SlashCommandBuilder()
  .setName('signal')
  .setDescription('Analisis sinyal trading XAUUSD (Smart Money Concept)')
  .addBooleanOption((o) => o.setName('live').setDescription('Pakai mode live (OANDA+LLM). Default demo (cepat)'))
  .setDMPermission(true);

export async function execute(interaction) {
  const live = interaction.options.getBoolean('live') ?? false;
  const url = `${config.tradingApi}/api/signal${live ? '?mode=live' : ''}`;

  await interaction.deferReply();

  let data;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(live ? 150_000 : 20_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (e) {
    const why = e.name === 'TimeoutError' ? 'server lambat/tidak balas' : e.message || 'gagal terhubung';
    return interaction.editReply({
      embeds: [
        errEmbed(
          `Tidak bisa mendapat sinyal dari API trading di \`${config.tradingApi}\`.\n(${why})\n\nPastikan web app ai-trading berjalan.`,
          '⚠️ API Trading Offline',
        ),
      ],
    });
  }

  if (!data.ok) {
    return interaction.editReply({
      embeds: [errEmbed((data.errors || ['Analisis gagal.']).join('\n'), 'Gagal menghasilkan sinyal')],
    });
  }

  const color = config.embeds[data.action] ?? config.embeds.base;
  const fields = [];

  fields.push(
    { name: 'Bias', value: String(data.bias ?? '—').toUpperCase(), inline: true },
    { name: 'Aksi', value: ARROW[data.action] ?? String(data.action ?? '—').toUpperCase(), inline: true },
    { name: 'Confidence', value: `${Math.round((data.confidence ?? 0) * 100)}%`, inline: true },
  );

  const pricing = [
    [`Entry`, fmt(data.entry)],
    [`Stop Loss`, fmt(data.stop_loss)],
    [`Take Profit`, fmt(data.take_profit)],
    [`Risk/Reward`, fmt(data.risk_reward)],
  ];
  fields.push({ name: 'Harga', value: pricing.map(([k, v]) => `**${k}:** ${v}`).join('\n'), inline: true });

  const factors = Array.isArray(data.confluence_factors) && data.confluence_factors.length
    ? data.confluence_factors.map((f) => `• ${f}`).join('\n')
    : '—';
  fields.push({ name: 'Konfluensi', value: factors, inline: false });

  if (data.rationale) fields.push({ name: 'Alasan', value: String(data.rationale).slice(0, 1024), inline: false });

  const e = embed({
    color,
    title: `📊 Sinyal XAUUSD — ${data.mode === 'live' ? 'LIVE' : 'DEMO'}`,
    description: `Aksi **${ARROW[data.action] ?? data.action}** · dihasilkan ${new Date(data.generated_utc).toLocaleString('id-ID')}${data.model ? ` · model: ${data.model}` : ''}`,
    fields,
  });

  if (data.warning) e.setFooter({ text: String(data.warning).slice(0, 200) });

  return interaction.editReply({ embeds: [e] });
}