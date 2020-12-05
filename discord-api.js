const { logError } = require("./utilities");

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

module.exports = {
  onMessage,
};
