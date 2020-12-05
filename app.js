const config = require("./config.json");
const discordApi = require("./discord-api");
const serverApi = require("./server-api");
const { logInfo, logError } = require("./utilities");

/* Set up Discord bot */

const Discord = require("discord.js");
const client = new Discord.Client();

client.once("ready", () => {
  console.info("Discord bot is up!");
});

console.log(discordApi);

client.on("message", (message) => {
  discordApi.onMessage(client, message);
});

client.login(config.discord_bot_token);

/* Set up API server */

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(config.api_port, () => {
  console.info(`API server ready at http://localhost:${config.api_port}`);
});
