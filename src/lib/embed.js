import { EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

const C = config.embeds;

function footer() {
  return { text: 'AI Trading Bot' };
}

export function embed({ color = C.base, title = '', description = '', fields = [] } = {}) {
  const e = new EmbedBuilder({ color, title, description, timestamp: new Date(), footer: footer() });
  e.setFields(fields);
  return e;
}

export function okEmbed(title, description = '') {
  return embed({ color: C.success, title, description });
}

export function errEmbed(description, title = 'Terjadi kesalahan') {
  return embed({ color: C.error, title, description });
}

export async function reply(interaction, message, ephemeral = false) {
  const opts = { embeds: [message] };
  if (interaction.deferred || interaction.replied) {
    return interaction.editReply(opts);
  }
  return interaction.reply({ ...opts, ...(ephemeral ? { ephemeral } : {}) });
}