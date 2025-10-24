import { Client, GatewayIntentBits } from 'discord.js';

export async function getDiscordClient() {
  const token = process.env.DISCORD_BOT_TOKEN;

  if (!token) {
    throw new Error('DISCORD_BOT_TOKEN environment variable is not set');
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.MessageContent
    ]
  });

  await client.login(token);
  return client;
}
