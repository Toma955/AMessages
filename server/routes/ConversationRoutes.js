const express = require("express");
const router = express.Router();

router.get("/conversations", (req, res) => {
  res.send("Conversations route active.");
});

module.exports = router;
