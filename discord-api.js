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
  let message = `Your ${machine} load has finished!`;

  if (machine === "washer") {
    message +=
      "\nDon't forget to leave the washer's door open (to let it dry out) and if you're putting your laundry in the dryer make sure to clean the lint trap first.";
  }

  discordClient.users
    .fetch(userId)
    .then((user) => user.send(message))
    .catch((err) => {
      logError(`Error telling user (${userName}) their load finished:\n` + err);
    });
}

function reminderMessage(fullMachines, userId, userName) {
  let message;
  if (fullMachines.length === 1) {
    message = `The ${fullMachines} is full with your laundry, don't forget to unload it!`;
  } else {
    message = `Both the ${fullMachines[0]} and ${fullMachines[1]} are full with your laundry, don't forget to unload them!`;
  }

  discordClient.users
    .fetch(userId)
    .then((user) => user.send(message))
    .catch((err) => {
      logError(`Error sending user (${userName}) reminder:\n` + err);
    });
}

module.exports = {
  addDiscordClient,
  onMessage,
  cycleFinishedMessage,
  reminderMessage,
};
