const { logError } = require("./utilities");

function onMessage(client, message) {
  if (message.author.bot) {
    return;
  }
}

module.exports = {
  onMessage,
};
