# Discord.js Broadcast Bot

This project is a Discord bot built using the [Discord.js](https://discord.js.org) library. The bot allows server administrators to send broadcast messages to various target groups, including all members, online members, offline members, or specific users.

## Features
- **Broadcast Messages**:
  - Send messages to all server members.
  - Send messages to only online or offline members.
  - Send messages to a specific user.
- **Role-Based Access Control**:
  - Only users with a specific role (configured in the `config.json` file) can use the bot's broadcast features.
- **Rate Limiting**:
  - Ensures compliance with Discord's rate limits to avoid being banned for excessive messaging.
- **Interactive Modals**:
  - Collect user input (such as message content) via modals.
- **Queue System**:
  - Broadcasts are processed sequentially to ensure stability and efficiency.

## Prerequisites

Before running the bot, make sure you have the following:

1. Node.js installed (version 16.9.0 or higher).
2. A Discord bot token. You can create a bot by following the [Discord Developer Portal guide](https://discord.com/developers/docs/intro).
3. Permissions to invite the bot to your server with `MESSAGE` and `GUILD` intents enabled.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Abu-al-Hun/discord-bot-broadcast.git
   ```
2. Navigate to the project directory:
   ```bash
   cd discord-bot-broadcast
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Create a `config.json` file in the root directory with the following structure:
   ```json
   {
     "TOKEN": "your_bot_token_here",
     "prefix": "!",
     "adminRole": "admin_role_id_here",
     "embedImage": "image_url_here"
   }
   ```
   Replace `your_bot_token_here`, `admin_role_id_here`, and `image_url_here` with your bot token, the role ID for admin access, and an image URL for embeds, respectively.

## Usage

1. Start the bot:
   ```bash
   node index.js
   ```
2. Invite the bot to your server.
3. Use the `!bc` command to initiate a broadcast. Follow the on-screen instructions to select the type of broadcast and input the message content.

## Commands

### `!bc`
Starts the broadcast process and presents interactive options to the user. The available broadcast types include:
- Send to all members.
- Send to online members.
- Send to offline members.
- Send to a specific user.

## Development Notes

- **Rate Limiting**: The bot enforces a maximum of 190 messages per minute to comply with Discord's API limits.
- **Batch Processing**: Messages are sent in batches of 10 with a delay of 10 seconds between each batch.
- **Error Handling**: Handles cases where members have DMs disabled.

## Links
- [GitHub Repository](https://github.com/Abu-al-Hun/discord-bot-broadcast)
- [Live Project on Glitch](https://glitch.com/~discord-bot-broadcast)

## Dependencies
- [discord.js](https://www.npmjs.com/package/discord.js)

## License
This project is licensed under the MIT License. Feel free to use and modify it as needed.

