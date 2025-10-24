import { REST, Routes } from 'discord.js';

async function unregisterAllCommands() {
  const token = process.env.DISCORD_BOT_TOKEN;

  if (!token) {
    console.error('DISCORD_BOT_TOKEN environment variable is not set');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Fetching application info...');
    const application = await rest.get('/oauth2/applications/@me');
    const clientId = application.id;

    console.log(`Unregistering all global commands for application ${clientId}...`);
    
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: [] }
    );
    
    console.log('✅ Successfully unregistered all global slash commands');
  } catch (error) {
    console.error('Error unregistering commands:', error);
    process.exit(1);
  }
}

unregisterAllCommands();
