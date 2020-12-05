const fs = require("fs");

const config = require("./config.json");

function sendAdminMessage(message, discordClient) {
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

function logInfo(message, discordClient) {
  console.info(message);

  if (discordClient) {
    sendAdminMessage("ℹ " + message, discordClient);
  }
}

function logError(message, discordClient) {
  console.error(message);
  if (discordClient) {
    sendAdminMessage("🛑 " + message, discordClient);
  }
}

function saveState(data) {
  fs.writeFile("./state.json", JSON.stringify(data), (err) => {
    if (err) {
      logError("Issue saving state.json:\n" + err);
      logInfo("Current state data:\n" + data);
    }
  });
}

function loadState() {
  const rawStateFileData = fs.readFileSync("./state.json");
  return JSON.parse(rawStateFileData);
}

module.exports = {
  logInfo,
  logError,
  saveState,
  loadState,
};
