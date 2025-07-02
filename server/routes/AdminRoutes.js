import express from 'express';
import AdminController from '../controllers/AdminController.js';
import { adminMiddleware, verifyAdminToken } from '../middlewares/adminMiddleware.js';
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import os from 'os';

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

router.get('/system/resources', verifyAdminToken, async (req, res) => {
    const memoryUsage = process.memoryUsage();
    const ram = (memoryUsage.rss / 1024 / 1024).toFixed(2); // MB

    // CPU usage: izračunaj postotak CPU zauzeća procesa u zadnjoj sekundi
    const startUsage = process.cpuUsage();
    const startTime = process.hrtime();
    // Pričekaj 100ms za uzorak
    await new Promise(resolve => setTimeout(resolve, 100));
    const elapUsage = process.cpuUsage(startUsage);
    const elapTime = process.hrtime(startTime);
    const elapTimeMS = elapTime[0] * 1000 + elapTime[1] / 1e6;
    // CPU % = 100 * (user + system) / (elapsed time * 1000 * broj jezgri)
    const numCPUs = os.cpus().length;
    const cpuPercent = ((elapUsage.user + elapUsage.system) / 1000 / elapTimeMS / numCPUs * 100).toFixed(2);

    res.json({
        success: true,
        ram: Number(ram),
        cpu: Number(cpuPercent)
    });
});

export default router; 