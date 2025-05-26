const express = require("express");
const { searchUsers } = require("../controllers/SearchController");

const router = express.Router();

router.get("/users/search", searchUsers);

module.exports = router;
