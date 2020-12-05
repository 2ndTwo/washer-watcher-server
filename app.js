require("dotenv").config();
const config = require("./config.json");
const discordApi = require("./discord-api");
const serverApi = require("./server-api");
const { logInfo, logError } = require("./utilities");

/* Set up Discord bot */

const Discord = require("discord.js");
const client = new Discord.Client();

client.once("ready", () => {
  logInfo("Discord bot is up!", client);
});

console.log(discordApi);

client.on("message", (message) => {
  discordApi.onMessage(client, message);
});

client.login(process.env.DISCORD_BOT_TOKEN);

/* Set up API server */

const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`API server ready at http://localhost:${port}`);
});
