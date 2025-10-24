import { SlashCommandBuilder, REST, Routes, PermissionFlagsBits, ActivityType } from 'discord.js';
import { getDiscordClient } from './auth.js';
import { handleCloneEmoji } from './commands/cloneEmoji.js';
import { handleCloneEmojis } from './commands/cloneEmojis.js';
import { handleCloneSticker } from './commands/cloneSticker.js';
import { loadBotEmojis } from './commands/addBotEmoji.js';
import { createEmbed, createSuccessEmbed, createErrorEmbed } from './utils/embedBuilder.js';
import { CONFIG } from './config.js';

const commands = [
  new SlashCommandBuilder()
    .setName('cloneemoji')
    .setDescription('Clone a single custom emoji')
    .addStringOption(option =>
      option.setName('emojis')
        .setDescription('Paste the emoji you want to clone')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions),
  
  new SlashCommandBuilder()
    .setName('cloneemojis')
    .setDescription('Clone multiple emojis at once (up to 50)')
    .addStringOption(option =>
      option.setName('emojis')
        .setDescription('Paste all the emojis you want to clone')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions),
  
  new SlashCommandBuilder()
    .setName('clonesticker')
    .setDescription('Clone a sticker (bot will ask you to send it)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions),
  
  new SlashCommandBuilder()
    .setName('info')
    .setDescription('Learn about Rena and what it can do'),
  
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
        case 'cloneemoji':
          await handleCloneEmoji(interaction);
          break;

        case 'cloneemojis':
          await handleCloneEmojis(interaction);
          break;

        case 'clonesticker':
          await handleCloneSticker(interaction);
          break;

        case 'info':
          await handleInfo(interaction);
          break;

        case 'help':
          await handleHelp(interaction);
          break;

        case 'ping':
          const ping = Date.now() - interaction.createdTimestamp;
          await interaction.reply({
            embeds: [createSuccessEmbed(`Pong! Latency: ${ping}ms | API Latency: ${Math.round(client.ws.ping)}ms`, 'Pong')]
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

async function handleInfo(interaction) {
  const infoEmbed = createEmbed({
    title: 'Rena',
    description: 'A Discord bot designed to help you clone custom emojis and stickers with ease.',
    fields: [
      {
        name: 'What can Rena do?',
        value: '**Clone Individual Items**\nQuickly clone single emojis or stickers by simply pasting them.\n\n' +
               '**Bulk Operations**\nClone up to 50 emojis at once.',
        inline: false
      },
      {
        name: 'Key Features',
        value: '• **Simple & Fast** — Paste emojis directly, no complicated steps\n' +
               '• **Smart Handling** — Automatically skips duplicates and handles limits\n' +
               '• **Bulk Support** — Clone multiple items in a single command',
        inline: false
      },
      {
        name: 'Getting Started',
        value: 'Use `/help` to see all available commands\n' +
               'Use `/info` to see this message again',
        inline: false
      }
    ],
    footer: { text: 'made with <3 by @impvre' },
    timestamp: true
  });

  await interaction.reply({ embeds: [infoEmbed] });
}

async function handleHelp(interaction) {
  const helpEmbed = createEmbed({
    title: 'Commands',
    description: 'All available commands for Rena',
    fields: [
      {
        name: 'Clone Commands',
        value: '`/cloneemoji <emojis>` — Clone a single emoji\n' +
               '`/cloneemojis <emojis>` — Clone multiple emojis (up to 50)\n' +
               '`/clonesticker` — Clone a sticker interactively',
        inline: false
      },
      {
        name: 'Utility',
        value: '`/info` — Learn about Rena\n' +
               '`/help` — Show this message\n' +
               '`/ping` — Check bot latency',
        inline: false
      },
      {
        name: 'Requirements',
        value: '• **Manage Expressions** permission required\n' +
               '• Bot must have **Manage Expressions** permission',
        inline: false
      }
    ],
    footer: { text: 'made with <3 by @impvre' },
    timestamp: true
  });

  await interaction.reply({ embeds: [helpEmbed] });
}

main().catch(console.error);
