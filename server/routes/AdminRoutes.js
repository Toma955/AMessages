const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { adminMiddleware, verifyAdminToken } = require('../middlewares/adminMiddleware');
const fs = require("fs");
const path = require("path");

// Admin login (uses adminMiddleware for authentication)
router.post('/login', adminMiddleware, AdminController.login);

// Protected admin routes (require admin token)
router.get('/dashboard/stats', verifyAdminToken, AdminController.getDashboardStats);
router.get('/users', verifyAdminToken, AdminController.getAllUsers);
router.delete('/users/:userId', verifyAdminToken, AdminController.deleteUser);
router.get('/logs', verifyAdminToken, AdminController.getSystemLogs);
router.post('/reset-ip-attempts', verifyAdminToken, AdminController.resetIpAttempts);

router.get("/logs/startup", (req, res) => {
    const logPath = path.resolve(__dirname, "../log/startup.log");
    fs.readFile(logPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Log file not found." });
        }
        res.json({ success: true, log: data });
    });
});

module.exports = router; 