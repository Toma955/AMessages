const express = require("express");

// Uvoz funkcija za prijavu i odjavu korisnika
const { handleLoginUser, handleLogoutUser } = require("../controllers/AuthController");

const router = express.Router();

// Ruta za prijavu korisnika
router.post("/login", handleLoginUser);

// Ruta za odjavu korisnika
router.post("/logout", handleLogoutUser);

module.exports = router;
