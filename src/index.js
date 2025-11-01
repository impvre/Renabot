import { SlashCommandBuilder, REST, Routes, ActivityType } from 'discord.js';
import { getDiscordClient } from './auth.js';
import { CONFIG } from './config.js';
import { handleCloneEmojis } from './commands/cloneEmojis.js';
import { handleCloneEmoji } from './commands/cloneEmoji.js';
import { handleCloneSticker } from './commands/cloneSticker.js';
import { handleAddBotEmoji, loadBotEmojis } from './commands/addBotEmoji.js';
import { EMOJIS } from './utils/embedBuilder.js';

const commands = [
  new SlashCommandBuilder()
    .setName('cloneemojis')
    .setDescription('Clone multiple emojis by pasting them')
    .addStringOption(option =>
      option.setName('emojis')
        .setDescription('Paste the emojis you want to clone')
        .setRequired(true)
    ),
  
  new SlashCommandBuilder()
    .setName('cloneemoji')
    .setDescription('Clone a single emoji')
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('The emoji to clone')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('clonesticker')
    .setDescription('Clone a sticker by pasting it')
    .addStringOption(option =>
      option.setName('sticker')
        .setDescription('Paste the sticker you want to clone')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('addbotmoji')
    .setDescription('Add a custom emoji to the bot (Owner only)')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name for the emoji')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('emoji_id')
        .setDescription('The emoji ID')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency')
].map(command => command.toJSON());

async function main() {
  try {
    console.log('Starting Rena Discord Bot...');
    
    const client = await getDiscordClient();
    console.log('Discord client logged in successfully');

    await loadBotEmojis(client);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('Slash commands registered successfully');

    client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return;

      try {
        switch (interaction.commandName) {
          case 'cloneemojis':
            await handleCloneEmojis(interaction);
            break;
          
          case 'cloneemoji':
            await handleCloneEmoji(interaction);
            break;

          case 'clonesticker':
            await handleCloneSticker(interaction);
            break;

          case 'addbotmoji':
            if (interaction.user.id !== CONFIG.OWNER_ID) {
              return interaction.reply({
                content: 'This command is only available to the bot owner.',
                ephemeral: true
              });
            }
            await handleAddBotEmoji(interaction);
            break;

          case 'help':
            const helpEmbed = {
              color: CONFIG.EMBED_COLOR,
              title: `${EMOJIS.INFO} Rena - Discord Bot Commands`,
              description: `${EMOJIS.STAR} Clone emojis and stickers with ease!`,
              fields: [
                {
                  name: `${EMOJIS.HEART} Emoji Commands`,
                  value: '`/cloneemojis <emojis>` - Clone multiple emojis\n`/cloneemoji <emoji>` - Clone a single emoji'
                },
                {
                  name: `${EMOJIS.HEART} Sticker Commands`,
                  value: '`/clonesticker <sticker>` - Clone a sticker'
                },
                {
                  name: `${EMOJIS.QUESTION} Utility`,
                  value: '`/help` - Show this message\n`/ping` - Check bot latency'
                },
                {
                  name: `${EMOJIS.WARNING} Requirements`,
                  value: 'Both you and the bot need **Manage Expressions** permission'
                }
              ],
              timestamp: new Date().toISOString()
            };
            await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
            break;

          case 'ping':
            const latency = Date.now() - interaction.createdTimestamp;
            const apiLatency = Math.round(client.ws.ping);
            await interaction.reply({
              content: `${EMOJIS.SUCCESS} Pong! Latency: ${latency}ms | API: ${apiLatency}ms`,
              ephemeral: true
            });
            break;
        }
      } catch (error) {
        console.error('Error handling interaction:', error);
        const errorMessage = { content: 'An error occurred while processing your command.', ephemeral: true };
        
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      }
    });

    client.on('ready', () => {
      console.log(`Bot is ready! Logged in as ${client.user.tag}`);
      
      const serverCount = client.guilds.cache.size;
      const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
      
      client.user.setPresence({
        activities: [{
          name: `${serverCount} servers & ${userCount} users`,
          type: ActivityType.Watching
        }],
        status: 'idle'
      });
      
      console.log(`Serving ${serverCount} servers with ${userCount} total users`);
      console.log('Status set to idle - Watching servers and users');
    });

    console.log('Bot is now running!');
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

main();
