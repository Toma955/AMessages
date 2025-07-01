import jwt from 'jsonwebtoken';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const adminMiddleware = (req, res, next) => {
    try {
        // Get credentials from request (could be from body, headers, or query)
        const { username, password } = req.body;
        
        // Check if credentials match admin credentials
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Create admin token
            const adminToken = jwt.sign(
                { 
                    id: 'admin', 
                    username: ADMIN_USERNAME, 
                    role: 'admin',
                    ip: req.ip 
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h' }
            );
            
            req.adminToken = adminToken;
            req.isAdmin = true;
            next();
        } else {
            return res.status(401).json({
                success: false,
                error_code: 'INVALID_ADMIN_CREDENTIALS',
                message: 'Invalid admin credentials'
            });
        }
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            error_code: 'ADMIN_MIDDLEWARE_ERROR',
            message: 'Admin authentication failed'
        });
    }
};


const verifyAdminToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error_code: 'NO_ADMIN_TOKEN',
                message: 'Admin token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error_code: 'NOT_ADMIN',
                message: 'Admin access required'
            });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.error('Admin token verification error:', error);
        return res.status(401).json({
            success: false,
            error_code: 'INVALID_ADMIN_TOKEN',
            message: 'Invalid admin token'
        });
    }
};

// Middleware to check if user should be redirected to admin page
const checkAdminRedirect = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
            
            if (decoded.role === 'admin') {
                // Admin user - redirect to admin page
                return res.json({
                    success: true,
                    redirectUrl: '/admin',
                    isAdmin: true
                });
            }
        }
        
        // Non-admin user - continue to main page
        next();
    } catch (error) {
        console.error('Admin redirect check error:', error);
        next();
    }
};

export { adminMiddleware, verifyAdminToken, checkAdminRedirect }; 