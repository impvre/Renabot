import { SlashCommandBuilder, REST, Routes, PermissionFlagsBits, ActivityType } from 'discord.js';
import { getDiscordClient } from './auth.js';
import { handleStealEmojis } from './commands/stealEmojis.js';
import { handleStealStickers } from './commands/stealStickers.js';
import { handleAddBotEmoji, loadBotEmojis } from './commands/addBotEmoji.js';
import { createEmbed, createSuccessEmbed, createErrorEmbed } from './utils/embedBuilder.js';
import { CONFIG } from './config.js';

const commands = [
  new SlashCommandBuilder()
    .setName('stealemojis')
    .setDescription('Steal all emojis from another server')
    .addStringOption(option =>
      option.setName('server_id')
        .setDescription('The ID of the server to steal emojis from')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions),
  
  new SlashCommandBuilder()
    .setName('stealstickers')
    .setDescription('Steal all stickers from another server')
    .addStringOption(option =>
      option.setName('server_id')
        .setDescription('The ID of the server to steal stickers from')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions),
  
  new SlashCommandBuilder()
    .setName('addbotmoji')
    .setDescription('Add a custom emoji to the bot (Owner only)')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name for the emoji')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('Paste the emoji here or provide its ID')
        .setRequired(true))
    .setDefaultMemberPermissions(0),
  
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),
  
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency')
].map(command => command.toJSON());

async function registerCommands(client) {
  try {
    console.log('Registering slash commands...');
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
    
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    console.log('✅ Successfully registered slash commands');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

async function main() {
  console.log('Starting Rena Discord Bot...');
  
  const client = await getDiscordClient();

  client.once('clientReady', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Bot is in ${client.guilds.cache.size} servers`);
    
    await loadBotEmojis(client);
    await registerCommands(client);
    
    client.user.setPresence({
      activities: [{ 
        name: 'made with <3 by @impvre', 
        type: ActivityType.Playing
      }],
      status: 'online'
    });
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
      switch (interaction.commandName) {
        case 'stealemojis':
          await handleStealEmojis(interaction);
          break;

        case 'stealstickers':
          await handleStealStickers(interaction);
          break;

        case 'addbotmoji':
          await handleAddBotEmoji(interaction);
          break;

        case 'help':
          await handleHelp(interaction);
          break;

        case 'ping':
          const ping = Date.now() - interaction.createdTimestamp;
          await interaction.reply({
            embeds: [createSuccessEmbed(`Pong! Latency: ${ping}ms | API Latency: ${Math.round(client.ws.ping)}ms`)]
          });
          break;
      }
    } catch (error) {
      console.error(`Error executing command ${interaction.commandName}:`, error);
      const errorEmbed = createErrorEmbed(`An error occurred: ${error.message}`);
      
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [errorEmbed] }).catch(console.error);
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(console.error);
      }
    }
  });

  client.on('error', (error) => {
    console.error('Discord client error:', error);
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    client.destroy();
    process.exit(0);
  });
}

async function handleHelp(interaction) {
  const helpEmbed = createEmbed({
    title: 'Rena',
    description: 'Transfer emojis and stickers between servers',
    fields: [
      {
        name: 'Commands',
        value: '`/stealemojis <server_id>` — Transfer all emojis from another server\n' +
               '`/stealstickers <server_id>` — Transfer all stickers from another server\n' +
               '`/ping` — Check bot latency\n' +
               '`/help` — Show this message',
        inline: false
      },
      {
        name: 'Requirements',
        value: '• **Manage Expressions** permission required for both you and the bot\n' +
               '• Bot must be present in both source and destination servers\n' +
               '• Transfer limits depend on server boost level',
        inline: false
      }
    ],
    footer: { text: 'made with <3 by @impvre' },
    timestamp: true
  });

  await interaction.reply({ embeds: [helpEmbed] });
}

main().catch(console.error);
