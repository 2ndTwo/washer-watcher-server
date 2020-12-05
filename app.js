const fs = require("fs");
const Discord = require("discord.js");
const express = require("express");
const moment = require("moment");

const discordApi = require("./discord-api");
const router = require("./server-api");
const { logInfo, logError, saveState, loadState } = require("./utilities");

const config = require("./config.json");

/* Set up save data */

let state = {};

if (fs.existsSync("./state.json")) {
  state = loadState();
} else {
  let usersState = {};

  for (const user of config.users) {
    usersState[user.name] = {
      washer_durations: [], // In ms
      dryer_durations: [], // In ms
      reminder_active: true,
      // Saved as ms instead of minutes for consistency with other time values
      reminder_duration: moment
        .duration(config.default_reminder_duration, "minutes")
        .milliseconds(),
    };
  }

  state = {
    version: 1,
    washer: {
      started: null, // epoch ms when load started
      status: "empty",
      user: null,
      queue: [],
    },
    dryer: {
      started: null, // epoch ms when load started
      status: "empty",
      user: null,
    },
    users: usersState,
  };

  saveState(state);
}

/* Set up Discord bot */

const client = new Discord.Client();
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
});

client.on("message", (message) => {
  discordApi.onMessage(client, message);
});

client.login(config.discord_bot_token);

/* Set up API server */

const app = express();

app.use(router);

app.listen(config.api_port, () => {
  console.info(`API server ready at http://localhost:${config.api_port}`);
});
