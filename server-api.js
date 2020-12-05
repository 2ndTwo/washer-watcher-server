const createError = require("http-errors");
const express = require("express");
let router = express.Router();

router.post("/:machine/:status", (req, res) => {
  if (req.params.machine !== "washer" && req.params.machine !== "dryer") {
    res.status(404).send(createError(404));
    return;
  }
});
router.use("/", (req, res) => {
  res.status(404).send(createError(404));
});

module.exports = router;
