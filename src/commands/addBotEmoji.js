import { createErrorEmbed, createSuccessEmbed } from '../utils/embedBuilder.js';
import { CONFIG } from '../config.js';
import fs from 'fs/promises';

const BOT_EMOJIS_FILE = './src/botEmojis.json';

async function loadBotEmojisData() {
  try {
    const data = await fs.readFile(BOT_EMOJIS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveBotEmojisData(emojis) {
  await fs.writeFile(BOT_EMOJIS_FILE, JSON.stringify(emojis, null, 2));
}

export async function handleAddBotEmoji(interaction) {
  if (interaction.user.id !== CONFIG.OWNER_ID) {
    return interaction.reply({
      embeds: [createErrorEmbed('Only the bot owner can use this command.')],
      ephemeral: true
    });
  }

  const name = interaction.options.getString('name');
  const emojiInput = interaction.options.getString('emoji');

  await interaction.deferReply({ ephemeral: true });

  try {
    // Extract emoji ID from different formats
    let emojiId = null;
    let emojiName = null;
    let isAnimated = false;

    // Check if it's a Discord emoji format: <:name:id> or <a:name:id>
    const emojiMatch = emojiInput.match(/<(a?):([^:]+):(\d+)>/);
    
    if (emojiMatch) {
      // Pasted emoji format
      isAnimated = emojiMatch[1] === 'a';
      emojiName = emojiMatch[2];
      emojiId = emojiMatch[3];
    } else if (/^\d+$/.test(emojiInput)) {
      // Just an ID was provided
      emojiId = emojiInput;
    } else {
      return interaction.editReply({
        embeds: [createErrorEmbed('Invalid emoji format. Please paste the emoji directly or provide its ID.')]
      });
    }

    // Try to fetch the emoji from bot's accessible guilds
    let emoji = null;
    for (const guild of interaction.client.guilds.cache.values()) {
      try {
        emoji = await guild.emojis.fetch(emojiId);
        if (emoji) {
          isAnimated = emoji.animated;
          emojiName = emoji.name;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (!emoji) {
      return interaction.editReply({
        embeds: [createErrorEmbed('Could not find that emoji. Make sure the bot is in the server with that emoji.')]
      });
    }

    // Load current emojis and add the new one
    const botEmojis = await loadBotEmojisData();
    botEmojis[name] = emojiId;

    await saveBotEmojisData(botEmojis);

    // Update in-memory config
    CONFIG.BOT_EMOJIS[name] = emojiId;

    const displayEmoji = isAnimated ? `<a:${emojiName}:${emojiId}>` : `<:${emojiName}:${emojiId}>`;

    return interaction.editReply({
      embeds: [createSuccessEmbed(
        `Successfully added custom emoji **${name}**: ${displayEmoji}\n\n` +
        `Emoji ID: \`${emojiId}\``
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
    const botEmojis = await loadBotEmojisData();
    CONFIG.BOT_EMOJIS = { ...botEmojis };
    console.log(`Loaded ${Object.keys(botEmojis).length} custom bot emojis`);
  } catch (error) {
    console.error('Error loading bot emojis:', error);
  }
}
