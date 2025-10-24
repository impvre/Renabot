# Rena Discord Bot

## Overview
Rena is a Discord bot designed to steal (copy) emojis and stickers from other Discord servers. The bot features custom embed styling with color #1c1d23 and supports custom emoji buttons. Only the bot owner can add custom emojis to the bot itself.

## Features
- **Mass Emoji Stealing**: Clone all emojis from another server
- **Sticker Stealing**: Clone stickers from another server
- **Custom Embed Styling**: All embeds use #1c1d23 color
- **Owner-Only Emoji Management**: Add custom emojis to the bot for use in buttons/embeds
- **Permission Checks**: Ensures proper permissions before operations
- **Progress Tracking**: Real-time updates during emoji/sticker theft

## Commands (All Slash Commands)
- `/stealemojis <server_id>` - Steal all emojis from another server
- `/stealstickers <server_id>` - Steal all stickers from another server
- `/addbotmoji <name> <emoji_id>` - (Owner only, hidden from public) Add custom emoji to bot
- `/help` - Display help message
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
- Converted all commands to slash commands (October 24, 2025)
- Hidden admin commands from public view using permission settings
- Changed bot status to streaming with "made with <3 by @impvre"
- Initial bot setup (October 24, 2025)
- Implemented emoji and sticker stealing commands
- Added custom embed builder with #1c1d23 color
- Created owner-only emoji management system

## Architecture
- Uses Discord.js v14 with ES modules
- Slash command system with proper permission handling
- Admin commands hidden from public (setDefaultMemberPermissions)
- Modular command structure for easy maintenance
- Streaming status presence
