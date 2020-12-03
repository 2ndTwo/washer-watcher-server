const CONFIG = require("./config.json");

const Discord = require("discord.js");
const client = new Discord.Client();

const adminUser = CONFIG.users.find((user) => user.is_admin === true);
const adminUserId = adminUser.discord_id;
console.log(adminUserId);

function logError(message) {
  //client.users.cache.get(adminUserId).send(message);
  console.error(message);
}

client.once("ready", () => {
  console.info("Discord server ready");
  client.users.fetch(adminUserId).then((user) => user.send("Bot server ready"));
});

client.login(process.env.DISCORD_BOT_TOKEN);
