import express from 'express';
import AdminController from '../controllers/AdminController.js';
import { adminMiddleware, verifyAdminToken } from '../middlewares/adminMiddleware.js';
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/login', adminMiddleware, AdminController.login);

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

export default router; 