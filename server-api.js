const createError = require("http-errors");
const express = require("express");

const config = require("./config.json");
const state = require("./state-manager");

let router = express.Router();

router.post("/:machine/:action", (req, res) => {
  const machine = req.params.machine;
  const action = req.params.action;
  const user = req.body.user; // May be undefined

  if (!["washer", "dryer"].includes(machine)) {
    res
      .status(406)
      .send(
        createError(
          406,
          `Invalid machine (${machine}), must be either 'washer' or 'dryer'`
        )
      );
    return;
  }
  if (!["user", "start", "stop", "empty"].includes(action)) {
    res
      .status(406)
      .send(
        createError(
          406,
          `Invalid ${machine} command, must be one of 'user', 'start', 'stop', or 'empty'`
        )
      );
    return;
  }

  let stateResult;

  switch (action) {
    case "user":
      if (user === undefined) {
        res
          .status(406)
          .send(
            createError(
              406,
              `User POST param 'user' is required for this action (${action}).`
            )
          );
        return;
      }
      stateResult = state.changeMachineUser(machine, user);
      if (stateResult === -2) {
        res
          .status(406)
          .send(
            createError(
              406,
              `The user param variable (${user}) is not an existing user. You may need to ask the server manager for the correct name.`
            )
          );
        return;
      }
      break;

    case "start":
      if (user !== undefined) {
        if (
          config.users.find((configUser) => configUser.name === user) ===
          undefined
        ) {
          res
            .status(406)
            .send(
              createError(
                406,
                `The user param variable (${user}) is not an existing user. You may need to ask the server manager for the correct name.`
              )
            );
          return;
        } else {
          state.changeMachineStatus(machine, "running");
          stateResult = state.changeMachineUser(machine, user);
        }
      } else {
        state.changeMachineStatus(machine, "running");
      }
      break;

    case "stop":
      state.changeMachineStatus(machine, "full");
      break;

    case "empty":
      state.changeMachineStatus(machine, "empty");
      break;
  }

  res.status(200).send();
});
router.use("/", (req, res) => {
  res.status(404).send(createError(404));
});

module.exports = router;
