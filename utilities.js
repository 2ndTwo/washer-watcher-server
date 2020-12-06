const config = require("./config.json");

let discordClient;

function addDiscordClient(client) {
  discordClient = client;
}

function sendAdminMessage(message) {
  const adminUser = config.users.find((user) => user.is_admin === true);
  const adminUserId = adminUser.discord_id;

  discordClient.users
    // Fetch is used instead of cache.get because it's more reliable
    .fetch(adminUserId)
    .then((user) => {
      user.send(message).catch((err) => {
        console.error("Error sending message to admin:");
        console.error(err);
      });
    })
    .catch((err) => console.error(err));
}

function logInfo(message) {
  console.info(message);
  sendAdminMessage("ℹ " + message);
}

function logError(message) {
  console.error(message);
  sendAdminMessage("🛑 " + message);
}

function lowerFirstLetter(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

module.exports = {
  addDiscordClient,
  logInfo,
  logError,
  lowerFirstLetter,
};
