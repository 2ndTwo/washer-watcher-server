const { logError } = require("./utilities");

let discordClient;

function addDiscordClient(client) {
  discordClient = client;
}

function onMessage(message) {
  if (message.author.bot || message.channel.type !== "dm") return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (!discordClient.commands.has(command)) return;

  try {
    discordClient.commands.get(command).execute(message, args);
  } catch (error) {
    logError(error);
    message.reply("There was an error trying to execute that command!");
  }
}

function cycleFinishedMessage(machine, userId, userName) {
  const message = `Your ${machine} load has finished!`;

  discordClient.users
    .fetch(userId)
    .then((user) => user.send(message))
    .catch((err) => {
      logError(`Error telling user (${userName}) their load finished:\n` + err);
    });
}

module.exports = {
  addDiscordClient,
  onMessage,
  cycleFinishedMessage,
};
