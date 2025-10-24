# Rena - Discord Emoji & Sticker Thief Bot

A powerful Discord bot for stealing (copying) emojis and stickers from other servers with beautiful custom embeds.

## Features

- **Mass Emoji Stealing** - Clone all emojis from another server to yours
- **Sticker Stealing** - Clone stickers from another server
- **Custom Styling** - All embeds use #1c1d23 color for a sleek dark theme
- **Progress Tracking** - Real-time updates during emoji/sticker theft
- **Permission Checks** - Ensures proper permissions before operations
- **Owner Commands** - Add custom emojis to the bot itself (owner only)

## Commands

All commands are slash commands - just type `/` in Discord to see them!

### Emoji & Sticker Commands
- `/stealemojis <server_id>` - Steal all emojis from another server
- `/stealstickers <server_id>` - Steal all stickers from another server

### Bot Management (Owner Only)
- `/addbotmoji <name> <emoji_id>` - Add a custom emoji to the bot (hidden from public)

### Utility
- `/help` - Display help message with all commands
- `/ping` - Check bot latency

## Requirements

- Both you and the bot need **Manage Expressions** permission
- The bot must be in both the source and target servers
- To get a server ID, enable Developer Mode in Discord and right-click a server

## Emoji & Sticker Limits

The bot respects Discord's server limits based on boost level:

**Emojis:**
- No boost: 50 emojis
- Level 1: 100 emojis
- Level 2: 150 emojis
- Level 3: 250 emojis

**Stickers:**
- No boost: 5 stickers
- Level 1: 15 stickers
- Level 2: 30 stickers
- Level 3: 60 stickers

## Setup

The bot is already configured and running! Just invite it to your servers and start using the commands.

## How to Use

1. Invite the bot to both the source server (where emojis are) and target server (where you want them)
2. Get the source server's ID (right-click server → Copy Server ID)
3. In the target server, use `/stealemojis <server_id>` or `/stealstickers <server_id>`
4. Watch the progress as emojis/stickers are copied!

## Owner Commands

The `/addbotmoji` command is hidden from regular users and only visible to the bot owner. This allows you to add custom emojis that the bot can use in its messages and embeds.

## Notes

- The bot will stop if it reaches your server's emoji/sticker limit
- Failed emojis/stickers will be listed in the result
- Progress updates every 10 emojis to avoid rate limiting
