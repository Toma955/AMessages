const express = require("express");
const router = express.Router();

router.get("/groups", (req, res) => {
  res.send("Groups route active.");
});

module.exports = router;
