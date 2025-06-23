const { adminMiddleware, verifyAdminToken } = require('../middlewares/adminMiddleware');

class AdminController {
    // Admin login
    static async login(req, res) {
        try {
            // adminMiddleware will handle the authentication
            // If we reach here, authentication was successful
            res.json({
                success: true,
                message: 'Admin login successful',
                token: req.adminToken,
                admin: {
                    username: req.body.username,
                    role: 'admin'
                }
            });
        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                error_code: 'ADMIN_LOGIN_ERROR',
                message: 'Admin login failed'
            });
        }
    }

    // Get admin dashboard stats
    static async getDashboardStats(req, res) {
        try {
            // This will be protected by verifyAdminToken middleware
            const stats = {
                totalUsers: 0, // TODO: Get from database
                activeUsers: 0, // TODO: Get from database
                totalMessages: 0, // TODO: Get from database
                systemStatus: 'healthy',
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                timestamp: new Date().toISOString()
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                error_code: 'DASHBOARD_STATS_ERROR',
                message: 'Failed to get dashboard stats'
            });
        }
    }

    // Get all users (admin only)
    static async getAllUsers(req, res) {
        try {
            // TODO: Implement getting all users from database
            const users = []; // Placeholder
            
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                error_code: 'GET_USERS_ERROR',
                message: 'Failed to get users'
            });
        }
    }

    // Delete user (admin only)
    static async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            
            // TODO: Implement user deletion from database
            
            res.json({
                success: true,
                message: `User ${userId} deleted successfully`
            });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                error_code: 'DELETE_USER_ERROR',
                message: 'Failed to delete user'
            });
        }
    }

    // Reset IP attempts (admin only)
    static async resetIpAttempts(req, res) {
        try {
            // Import the ipAttempts map from loginUser
            const loginUser = require('./auth/loginUser');
            
            if (loginUser.ipAttempts) {
                loginUser.ipAttempts.clear();
            }
            
            res.json({
                success: true,
                message: 'IP attempts reset successfully'
            });
        } catch (error) {
            console.error('Reset IP attempts error:', error);
            res.status(500).json({
                success: false,
                error_code: 'RESET_IP_ATTEMPTS_ERROR',
                message: 'Failed to reset IP attempts'
            });
        }
    }

    // Get system logs
    static async getSystemLogs(req, res) {
        try {
            // TODO: Implement getting system logs
            const logs = []; // Placeholder
            
            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Get system logs error:', error);
            res.status(500).json({
                success: false,
                error_code: 'GET_LOGS_ERROR',
                message: 'Failed to get system logs'
            });
        }
    }
}

module.exports = AdminController; 