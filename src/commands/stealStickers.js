import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, createSuccessEmbed, createErrorEmbed, createWarningEmbed } from '../utils/embedBuilder.js';
import { CONFIG } from '../config.js';

export async function handleStealStickers(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return message.reply({
      embeds: [createErrorEmbed('You need **Manage Expressions** permission to use this command.')]
    });
  }

  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return message.reply({
      embeds: [createErrorEmbed('I need **Manage Expressions** permission to steal stickers.')]
    });
  }

  const sourceServerId = args[0];
  
  if (!sourceServerId) {
    return message.reply({
      embeds: [createErrorEmbed('Please provide a server ID.\n\n**Usage:** `!stealstickers <server_id>`')]
    });
  }

  let sourceGuild;
  try {
    sourceGuild = await message.client.guilds.fetch(sourceServerId);
  } catch (error) {
    return message.reply({
      embeds: [createErrorEmbed('I cannot access that server. Make sure I\'m in the server and the ID is correct.')]
    });
  }

  const statusMsg = await message.reply({
    embeds: [createEmbed({
      title: `${CONFIG.BOT_EMOJIS.LOADING} Stealing Stickers`,
      description: `Fetching stickers from **${sourceGuild.name}**...`,
      timestamp: true
    })]
  });

  try {
    const stickers = await sourceGuild.stickers.fetch();
    
    if (stickers.size === 0) {
      return statusMsg.edit({
        embeds: [createWarningEmbed('No stickers found in that server.')]
      });
    }

    const stickerLimit = 5;
    const currentStickerCount = message.guild.stickers.cache.size;
    const availableSlots = stickerLimit - currentStickerCount;

    if (availableSlots <= 0) {
      return statusMsg.edit({
        embeds: [createErrorEmbed(`Your server has reached the sticker limit (${currentStickerCount}/${stickerLimit}).`)]
      });
    }

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
        
        await message.guild.stickers.create({
          file: Buffer.from(buffer),
          name: sticker.name,
          tags: sticker.tags || '⭐',
          description: sticker.description || 'Stolen sticker'
        });
        successCount++;
        
        await statusMsg.edit({
          embeds: [createEmbed({
            title: `${CONFIG.BOT_EMOJIS.LOADING} Stealing Stickers`,
            description: `Progress: ${successCount}/${Math.min(stickers.size, availableSlots)} stickers stolen...`,
            timestamp: true
          })]
        });
      } catch (error) {
        failCount++;
        if (error.code === 50013) {
          errors.push(`Missing permissions for ${sticker.name}`);
        } else if (error.code === 30039) {
          errors.push(`Sticker limit reached`);
          break;
        } else {
          errors.push(`Failed to steal ${sticker.name}: ${error.message}`);
        }
      }
    }

    const resultEmbed = createEmbed({
      title: `${CONFIG.BOT_EMOJIS.SUCCESS} Sticker Theft Complete`,
      description: `Successfully stolen **${successCount}** stickers from **${sourceGuild.name}**!`,
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

    await statusMsg.edit({ embeds: [resultEmbed] });

  } catch (error) {
    console.error('Error stealing stickers:', error);
    await statusMsg.edit({
      embeds: [createErrorEmbed(`An error occurred: ${error.message}`)]
    });
  }
}
