import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, createSuccessEmbed, createErrorEmbed, createWarningEmbed } from '../utils/embedBuilder.js';
import { CONFIG } from '../config.js';

export async function handleStealStickers(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return interaction.reply({
      embeds: [createErrorEmbed('You need **Manage Expressions** permission to use this command.')],
      ephemeral: true
    });
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return interaction.reply({
      embeds: [createErrorEmbed('I need **Manage Expressions** permission to steal stickers.')],
      ephemeral: true
    });
  }

  await interaction.deferReply();

  const sourceServerId = interaction.options.getString('server_id');

  let sourceGuild;
  try {
    sourceGuild = await interaction.client.guilds.fetch(sourceServerId);
  } catch (error) {
    return interaction.editReply({
      embeds: [createErrorEmbed('I cannot access that server. Make sure I\'m in the server and the ID is correct.')]
    });
  }

  try {
    const stickers = await sourceGuild.stickers.fetch();
    
    if (stickers.size === 0) {
      return interaction.editReply({
        embeds: [createWarningEmbed('No stickers found in that server.')]
      });
    }

    const stickerLimit = interaction.guild.premiumTier === 3 ? 60 : 
                         interaction.guild.premiumTier === 2 ? 30 : 
                         interaction.guild.premiumTier === 1 ? 15 : 5;
    const currentStickerCount = interaction.guild.stickers.cache.size;
    const availableSlots = stickerLimit - currentStickerCount;

    if (availableSlots <= 0) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`Your server has reached the sticker limit (${currentStickerCount}/${stickerLimit}).`)]
      });
    }

    await interaction.editReply({
      embeds: [createEmbed({
        title: 'Processing',
        description: `Fetching stickers from **${sourceGuild.name}**\nFound ${stickers.size} stickers`,
        timestamp: true
      })]
    });

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const [id, sticker] of stickers) {
      if (successCount >= availableSlots) {
        errors.push(`Reached sticker limit after ${successCount} stickers`);
        break;
      }

      try {
        const response = await fetch(sticker.url);
        const buffer = await response.arrayBuffer();
        
        await interaction.guild.stickers.create({
          file: Buffer.from(buffer),
          name: sticker.name,
          tags: sticker.tags || '⭐',
          description: sticker.description || 'Stolen sticker'
        });
        successCount++;
        
        if (successCount % 3 === 0 || successCount === 1) {
          await interaction.editReply({
            embeds: [createEmbed({
              title: 'Processing',
              description: `Progress: ${successCount}/${Math.min(stickers.size, availableSlots)} stickers transferred`,
              timestamp: true
            })]
          });
        }
      } catch (error) {
        failCount++;
        if (error.code === 50013) {
          errors.push(`Missing permissions for ${sticker.name}`);
        } else if (error.code === 30039) {
          errors.push(`Sticker limit reached`);
          break;
        } else {
          errors.push(`Failed: ${sticker.name}`);
        }
      }
    }

    const resultEmbed = createEmbed({
      title: 'Transfer Complete',
      description: `Successfully transferred **${successCount}** stickers from **${sourceGuild.name}**`,
      fields: [
        { name: 'Success', value: `${successCount}`, inline: true },
        { name: 'Failed', value: `${failCount}`, inline: true },
        { name: 'Total Found', value: `${stickers.size}`, inline: true }
      ],
      timestamp: true
    });

    if (errors.length > 0) {
      resultEmbed.addFields({ 
        name: 'Errors', 
        value: errors.slice(0, 5).join('\n') 
      });
    }

    await interaction.editReply({ embeds: [resultEmbed] });

  } catch (error) {
    console.error('Error stealing stickers:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(`An error occurred: ${error.message}`)]
    });
  }
}
