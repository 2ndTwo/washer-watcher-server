const {
  getUserNameFromId,
  getMachineUser,
  getMachineStatus,
} = require("../state-manager");
const { logError, lowerFirstLetter } = require("../utilities");

function getMachineStatusText(machine, userName) {
  const machineUser = getMachineUser(machine);
  const machineStatus = getMachineStatus(machine);

  if (machineStatus === "empty") {
    return `The ${machine} is empty`;
  } else {
    let loadOwnerText;
    if (machineUser === userName) {
      loadOwnerText = "with your load";
    } else if (machineUser === null) {
      loadOwnerText = "with an unclaimed load";
    } else {
      loadOwnerText = "with someone else's load";
    }

    return `The ${machine} is ${machineStatus} (${loadOwnerText})`;
  }
}

module.exports = {
  name: "status",
  description:
    "Show the status of either both the washer and dryer or a specific machine",
  execute(message, args) {
    if (args.length > 0) {
      const machine = args[0];
      if (["washer", "dryer"].includes(machine)) {
        const userName = getUserNameFromId(message.author.id);
        const machineMessage = getMachineStatusText(machine, userName);

        message.author.send(`${machineMessage}.`).catch((err) => {
          logError(
            `Error sending reply for \`status ${machine}\` command\n` + err
          );
        });
      } else {
        message.author
          .send(
            `Invalid argument (${machine}), must be either \`washer\` and \`dryer\`.`
          )
          .catch((err) => {
            logError(
              `Error sending invalid argument reply for \`status ${machine}\` command\n` +
                err
            );
          });
      }
    } else {
      if (
        getMachineStatus("washer") === "empty" &&
        getMachineStatus("dryer") === "empty"
      ) {
        message.author
          .send("The washer is empty and the dryer is too.")
          .catch((err) => {
            logError(`Error sending reply for \`status\` command\n` + err);
          });
      } else {
        const userName = getUserNameFromId(message.author.id);
        const washerMessage = getMachineStatusText("washer", userName);
        const dryerMessage = getMachineStatusText("dryer", userName);

        message.author
          .send(`${washerMessage} and ${lowerFirstLetter(dryerMessage)}.`)
          .catch((err) => {
            logError(`Error sending reply for \`status\` command\n` + err);
          });
      }
    }
  },
};
