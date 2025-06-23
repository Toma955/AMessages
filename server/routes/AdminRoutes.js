const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { adminMiddleware, verifyAdminToken } = require('../middlewares/adminMiddleware');

// Admin login (uses adminMiddleware for authentication)
router.post('/login', adminMiddleware, AdminController.login);

// Protected admin routes (require admin token)
router.get('/dashboard/stats', verifyAdminToken, AdminController.getDashboardStats);
router.get('/users', verifyAdminToken, AdminController.getAllUsers);
router.delete('/users/:userId', verifyAdminToken, AdminController.deleteUser);
router.get('/logs', verifyAdminToken, AdminController.getSystemLogs);
router.post('/reset-ip-attempts', verifyAdminToken, AdminController.resetIpAttempts);

module.exports = router; 