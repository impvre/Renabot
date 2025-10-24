import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CONFIG } from '../config.js';

export function createEmbed(options = {}) {
  const embed = new EmbedBuilder()
    .setColor(CONFIG.EMBED_COLOR);
  
  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.fields) embed.addFields(options.fields);
  if (options.footer) embed.setFooter(options.footer);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  if (options.timestamp) embed.setTimestamp();
  
  return embed;
}

export function createSuccessEmbed(description, title = null) {
  return createEmbed({
    title: title || `${CONFIG.BOT_EMOJIS.SUCCESS} Success`,
    description,
    timestamp: true
  });
}

export function createErrorEmbed(description, title = null) {
  return createEmbed({
    title: title || `${CONFIG.BOT_EMOJIS.ERROR} Error`,
    description,
    timestamp: true
  });
}

export function createWarningEmbed(description, title = null) {
  return createEmbed({
    title: title || `${CONFIG.BOT_EMOJIS.WARNING} Warning`,
    description,
    timestamp: true
  });
}

export function createButtonRow(buttons) {
  return new ActionRowBuilder().addComponents(buttons);
}

export function createButton(options) {
  const button = new ButtonBuilder()
    .setCustomId(options.customId)
    .setLabel(options.label)
    .setStyle(options.style || ButtonStyle.Primary);
  
  if (options.emoji) button.setEmoji(options.emoji);
  if (options.disabled) button.setDisabled(true);
  
  return button;
}
