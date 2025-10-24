import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, createErrorEmbed } from '../utils/embedBuilder.js';

export async function handleCloneEmojis(interaction) {
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

  const emojisInput = interaction.options.getString('emojis');

  await interaction.deferReply();

  try {
    // Extract all emojis from input: <:name:id> or <a:name:id>
    const emojiRegex = /<(a?):([^:]+):(\d+)>/g;
    const matches = [...emojisInput.matchAll(emojiRegex)];
    
    if (matches.length === 0) {
      return interaction.editReply({
        embeds: [createErrorEmbed('No valid custom emojis found. Please paste Discord custom emojis.')]
      });
    }

    if (matches.length > 50) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`Too many emojis. Maximum is 50, you provided ${matches.length}.`)]
      });
    }

    // Check emoji limit
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
        description: `Found ${matches.length} emojis to clone\nAvailable slots: ${availableSlots}`,
        timestamp: true
      })]
    });

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;
    const errors = [];
    const skipped = [];

    for (const match of matches) {
      if (successCount >= availableSlots) {
        failCount += (matches.length - successCount - skipCount);
        errors.push(`Reached emoji limit after ${successCount} emojis`);
        break;
      }

      const isAnimated = match[1] === 'a';
      const emojiName = match[2];
      const emojiId = match[3];

      // Check if emoji already exists
      const existingEmoji = interaction.guild.emojis.cache.find(e => e.name === emojiName);
      if (existingEmoji) {
        skipCount++;
        skipped.push(emojiName);
        continue;
      }

      try {
        const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
        
        await interaction.guild.emojis.create({
          attachment: emojiUrl,
          name: emojiName
        });
        
        successCount++;
        
        // Update progress every 5 emojis
        if (successCount % 5 === 0) {
          await interaction.editReply({
            embeds: [createEmbed({
              title: 'Processing',
              description: `Progress: ${successCount + skipCount}/${matches.length} emojis processed\nCloned: ${successCount} | Skipped: ${skipCount}`,
              timestamp: true
            })]
          });
        }
      } catch (error) {
        failCount++;
        if (error.code === 50013) {
          errors.push(`Missing permissions`);
        } else if (error.code === 30008) {
          errors.push(`Emoji limit reached`);
          break;
        } else {
          errors.push(`Failed: ${emojiName}`);
        }
      }
    }

    const resultEmbed = createEmbed({
      title: 'Clone Complete',
      description: `Processed ${matches.length} emojis`,
      fields: [
        { name: 'Cloned', value: `${successCount}`, inline: true },
        { name: 'Skipped', value: `${skipCount}`, inline: true },
        { name: 'Failed', value: `${failCount}`, inline: true }
      ],
      timestamp: true
    });

    if (skipped.length > 0 && skipped.length <= 10) {
      resultEmbed.addFields({ 
        name: 'Skipped (Already Exists)', 
        value: skipped.slice(0, 10).join(', ')
      });
    }

    if (errors.length > 0 && errors.length <= 5) {
      resultEmbed.addFields({ 
        name: 'Errors', 
        value: errors.slice(0, 5).join('\n')
      });
    }

    await interaction.editReply({ embeds: [resultEmbed] });

  } catch (error) {
    console.error('Error cloning emojis:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(`An error occurred: ${error.message}`)]
    });
  }
}
