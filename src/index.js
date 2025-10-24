import { getDiscordClient } from './auth.js';
import { handleStealEmojis } from './commands/stealEmojis.js';
import { handleStealStickers } from './commands/stealStickers.js';
import { handleAddBotEmoji, loadBotEmojis } from './commands/addBotEmoji.js';
import { createEmbed, createSuccessEmbed, createErrorEmbed } from './utils/embedBuilder.js';
import { CONFIG } from './config.js';

const PREFIX = '!';

async function main() {
  console.log('Starting Rena Discord Bot...');
  
  const client = await getDiscordClient();

  client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Bot is in ${client.guilds.cache.size} servers`);
    
    await loadBotEmojis(client);
    
    client.user.setActivity('Emoji Thief | !help', { type: 'PLAYING' });
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;
    if (!message.guild) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
      switch (command) {
        case 'stealemojis':
        case 'se':
          await handleStealEmojis(message, args);
          break;

        case 'stealstickers':
        case 'ss':
          await handleStealStickers(message, args);
          break;

        case 'addbotmoji':
        case 'abm':
          await handleAddBotEmoji(message, args);
          break;

        case 'help':
          await handleHelp(message);
          break;

        case 'ping':
          const ping = Date.now() - message.createdTimestamp;
          await message.reply({
            embeds: [createSuccessEmbed(`🏓 Pong! Latency: ${ping}ms | API Latency: ${Math.round(client.ws.ping)}ms`)]
          });
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      await message.reply({
        embeds: [createErrorEmbed(`An error occurred while executing the command: ${error.message}`)]
      }).catch(console.error);
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

async function handleHelp(message) {
  const helpEmbed = createEmbed({
    title: '📚 Rena - Emoji & Sticker Thief',
    description: 'A powerful bot for stealing emojis and stickers from other servers!',
    fields: [
      {
        name: `${CONFIG.BOT_EMOJIS.EMOJI} Emoji Commands`,
        value: '`!stealemojis <server_id>` or `!se <server_id>`\nSteal all emojis from another server',
        inline: false
      },
      {
        name: `${CONFIG.BOT_EMOJIS.STICKER} Sticker Commands`,
        value: '`!stealstickers <server_id>` or `!ss <server_id>`\nSteal all stickers from another server',
        inline: false
      },
      {
        name: '⚙️ Bot Management (Owner Only)',
        value: '`!addbotmoji <name> <emoji_id>` or `!abm <name> <emoji_id>`\nAdd a custom emoji to the bot for use in buttons and embeds',
        inline: false
      },
      {
        name: '🔧 Utility',
        value: '`!help` - Show this help message\n`!ping` - Check bot latency',
        inline: false
      },
      {
        name: '📝 Notes',
        value: '• You need **Manage Expressions** permission to steal emojis/stickers\n' +
               '• The bot needs **Manage Expressions** permission in both servers\n' +
               '• The bot must be in both the source and target servers\n' +
               '• Emoji limits depend on server boost level',
        inline: false
      }
    ],
    footer: { text: 'Rena Bot • Made with ❤️' },
    timestamp: true
  });

  await message.reply({ embeds: [helpEmbed] });
}

main().catch(console.error);
