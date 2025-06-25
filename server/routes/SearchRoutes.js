const express = require("express");
const { searchUsers } = require("../controllers/SearchController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

const router = express.Router();

router.get("/users/search", jwtMiddleware, searchUsers);

module.exports = router;
