const fs = require("fs");
const Discord = require("discord.js");
const express = require("express");

const state = require("./state-manager");
const utilities = require("./utilities");
const discordApi = require("./discord-api");
const router = require("./server-api");

const config = require("./config.json");

/* Set up Discord bot */

const client = new Discord.Client();
discordApi.addDiscordClient(client);
utilities.addDiscordClient(client);
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./bot-commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./bot-commands/${file}`);
  client.commands.set(command.name, command);
}

client.once("ready", () => {
  console.info("Discord bot is up!");
  state.resumeReminders();
  state.updateDiscordStatus();
});

client.on("message", (message) => {
  discordApi.onMessage(message);
});

client.login(config.discord_bot_token);

/* Set up API server */

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(router);

app.listen(config.api_port, () => {
  console.info(`API server ready at http://localhost:${config.api_port}`);
});
