const { logError } = require("./utilities");

const config = require("./config.json");

function onMessage(client, message) {
  if (message.author.bot || message.channel.type !== "dm") return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (!client.commands.has(command)) return;

  try {
    client.commands.get(command).execute(message, args);
  } catch (error) {
    logError(error);
    message.reply("There was an error trying to execute that command!");
  }
}

function cycleFinishedMessage(discordClient, machine, userId, userName) {
  const message = `Your ${machine} load has finished!`;

  discordClient.users
    .fetch(userId)
    .then((user) => user.send(message))
    .catch((err) => {
      console.error(`Error telling user (${userName}) their load finished:`);
      console.error(err);
    });
}

module.exports = {
  onMessage,
  cycleFinishedMessage,
};
