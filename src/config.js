import botEmojis from './botEmojis.json' with { type: 'json' };

export const CONFIG = {
  EMBED_COLOR: 0x1c1d23,
  OWNER_ID: process.env.OWNER_ID || '',
  BOT_EMOJIS: {}
};

// Load all bot emojis from botEmojis.json
for (const [name, id] of Object.entries(botEmojis)) {
  // Check if it's an animated emoji (you'd need to track this separately or check the original format)
  CONFIG.BOT_EMOJIS[name] = id;
}
