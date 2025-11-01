import { PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embedBuilder.js';

export async function handleCloneEmoji(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return interaction.reply({
      embeds: [createErrorEmbed('You need **Manage Expressions** permission to use this command.')],
      ephemeral: true
    });
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return interaction.reply({
      embeds: [createErrorEmbed('I need **Manage Expressions** permission to clone emojis.')],
      ephemeral: true
    });
  }

  const emojiInput = interaction.options.getString('emoji');

  await interaction.deferReply();

  try {
    // Extract emoji ID from Discord emoji format: <:name:id> or <a:name:id>
    const emojiMatch = emojiInput.match(/<(a?):([^:]+):(\d+)>/);
    
    if (!emojiMatch) {
      return interaction.editReply({
        embeds: [createErrorEmbed('Invalid emoji format. Please paste a custom Discord emoji.')]
      });
    }

    const isAnimated = emojiMatch[1] === 'a';
    const emojiName = emojiMatch[2];
    const emojiId = emojiMatch[3];

    // Fetch fresh emoji data from Discord API
    await interaction.guild.emojis.fetch();

    // Check emoji limit (accounting for static and animated separately)
    const emojiLimit = interaction.guild.premiumTier === 3 ? 250 : 
                       interaction.guild.premiumTier === 2 ? 150 : 
                       interaction.guild.premiumTier === 1 ? 100 : 50;
    
    const currentEmojis = interaction.guild.emojis.cache;
    const currentEmojiCount = currentEmojis.size;
    const animatedCount = currentEmojis.filter(e => e.animated).size;
    const staticCount = currentEmojiCount - animatedCount;

    // Check if adding this emoji would exceed the limit
    if (isAnimated && animatedCount >= emojiLimit) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`Your server has reached the animated emoji limit (${animatedCount}/${emojiLimit}).`)]
      });
    } else if (!isAnimated && staticCount >= emojiLimit) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`Your server has reached the static emoji limit (${staticCount}/${emojiLimit}).`)]
      });
    }

    // Check if emoji already exists in the server
    const existingEmoji = currentEmojis.find(e => e.name === emojiName);
    if (existingEmoji) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`An emoji named **${emojiName}** already exists in this server.`)]
      });
    }

    // Construct emoji URL
    const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;

    // Clone the emoji
    const clonedEmoji = await interaction.guild.emojis.create({
      attachment: emojiUrl,
      name: emojiName
    });

    return interaction.editReply({
      embeds: [createSuccessEmbed(
        `Successfully cloned emoji ${clonedEmoji}\n\n` +
        `**Name:** ${clonedEmoji.name}\n` +
        `**ID:** \`${clonedEmoji.id}\``,
        'Emoji Cloned'
      )]
    });

  } catch (error) {
    console.error('Error cloning emoji:', error);
    
    let errorMessage = 'Failed to clone emoji.';
    if (error.code === 50013) {
      errorMessage = 'Missing permissions to create emojis.';
    } else if (error.code === 30008) {
      errorMessage = 'Emoji limit reached.';
    } else if (error.message) {
      errorMessage = `Failed to clone emoji: ${error.message}`;
    }

    return interaction.editReply({
      embeds: [createErrorEmbed(errorMessage)]
    });
  }
}
