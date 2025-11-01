# Rena Discord Bot

## Overview
Rena is a Discord bot designed to clone custom emojis and stickers with ease. The bot features clean, aesthetic embed styling with color #1c1d23 and uses 54 custom emojis for enhanced visual appeal.

## Features
- **Single Emoji Cloning**: Clone individual emojis by pasting them
- **Bulk Emoji Cloning**: Clone up to 50 emojis at once
- **Interactive Sticker Cloning**: Clone stickers with an interactive prompt
- **Smart Handling**: Automatically skips duplicates and handles server limits
- **Clean Embed Styling**: All embeds use #1c1d23 color with no default emojis
- **Permission Checks**: Ensures proper permissions before operations
- **Progress Tracking**: Real-time updates during bulk operations

## Commands (All Slash Commands)
- `/cloneemoji <emojis>` - Clone a single custom emoji
- `/cloneemojis <emojis>` - Clone multiple emojis (up to 50)
- `/clonesticker` - Clone a sticker interactively
- `/info` - Learn about Rena and its features
- `/help` - Display all available commands
- `/ping` - Check bot latency

## Project Structure
```
/
├── src/
│   ├── index.js                    # Main bot file
│   ├── auth.js                     # Discord authentication via Replit integration
│   ├── config.js                   # Bot configuration (colors, owner ID, emojis)
│   ├── utils/
│   │   └── embedBuilder.js         # Embed creation utilities
│   └── commands/
│       ├── stealEmojis.js          # Emoji stealing logic
│       ├── stealStickers.js        # Sticker stealing logic
│       └── addBotEmoji.js          # Bot emoji management
├── data/
│   └── customEmojis.json           # Stored custom emojis
└── package.json
```

## Configuration
Set the `OWNER_ID` environment variable to your Discord user ID to use admin commands.

## Recent Changes
- **November 1, 2025**: Successfully imported project to Replit environment
  - Reconstructed corrupted index.js file
  - Installed discord.js v14.23.2
  - Set up Discord bot token via Replit Secrets
  - Bot is now running successfully with all commands registered
  - Loaded 54 custom bot emojis
- Removed old steal/transfer commands and replaced with clone commands (October 24, 2025)
- Added /cloneemoji for single emoji cloning
- Added /cloneemojis for bulk emoji cloning (up to 50)
- Added /clonesticker for interactive sticker cloning
- Added /info command to explain bot features
- Loaded 54 custom emojis into the bot
- Removed all default emojis from embeds
- Updated help command to reflect new command set
- All embeds now use clean #1c1d23 theme
- Converted all commands to slash commands (October 24, 2025)
- Changed bot status to "made with <3 by @impvre"

## Architecture
- Uses Discord.js v14 with ES modules
- Slash command system with proper permission handling
- Admin commands hidden from public (setDefaultMemberPermissions)
- Modular command structure for easy maintenance
- Streaming status presence
