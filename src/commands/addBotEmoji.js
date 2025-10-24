import { createErrorEmbed, createSuccessEmbed } from '../utils/embedBuilder.js';
import { CONFIG } from '../config.js';
import fs from 'fs/promises';

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

export async function handleAddBotEmoji(interaction) {
  if (interaction.user.id !== CONFIG.OWNER_ID) {
    return interaction.reply({
      embeds: [createErrorEmbed('Only the bot owner can use this command.')],
      ephemeral: true
    });
  }

  const emojiName = interaction.options.getString('name');
  const emojiId = interaction.options.getString('emoji_id');

  await interaction.deferReply({ ephemeral: true });

  try {
    const emoji = await interaction.client.emojis.fetch(emojiId);
    
    if (!emoji) {
      return interaction.editReply({
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

    return interaction.editReply({
      embeds: [createSuccessEmbed(
        `Successfully added custom emoji **${emojiName}**: ${emoji}\n\n` +
        `You can now use this emoji in the bot by referencing \`${emojiName.toUpperCase()}\`.`
      )]
    });

  } catch (error) {
    console.error('Error adding bot emoji:', error);
    return interaction.editReply({
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
