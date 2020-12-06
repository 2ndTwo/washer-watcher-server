const fs = require("fs");
const moment = require("moment");
const { cloneDeep } = require("lodash");

const { logInfo, logError } = require("./utilities");
const discord = require("./discord-api");

const config = require("./config.json");

function initState() {
  let state = {};

  if (fs.existsSync("./state.json")) {
    state = loadState();
  } else {
    let usersState = {};

    for (const user of config.users) {
      usersState[user.name] = {
        washer: {
          durations: [], // In ms
        },
        dryer: {
          durations: [], // In ms
        },
        reminder: {
          enabled: true,
          reminder_duration: moment
            .duration(config.default_reminder_duration, "minutes")
            .asMilliseconds(),
          // Saved as ms instead of minutes for consistency with other time values
          active: false,
          last_sent: null, // In ms
          number_sent: 0,
          timeout: null,
        },
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
  let dataCopy = cloneDeep(data);
  if (Object.prototype.hasOwnProperty.call(dataCopy, "discord_client")) {
    delete dataCopy.discord_client;
  }

  for (const userName of Object.keys(dataCopy.users)) {
    dataCopy.users[userName].reminder.timeout = null;
  }

  if (!savingState) {
    savingState = true;

    fs.writeFile("./state.json", JSON.stringify(dataCopy), (err) => {
      savingState = false;

      if (err) {
        logError("Issue saving state.json:\n" + err);
        logInfo("Current state data:\n" + dataCopy);
      }

      if (waitingToSave) {
        waitingToSave = false;
        saveState(state);
      }
    });
  } else {
    waitingToSave = true;
  }
}
function loadState() {
  const rawStateFileData = fs.readFileSync("./state.json");
  return JSON.parse(rawStateFileData);
}

function getState() {
  return state;
}

function resumeReminders() {
  for (const userName in state.users) {
    const userData = state.users[userName];
    const reminder = userData.reminder;

    if (!reminder.enabled || !reminder.active || reminder.number_sent >= 3)
      continue;

    if (state.washer.user !== userName && state.dryer.user !== userName)
      continue;

    scheduleReminder(userName);
  }
}

function scheduleReminder(userName) {
  const reminder = state.users[userName].reminder;

  if (reminder.number_sent === null || reminder.number_sent < 3) {
    if (reminder.number_sent === null) {
      state.users[userName].reminder.number_sent = 0;
    }

    let nextReminderTime;
    if (reminder.last_sent === null) {
      nextReminderTime = reminder.reminder_duration;
      state.users[userName].reminder.last_sent = new Date().getTime();
    } else {
      nextReminderTime =
        reminder.reminder_duration -
        (new Date().getTime() - reminder.last_sent);
    }

    state.users[userName].reminder.active = true;

    state.users[userName].reminder.timeout = setTimeout(() => {
      const reminder = state.users[userName].reminder;

      if (
        !reminder.enabled ||
        !reminder.active ||
        (state.washer.user !== userName && state.dryer.user !== userName) ||
        (state.washer.status !== "full" && state.dryer.status !== "full")
      ) {
        cancelReminder(userName);
        return;
      }

      state.users[userName].reminder.number_sent++;
      saveState(state);

      let fullMachines = [];
      if (state.washer.user === userName && state.washer.status === "full") {
        fullMachines.push("washer");
      }
      if (state.dryer.user === userName && state.dryer.status === "full") {
        fullMachines.push("dryer");
      }

      const userDiscordId = config.users.find((user) => user.name === userName)
        .discord_id;
      discord.reminderMessage(fullMachines, userDiscordId, userName);

      state.users[userName].reminder.last_sent = new Date().getTime();
      scheduleReminder(userName);
    }, nextReminderTime);

    saveState(state);
  } else {
    cancelReminder(userName);
  }
}

function cancelReminder(userName) {
  const timeout = state.users[userName].reminder.timeout;
  if (timeout !== null) clearTimeout(timeout);

  state.users[userName].reminder.active = false;
  state.users[userName].reminder.last_sent = null;
  state.users[userName].reminder.number_sent = null;
  state.users[userName].reminder.timeout = null;

  saveState(state);
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

  // If the machine has started its cycle
  if (state[machine].status !== "running" && status === "running") {
    state[machine].started = new Date().getTime();
  }

  // If the machine has finished its cycle
  if (state[machine].status === "running" && status !== "running") {
    if (state[machine].user !== null) {
      const endTime = new Date().getTime();
      const userName = state[machine].user;
      const userId = config.users.find((user) => user.name === userName)
        .discord_id;

      discord.cycleFinishedMessage(machine, userId, userName);

      if (!state.users[userName].reminder.active) {
        scheduleReminder(userName);
      }

      const startTime = state[machine].started;
      state.users[userName][machine].durations.push(endTime - startTime);
    }

    state[machine].started = null;
  }

  if (status === "empty") {
    const userName = state[machine].user;

    if (userName !== null) {
      state[machine].user = null;

      const otherMachine = machine === "washer" ? "dryer" : "washer";
      if (
        state[otherMachine].status !== "full" ||
        state[otherMachine].user !== userName
      ) {
        cancelReminder(userName);
      }
    }
  }

  state[machine].status = status;

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

let savingState = false;
let waitingToSave = false;
let state = initState();

module.exports = {
  getState,
  resumeReminders,
  getUserNameFromId,
  getMachineUser,
  getMachineStatus,
  changeMachineStatus,
  changeMachineUser,
};
