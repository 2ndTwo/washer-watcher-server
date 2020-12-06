const fs = require("fs");
const moment = require("moment");
const { cloneDeep } = require("lodash");

const { logInfo, logError } = require("./utilities");
const { cycleFinishedMessage } = require("./discord-api");

const config = require("./config.json");

function initState() {
  let state = {};

  if (fs.existsSync("./state.json")) {
    state = loadState();
  } else {
    let usersState = {};

    for (const user of config.users) {
      usersState[user.name] = {
        washer_durations: [], // In ms
        dryer_durations: [], // In ms
        reminder_active: true,
        // Saved as ms instead of minutes for consistency with other time values
        reminder_duration: moment
          .duration(config.default_reminder_duration, "minutes")
          .asMilliseconds(),
      };
    }

    state = {
      version: 1,
      washer: {
        started: null, // epoch ms when load started
        status: "empty",
        user: null,
        queue: [],
      },
      dryer: {
        started: null, // epoch ms when load started
        status: "empty",
        user: null,
      },
      users: usersState,
    };

    saveState(state);
  }

  return state;
}

function saveState(data) {
  const dataCopy = cloneDeep(data);
  if (Object.prototype.hasOwnProperty.call(dataCopy, "discord_client")) {
    delete dataCopy.discord_client;
  }

  fs.writeFile("./state.json", JSON.stringify(dataCopy), (err) => {
    if (err) {
      logError("Issue saving state.json:\n" + err);
      logInfo("Current state data:\n" + dataCopy);
    }
  });
}
function loadState() {
  const rawStateFileData = fs.readFileSync("./state.json");
  return JSON.parse(rawStateFileData);
}

function getState() {
  return state;
}

function getUserNameFromId(discordId) {
  const user = config.users.find((user) => user.discord_id === discordId);
  return user.name;
}

function getMachineUser(machine) {
  if (!["dryer", "washer"].includes(machine)) return undefined;
  return state[machine].user;
}

function getMachineStatus(machine) {
  if (!["dryer", "washer"].includes(machine)) return undefined;
  return state[machine].status;
}

function changeMachineStatus(machine, status) {
  if (!["dryer", "washer"].includes(machine)) return -1;
  if (!["empty", "running", "full"].includes(status)) return -2;

  // If the machine has finished its cycle
  if (
    state[machine].status === "running" &&
    status === "full" &&
    state[machine].user !== null
  ) {
    const userName = state[machine].user;
    const userId = config.users.find((user) => user.name === userName)
      .discord_id;
    cycleFinishedMessage(machine, userId, userName);
  }

  state[machine].status = status;
  if (status === "empty") {
    state[machine].user = null;
  }

  saveState(state);

  return 0;
}

function changeMachineUser(machine, userName) {
  if (!["dryer", "washer"].includes(machine)) return -1;
  if (config.users.find((user) => user.name === userName) === undefined)
    return -2;
  if (state[machine].status === "empty") return -3;

  state[machine].user = userName;
  saveState(state);

  return 0;
}

let state = initState();

module.exports = {
  getState,
  getUserNameFromId,
  getMachineUser,
  getMachineStatus,
  changeMachineStatus,
  changeMachineUser,
};
