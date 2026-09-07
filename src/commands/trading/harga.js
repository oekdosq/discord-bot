import { SlashCommandBuilder } from 'discord.js';
import { embed } from '../../lib/embed.js';
import { fetchTradingPrice } from '../../lib/trading.js';

export const data = new SlashCommandBuilder()
  .setName('harga')
  .setDescription('Harga emas XAU/USD real-time (tanpa akun)')
  .setDMPermission(true);

export async function execute(interaction) {
  await interaction.deferReply();

  const { ok, data, error } = await fetchTradingPrice();
  if (!ok || !data.ok) {
    const why = error?.message || (data?.errors || ['gagal']).join('\n');
    return interaction.editReply({
      embeds: [embed({ color: 0xe74c3c, title: '⚠️ Harga tidak tersedia', description: String(why).slice(0, 512) })],
    });
  }

  return interaction.editReply({
    embeds: [
      embed({
        color: 0xf1c40f,
        title: '🪙 Harga Emas (XAU/USD)',
        description: `**$${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**`,
        fields: [
          { name: 'Sumber', value: data.source ?? '—', inline: true },
          { name: 'Update', value: data.updated_at ? new Date(data.updated_at).toLocaleString('id-ID') : '—', inline: true },
        ],
      }),
    ],
  });
}