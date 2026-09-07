import { config } from '../config.js';
import { embed } from './embed.js';

const ARROW = { buy: '🔼 BUY', sell: '🔽 SELL', hold: '⏸ HOLD' };

export async function fetchTradingSignal(mode = 'demo', timeoutMs) {
  const url = `${config.tradingApi}/api/signal?mode=${mode}`;
  const ms = timeoutMs ?? (mode === 'live' ? 150_000 : (mode === 'real' ? 60_000 : 20_000));
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true, data: await res.json() };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function fetchTradingPrice() {
  try {
    const res = await fetch(`${config.tradingApi}/api/price`, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true, data: await res.json() };
  } catch (error) {
    return { ok: false, error };
  }
}

function fmt(v, unit = '') {
  if (v === null || v === undefined || v === '') return '—';
  return `${Number(v)}${unit}`;
}

export function tradingErrorMessage(error) {
  const why = error?.name === 'TimeoutError' ? 'server lambat/tidak balas' : error?.message || 'gagal terhubung';
  return {
    title: '⚠️ API Trading Offline',
    description: `Tidak bisa mendapat sinyal dari API trading di \`${config.tradingApi}\`.\n(${why})\n\nPastikan web app ai-trading berjalan.`,
  };
}

export function signalEmbed(data) {
  const color = config.embeds[data.action] ?? config.embeds.base;
  const fields = [];

  fields.push(
    { name: 'Bias', value: String(data.bias ?? '—').toUpperCase(), inline: true },
    { name: 'Aksi', value: ARROW[data.action] ?? String(data.action ?? '—').toUpperCase(), inline: true },
    { name: 'Confidence', value: `${Math.round((data.confidence ?? 0) * 100)}%`, inline: true },
  );

  const pricing = [
    ['Entry', fmt(data.entry)],
    ['Stop Loss', fmt(data.stop_loss)],
    ['Take Profit', fmt(data.take_profit)],
    ['Risk/Reward', fmt(data.risk_reward)],
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
  return e;
}