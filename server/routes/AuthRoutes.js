const express = require("express");

// Uvoz funkcija za prijavu i odjavu korisnika
const { handleLoginUser, handleLogoutUser } = require("../controllers/AuthController");
const { checkAdminRedirect } = require("../middlewares/adminMiddleware");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

const router = express.Router();

// Ruta za prijavu korisnika
router.post("/login", handleLoginUser);

// Ruta za odjavu korisnika
router.post("/logout", jwtMiddleware, handleLogoutUser);

// Route to check user status and get redirect URL
router.get("/check-user", checkAdminRedirect, (req, res) => {
    // If not admin, return main page redirect
    res.json({
        success: true,
        redirectUrl: '/main',
        isAdmin: false
    });
});

module.exports = router;
