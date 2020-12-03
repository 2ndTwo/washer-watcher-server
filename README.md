# Washer Watcher Server

The server component of the washer watcher system.

This server runs both the Discord bot used to power the integration and the API server that receives commands from the physical device.

## Set up

Use the [yarn](https://classic.yarnpkg.com/en/docs/install) package manager to install the server's dependencies. 

```bash
yarn init
```

Create a `config.json` file in the root of the project. You can use the included `config-example.json` as a guide.

Create a Discord bot and invite it to a server. Explaining how to do this is beyond the scope of this README, but [this](https://discordpy.readthedocs.io/en/latest/discord.html) is a great guide.

Create a `.env` file and include the following line, replacing `YOUR_BOT_TOKEN` with... your bot's token:

```dotenv
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN
```

## Usage

To start both the API and Discord server run `yarn start`. The Discord server will message the user set as the admin once it's up.

## Troubleshooting

### Bot cannot send user a message

This may be caused by the Discord bot not sharing a server with the user. In order for a Discord bot to send a DM to a user, it must share a server with them.
