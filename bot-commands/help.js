module.exports = {
  name: "help",
  description: "Show a list of available commands",
  execute(message) {
    message.author.send(
      "I'm the laundry bot! I keep you up-to-date on the latest laundry-related news.\n" +
        "\n" +
        "`help` - Show this helpful message.\n" +
        "\n" +
        "`status` - Show the status of both the washer and dryer\n" +
        "`status washer` - Show the status of just the washer\n" +
        "`status dryer` - Show the status of just the dryer\n"
    );
  },
};
