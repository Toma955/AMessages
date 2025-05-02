const express = require("express");
const router = express.Router();

router.get("/messages", (req, res) => {
  res.send("Messages route active.");
});

module.exports = router;
