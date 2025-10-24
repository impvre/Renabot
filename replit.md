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

## Commands
- `!stealemojis <server_id>` or `!se <server_id>` - Steal all emojis from another server
- `!stealstickers <server_id>` or `!ss <server_id>` - Steal all stickers from another server
- `!addbotmoji <name> <emoji_id>` or `!abm <name> <emoji_id>` - (Owner only) Add custom emoji to bot
- `!help` - Display help message
- `!ping` - Check bot latency

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
- Initial bot setup (October 24, 2025)
- Implemented emoji and sticker stealing commands
- Added custom embed builder with #1c1d23 color
- Created owner-only emoji management system
- Integrated with Replit Discord connector for authentication

## Architecture
- Uses Discord.js v14 with ES modules
- Replit Discord integration for token management
- Message-based command system with prefix `!`
- Modular command structure for easy maintenance
