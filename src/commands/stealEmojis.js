import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, createSuccessEmbed, createErrorEmbed, createWarningEmbed } from '../utils/embedBuilder.js';
import { CONFIG } from '../config.js';

export async function handleStealEmojis(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return message.reply({
      embeds: [createErrorEmbed('You need **Manage Expressions** permission to use this command.')]
    });
  }

  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return message.reply({
      embeds: [createErrorEmbed('I need **Manage Expressions** permission to steal emojis.')]
    });
  }

  const sourceServerId = args[0];
  
  if (!sourceServerId) {
    return message.reply({
      embeds: [createErrorEmbed('Please provide a server ID.\n\n**Usage:** `!stealemojis <server_id>`')]
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
      title: `${CONFIG.BOT_EMOJIS.LOADING} Stealing Emojis`,
      description: `Fetching emojis from **${sourceGuild.name}**...`,
      timestamp: true
    })]
  });

  try {
    const emojis = await sourceGuild.emojis.fetch();
    
    if (emojis.size === 0) {
      return statusMsg.edit({
        embeds: [createWarningEmbed('No emojis found in that server.')]
      });
    }

    const emojiLimit = message.guild.premiumTier === 3 ? 250 : 
                       message.guild.premiumTier === 2 ? 150 : 
                       message.guild.premiumTier === 1 ? 100 : 50;
    
    const currentEmojiCount = message.guild.emojis.cache.size;
    const availableSlots = emojiLimit - currentEmojiCount;

    if (availableSlots <= 0) {
      return statusMsg.edit({
        embeds: [createErrorEmbed(`Your server has reached the emoji limit (${currentEmojiCount}/${emojiLimit}).`)]
      });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const [id, emoji] of emojis) {
      if (successCount >= availableSlots) {
        errors.push(`Reached emoji limit after ${successCount} emojis`);
        break;
      }

      try {
        await message.guild.emojis.create({
          attachment: emoji.url,
          name: emoji.name
        });
        successCount++;
        
        if (successCount % 10 === 0) {
          await statusMsg.edit({
            embeds: [createEmbed({
              title: `${CONFIG.BOT_EMOJIS.LOADING} Stealing Emojis`,
              description: `Progress: ${successCount}/${emojis.size} emojis stolen...`,
              timestamp: true
            })]
          });
        }
      } catch (error) {
        failCount++;
        if (error.code === 50013) {
          errors.push(`Missing permissions for ${emoji.name}`);
        } else if (error.code === 30008) {
          errors.push(`Emoji limit reached`);
          break;
        } else {
          errors.push(`Failed to steal ${emoji.name}: ${error.message}`);
        }
      }
    }

    const resultEmbed = createEmbed({
      title: `${CONFIG.BOT_EMOJIS.SUCCESS} Emoji Theft Complete`,
      description: `Successfully stolen **${successCount}** emojis from **${sourceGuild.name}**!`,
      fields: [
        { name: 'Success', value: `${successCount}`, inline: true },
        { name: 'Failed', value: `${failCount}`, inline: true },
        { name: 'Total Found', value: `${emojis.size}`, inline: true }
      ],
      timestamp: true
    });

    if (errors.length > 0 && errors.length <= 5) {
      resultEmbed.addFields({ 
        name: 'Errors', 
        value: errors.slice(0, 5).join('\n') 
      });
    }

    await statusMsg.edit({ embeds: [resultEmbed] });

  } catch (error) {
    console.error('Error stealing emojis:', error);
    await statusMsg.edit({
      embeds: [createErrorEmbed(`An error occurred: ${error.message}`)]
    });
  }
}
