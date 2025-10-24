import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, createSuccessEmbed, createErrorEmbed } from '../utils/embedBuilder.js';

export async function handleCloneSticker(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return interaction.reply({
      embeds: [createErrorEmbed('You need **Manage Expressions** permission to use this command.')],
      ephemeral: true
    });
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return interaction.reply({
      embeds: [createErrorEmbed('I need **Manage Expressions** permission to clone stickers.')],
      ephemeral: true
    });
  }

  await interaction.reply({
    embeds: [createEmbed({
      title: 'Clone Sticker',
      description: 'Please send the sticker you want to clone in this channel within the next 60 seconds.',
      timestamp: true
    })]
  });

  // Create a message collector to wait for the sticker
  const filter = (message) => {
    return message.author.id === interaction.user.id && message.stickers.size > 0;
  };

  try {
    const collected = await interaction.channel.awaitMessages({
      filter,
      max: 1,
      time: 60000,
      errors: ['time']
    });

    const message = collected.first();
    const sticker = message.stickers.first();

    if (!sticker) {
      return interaction.editReply({
        embeds: [createErrorEmbed('No sticker found in your message.')]
      });
    }

    // Check if it's a custom sticker (not a default Discord sticker)
    if (!sticker.guildId) {
      return interaction.editReply({
        embeds: [createErrorEmbed('This is a default Discord sticker and cannot be cloned. Please use a custom server sticker.')]
      });
    }

    // Check sticker limit
    const stickerLimit = interaction.guild.premiumTier === 3 ? 60 : 
                         interaction.guild.premiumTier === 2 ? 30 : 
                         interaction.guild.premiumTier === 1 ? 15 : 5;
    const currentStickerCount = interaction.guild.stickers.cache.size;

    if (currentStickerCount >= stickerLimit) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`Your server has reached the sticker limit (${currentStickerCount}/${stickerLimit}).`)]
      });
    }

    // Check if sticker already exists
    const existingSticker = interaction.guild.stickers.cache.find(s => s.name === sticker.name);
    if (existingSticker) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`A sticker named **${sticker.name}** already exists in this server.`)]
      });
    }

    await interaction.editReply({
      embeds: [createEmbed({
        title: 'Processing',
        description: `Cloning sticker: **${sticker.name}**`,
        timestamp: true
      })]
    });

    // Fetch and clone the sticker
    const response = await fetch(sticker.url);
    const buffer = await response.arrayBuffer();
    
    const clonedSticker = await interaction.guild.stickers.create({
      file: Buffer.from(buffer),
      name: sticker.name,
      tags: sticker.tags || 'clone',
      description: sticker.description || 'Cloned sticker'
    });

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        `Successfully cloned sticker\n\n` +
        `**Name:** ${clonedSticker.name}\n` +
        `**ID:** \`${clonedSticker.id}\`\n` +
        `**Tags:** ${clonedSticker.tags}`,
        'Sticker Cloned'
      )]
    });

    // Delete the user's sticker message to keep the channel clean
    await message.delete().catch(() => {});

  } catch (error) {
    if (error.message === 'time') {
      return interaction.editReply({
        embeds: [createErrorEmbed('Timed out. You took too long to send a sticker.')]
      });
    }

    console.error('Error cloning sticker:', error);
    
    let errorMessage = 'Failed to clone sticker.';
    if (error.code === 50013) {
      errorMessage = 'Missing permissions to create stickers.';
    } else if (error.code === 30039) {
      errorMessage = 'Sticker limit reached.';
    } else if (error.message) {
      errorMessage = `Failed to clone sticker: ${error.message}`;
    }

    return interaction.editReply({
      embeds: [createErrorEmbed(errorMessage)]
    });
  }
}
