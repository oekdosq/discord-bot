import { SlashCommandBuilder } from 'discord.js';
import { embed } from '../../lib/embed.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Daftar semua perintah bot')
  .setDMPermission(true);

export async function execute(interaction) {
  const commands = interaction.client.commands ?? new Map();
  const groups = { Admin: [], Setup: [], Trading: [], Info: [] };

  for (const cmd of commands.values()) {
    const def = cmd.data.toJSON();
    let cat = 'Info';
    if (def.name === 'signal' || def.name === 'signalauto' || def.name === 'harga') cat = 'Trading';
    else if (def.default_member_permissions) {
      const perms = { 8: 'Admin', 32: 'Admin', 2: 'Setup', 16: 'Admin', 1: 'Setup' };
      cat = perms[BigInt(def.default_member_permissions)] ?? 'Admin';
    }
    const subs = def.options?.filter((o) => o.type === 1).map((o) => `/${def.name} ${o.name}`).join(' · ');
    groups[cat].push(subs || `/${def.name} — ${def.description}`);
  }

  const e = embed({
    title: 'Daftar Perintah',
    description: `Server ini punya **${commands.size}** perintah terdaftar.`,
    fields: Object.entries(groups).map(([name, list]) => ({
      name,
      value: list.length ? list.map((x) => `• ${x}`).join('\n') : '—',
      inline: false,
    })),
  });
  return interaction.reply({ embeds: [e] });
}