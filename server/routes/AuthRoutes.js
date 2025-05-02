const express = require("express");
const { handleLoginUser, handleLogoutUser } = require("../controllers/AuthController");


const router = express.Router();

router.post("/login", handleLoginUser);
router.post("/logout", handleLogoutUser);

module.exports = router;
