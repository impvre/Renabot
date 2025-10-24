import { Client, GatewayIntentBits } from 'discord.js';

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=discord',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  );
  
  const data = await response.json();
  console.log('Connection response:', JSON.stringify(data, null, 2));
  
  connectionSettings = data.items?.[0];

  if (!connectionSettings) {
    throw new Error('Discord not connected - please set up the Discord integration');
  }

  const accessToken = connectionSettings?.settings?.access_token || 
                     connectionSettings?.settings?.oauth?.credentials?.access_token ||
                     connectionSettings?.settings?.bot_token;

  if (!accessToken) {
    console.error('Connection settings:', JSON.stringify(connectionSettings, null, 2));
    throw new Error('Could not find Discord token in connection settings');
  }
  
  return accessToken;
}

export async function getDiscordClient() {
  const token = await getAccessToken();

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
