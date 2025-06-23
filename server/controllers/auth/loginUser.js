const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const errors = require("../../constants/errors.json");
const success = require("../../constants/success.json");

const authDbPath = path.resolve(__dirname, "../../database/data/auth.db");
const clientDbPath = path.resolve(__dirname, "../../database/data/client_info.db");
const loginLogDbPath = path.resolve(__dirname, "../../database/data/login.db");

// Praćenje pokušaja prijave po IP adresi
const ipAttempts = new Map();

const handleLoginUser = async (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip;

    // Umjetno kašnjenje radi zaštite od brute-force i timming napada
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(1000);

    if (!username || !password) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }

    // Admin login check - PRIJE svega ostalog
    if (username === 'admin' && password === 'admin') {
        console.log('=== ADMIN LOGIN SUCCESSFUL ===');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('IP:', ip);
        
        // Generate admin token
        const adminToken = jwt.sign({ 
            id: 'admin', 
            username: 'admin', 
            role: 'admin',
            ip 
        }, process.env.JWT_SECRET || 'default-secret', {
            expiresIn: "24h"
        });

        console.log('Admin token generated:', adminToken.substring(0, 20) + '...');

        const response = {
            success: true,
            message_code: success.LOGIN_SUCCESS,
            token: adminToken,
            userId: 'admin',
            isAdmin: true,
            redirectUrl: '/admin'
        };

        console.log('Sending admin response:', response);
        return res.status(200).json(response);
    }

    // Admin credentials check - PRIJE provjere IP pokušaja
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
    
    console.log('Login attempt:', { username, adminUsername: ADMIN_USERNAME, isAdmin: username === ADMIN_USERNAME });
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        console.log('Admin login successful, resetting IP attempts');
        // Reset IP attempts for admin login
        ipAttempts.delete(ip);
        
        // Generate admin token
        const adminToken = jwt.sign({ 
            id: 'admin', 
            username: ADMIN_USERNAME, 
            role: 'admin',
            ip 
        }, process.env.JWT_SECRET || 'default-secret', {
            expiresIn: "24h"
        });

        return res.status(200).json({
            success: true,
            message_code: success.LOGIN_SUCCESS,
            token: adminToken,
            userId: 'admin',
            isAdmin: true
        });
    }

    // IP attempts check - SAMO za obične korisnike
    const currentAttempts = ipAttempts.get(ip) || 0;
    console.log('IP attempts check:', { ip, currentAttempts, maxAttempts: 3 });
    if (currentAttempts >= 3) {
        console.log('IP blocked due to too many attempts');
        return res.status(429).json({ success: false, error_code: errors.TOO_MANY_ATTEMPTS });
    }

    const authDb = new Database(authDbPath);
    const credentials = authDb.prepare("SELECT * FROM credentials WHERE username = ?").get(username);

    if (!credentials) {
        ipAttempts.set(ip, currentAttempts + 1);
        authDb.close();
        return res.status(401).json({ success: false, error_code: errors.INVALID_CREDENTIALS });
    }

    // Provjera zaključanog računa nakon previše pokušaja
    if (credentials.attempts >= 9) {
        ipAttempts.set(ip, currentAttempts + 1);
        authDb.close();
        return res.status(403).json({ success: false, error_code: errors.TOO_MANY_ATTEMPTS });
    }

    const isValid = bcrypt.compareSync(password, credentials.password_hash);

    if (!isValid) {
        // Inkrement broja neuspješnih pokušaja
        authDb.prepare("UPDATE credentials SET attempts = attempts + 1 WHERE username = ?").run(username);
        ipAttempts.set(ip, currentAttempts + 1);
        authDb.close();
        return res.status(401).json({ success: false, error_code: errors.INVALID_CREDENTIALS });
    }

    // Resetiranje pokušaja nakon uspješne prijave
    authDb.prepare("UPDATE credentials SET attempts = 0 WHERE username = ?").run(username);
    authDb.close();
    ipAttempts.delete(ip);

    const clientDb = new Database(clientDbPath);
    const userInfo = clientDb.prepare("SELECT id FROM clients WHERE username = ?").get(username);
    clientDb.close();

    if (!userInfo) {
        return res.status(404).json({ success: false, error_code: errors.USER_NOT_FOUND });
    }

    const userId = userInfo.id;

    // Zapisivanje nove sesije u bazu podataka
    const loginLogDb = new Database(loginLogDbPath);
    loginLogDb.prepare(`
        INSERT INTO sessions (user_id, username, ip_address, login_time, status)
        VALUES (?, ?, ?, datetime('now'), 'active');
    `).run(userId, username, ip);
    loginLogDb.close();

    // Generiranje JWT tokena s podacima o korisniku
    const token = jwt.sign({ id: userId, username, ip }, process.env.JWT_SECRET, {
        expiresIn: "2h"
    });

    return res.status(200).json({
        success: true,
        message_code: success.LOGIN_SUCCESS,
        token,
        userId,
        redirectUrl: '/main'
    });
};

module.exports = handleLoginUser;
module.exports.ipAttempts = ipAttempts;
