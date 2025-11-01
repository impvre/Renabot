import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CONFIG } from '../config.js';

function getEmoji(name) {
  const emojiId = CONFIG.BOT_EMOJIS[name];
  if (!emojiId) return '';
  
  const animatedEmojis = ['02_bubbles', '02_butterfly', '002_pinkHeartbubble3', '002_pink', '__', 'farm_1Question', '004star', 'a02_bouncecat', 'a02_bouncekitten', 'a02_bouncerabbit', 'a4_april_plant2', '9_heart5', '9_heart1', '1_rainbow', '4_mail', '4_heart_hands'];
  const isAnimated = animatedEmojis.includes(name);
  
  return `<${isAnimated ? 'a' : ''}:${name}:${emojiId}>`;
}

export const EMOJIS = {
  SUCCESS: getEmoji('002_check'),
  ERROR: getEmoji('002_deny'),
  WARNING: getEmoji('002_pinkinfo'),
  INFO: getEmoji('02_bubbles'),
  PROCESSING: getEmoji('02_butterfly'),
  QUESTION: getEmoji('farm_1Question'),
  YES: getEmoji('farm_1Yes'),
  NO: getEmoji('farm_1No'),
  STAR: getEmoji('004star'),
  HEART: getEmoji('pp_heart')
};

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
  if (options.author) embed.setAuthor(options.author);
  
  return embed;
}

export function createSuccessEmbed(description, title = 'Success') {
  return createEmbed({
    title: `${EMOJIS.SUCCESS} ${title}`,
    description,
    timestamp: true
  });
}

export function createErrorEmbed(description, title = 'Error') {
  return createEmbed({
    title: `${EMOJIS.ERROR} ${title}`,
    description,
    timestamp: true
  });
}

export function createWarningEmbed(description, title = 'Warning') {
  return createEmbed({
    title: `${EMOJIS.WARNING} ${title}`,
    description,
    timestamp: true
  });
}

export function createInfoEmbed(description, title = 'Information') {
  return createEmbed({
    title: `${EMOJIS.INFO} ${title}`,
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
  if (options.url) button.setURL(options.url);
  
  return button;
}
