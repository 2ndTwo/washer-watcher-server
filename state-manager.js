const fs = require("fs");
const moment = require("moment");

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
          .milliseconds(),
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
  if (Object.prototype.hasOwnProperty.call(data, "discord_client")) {
    delete data.discord_client;
  }

  fs.writeFile("./state.json", JSON.stringify(data), (err) => {
    if (err) {
      logError("Issue saving state.json:\n" + err);
      logInfo("Current state data:\n" + data);
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

function addDiscordClient(client) {
  state.discord_client = client;
}
function getDiscordClient() {
  return state.discord_client;
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
    cycleFinishedMessage(getDiscordClient(), machine, userId, userName);
  }

  state[machine].status = status;
  saveState(state);

  return 0;
}

function changeMachineUser(machine, userName) {
  if (!["dryer", "washer"].includes(machine)) return -1;
  if (config.users.find((user) => user.name === userName) === undefined)
    return -2;

  state[machine].user = userName;
  saveState(state);

  return 0;
}

let state = initState();

module.exports = {
  getState,
  addDiscordClient,
  getDiscordClient,
  changeMachineStatus,
  changeMachineUser,
};
