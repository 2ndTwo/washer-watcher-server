const { getMachineStatus, changeMachineStatus } = require("../state-manager");
const { logError } = require("../utilities");

module.exports = {
  name: "empty",
  description: "Marks a machine as empty",
  execute(message, args) {
    if (args.length === 0) {
      message.react("❌").catch((err) => {
        logError(
          "Error reacting to incorrect usage (required argument not included) of `empty` command\n" +
            err
        );
      });
      message.author
        .send(
          "The `empty` command requires a machine to mark as empty. Try `empty washer` or `empty dryer`."
        )
        .catch((err) => {
          logError(
            "Error sending error message (required argument not included) for `empty` command\n" +
              err
          );
        });

      return;
    }

    const machine = args[0].toLowerCase();

    if (!["washer", "dryer"].includes(machine)) {
      message.react("❌").catch((err) => {
        logError(
          "Error reacting to incorrect usage (first argument not `washer` or `dryer`) of `empty` command\n" +
            err
        );
      });
      message.author
        .send(
          `The \`empty\` command only supports \`washer\` and \`dryer\` as arguments, but it looks like you used an unsupported argument (\`${machine}\`).`
        )
        .catch((err) => {
          logError(
            "Error sending error message (first argument not `washer` or `dryer`) for `empty` command\n" +
              err
          );
        });

      return;
    }

    if (getMachineStatus(machine) === "empty") {
      message.react("✅").catch((err) => {
        logError(
          `Error reacting to correct usage of \`empty\` command when the ${machine} is already empty\n` +
            err
        );
      });
      message.author
        .send(`The ${machine} has already been marked as empty.`)
        .catch((err) => {
          logError(
            `Error sending message for \`empty\` command saying the ${machine} is already empty (\`empty ${machine}\`)\n` +
              err
          );
        });

      return;
    }

    changeMachineStatus(machine, "empty");

    message.react("✅").catch((err) => {
      logError("Error reacting to correct usage of `empty` command\n" + err);
    });
    message.author
      .send(`The ${machine} has been marked as empty.`)
      .catch((err) => {
        logError(
          `Error sending status change message for \`empty\` command (\`empty ${machine}\`)\n` +
            err
        );
      });
  },
};
