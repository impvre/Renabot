import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, createSuccessEmbed, createErrorEmbed, createWarningEmbed } from '../utils/embedBuilder.js';
import { CONFIG } from '../config.js';

export async function handleStealEmojis(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return interaction.reply({
      embeds: [createErrorEmbed('You need **Manage Expressions** permission to use this command.')],
      ephemeral: true
    });
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    return interaction.reply({
      embeds: [createErrorEmbed('I need **Manage Expressions** permission to steal emojis.')],
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
    const emojis = await sourceGuild.emojis.fetch();
    
    if (emojis.size === 0) {
      return interaction.editReply({
        embeds: [createWarningEmbed('No emojis found in that server.')]
      });
    }

    const emojiLimit = interaction.guild.premiumTier === 3 ? 250 : 
                       interaction.guild.premiumTier === 2 ? 150 : 
                       interaction.guild.premiumTier === 1 ? 100 : 50;
    
    const currentEmojiCount = interaction.guild.emojis.cache.size;
    const availableSlots = emojiLimit - currentEmojiCount;

    if (availableSlots <= 0) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`Your server has reached the emoji limit (${currentEmojiCount}/${emojiLimit}).`)]
      });
    }

    await interaction.editReply({
      embeds: [createEmbed({
        title: 'Processing',
        description: `Fetching emojis from **${sourceGuild.name}**\nFound ${emojis.size} emojis`,
        timestamp: true
      })]
    });

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const [id, emoji] of emojis) {
      if (successCount >= availableSlots) {
        errors.push(`Reached emoji limit after ${successCount} emojis`);
        break;
      }

      try {
        await interaction.guild.emojis.create({
          attachment: emoji.url,
          name: emoji.name
        });
        successCount++;
        
        if (successCount % 10 === 0) {
          await interaction.editReply({
            embeds: [createEmbed({
              title: 'Processing',
              description: `Progress: ${successCount}/${emojis.size} emojis transferred`,
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
          errors.push(`Failed: ${emoji.name}`);
        }
      }
    }

    const resultEmbed = createEmbed({
      title: 'Transfer Complete',
      description: `Successfully transferred **${successCount}** emojis from **${sourceGuild.name}**`,
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

    await interaction.editReply({ embeds: [resultEmbed] });

  } catch (error) {
    console.error('Error stealing emojis:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(`An error occurred: ${error.message}`)]
    });
  }
}
