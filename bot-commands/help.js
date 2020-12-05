module.exports = {
  name: "help",
  description: "Show a list of available commands",
  execute(message) {
    message.author.send(
      "I'm the laundry bot! I keep you up-to-date on the latest laundry-related news.\n" +
        "\n" +
        "`help` - Shows this helpful message.\n"
    );
  },
};
