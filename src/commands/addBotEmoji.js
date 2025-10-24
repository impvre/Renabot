import { createErrorEmbed, createSuccessEmbed } from '../utils/embedBuilder.js';
import { CONFIG } from '../config.js';
import fs from 'fs/promises';
import path from 'path';

const CUSTOM_EMOJIS_FILE = './data/customEmojis.json';

async function loadCustomEmojis() {
  try {
    const data = await fs.readFile(CUSTOM_EMOJIS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveCustomEmojis(emojis) {
  await fs.mkdir('./data', { recursive: true });
  await fs.writeFile(CUSTOM_EMOJIS_FILE, JSON.stringify(emojis, null, 2));
}

export async function handleAddBotEmoji(message, args) {
  if (message.author.id !== CONFIG.OWNER_ID) {
    return message.reply({
      embeds: [createErrorEmbed('Only the bot owner can use this command.')]
    });
  }

  const emojiName = args[0];
  const emojiId = args[1];

  if (!emojiName || !emojiId) {
    return message.reply({
      embeds: [createErrorEmbed('Please provide emoji name and ID.\n\n**Usage:** `!addbotmoji <name> <emoji_id>`\n**Example:** `!addbotmoji success 1234567890`')]
    });
  }

  try {
    const emoji = await message.client.emojis.fetch(emojiId);
    
    if (!emoji) {
      return message.reply({
        embeds: [createErrorEmbed('Could not find an emoji with that ID. Make sure the bot is in the server with that emoji.')]
      });
    }

    const customEmojis = await loadCustomEmojis();
    customEmojis[emojiName.toUpperCase()] = {
      id: emoji.id,
      name: emoji.name,
      animated: emoji.animated,
      format: emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`
    };

    await saveCustomEmojis(customEmojis);

    CONFIG.BOT_EMOJIS[emojiName.toUpperCase()] = customEmojis[emojiName.toUpperCase()].format;

    return message.reply({
      embeds: [createSuccessEmbed(
        `Successfully added custom emoji **${emojiName}**: ${emoji}\n\n` +
        `You can now use this emoji in the bot by referencing \`${emojiName.toUpperCase()}\`.`
      )]
    });

  } catch (error) {
    console.error('Error adding bot emoji:', error);
    return message.reply({
      embeds: [createErrorEmbed(`Failed to add emoji: ${error.message}`)]
    });
  }
}

export async function loadBotEmojis(client) {
  try {
    const customEmojis = await loadCustomEmojis();
    for (const [name, emojiData] of Object.entries(customEmojis)) {
      CONFIG.BOT_EMOJIS[name] = emojiData.format;
    }
    console.log(`Loaded ${Object.keys(customEmojis).length} custom bot emojis`);
  } catch (error) {
    console.error('Error loading bot emojis:', error);
  }
}
