import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Učitavanje JSON datoteka
const errors = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/errors.json"), 'utf8'));
const success = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/success.json"), 'utf8'));

const authDbPath = path.resolve(__dirname, "../../database/data/auth.db");
const clientDbPath = path.resolve(__dirname, "../../database/data/client_info.db");
const loginLogDbPath = path.resolve(__dirname, "../../database/data/login.db");

// Praćenje pokušaja prijave po IP adresi
const ipAttempts = new Map();

const handleLoginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip = req.ip;

        // Umjetno kašnjenje radi zaštite od brute-force i timming napada
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await delay(1000);

        if (!username || !password) {
            return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
        }

        // Admin credentials check
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            console.log('Admin login successful');
            ipAttempts.delete(ip); // Reset IP attempts for admin
            
            const adminToken = jwt.sign(
                { id: 'admin', username: ADMIN_USERNAME, role: 'admin', ip },
                process.env.JWT_SECRET || 'default-secret',
                { expiresIn: "24h" }
            );

            return res.status(200).json({
                success: true,
                message_code: success.LOGIN_SUCCESS,
                token: adminToken,
                userId: 'admin',
                isAdmin: true,
                redirectUrl: '/admin'
            });
        }

        // IP attempts check for regular users
        const currentAttempts = ipAttempts.get(ip) || 0;
        if (currentAttempts >= 3) {
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
        const token = jwt.sign(
            { id: userId, username, role: 'user', ip }, 
            process.env.JWT_SECRET || 'default-secret', 
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            message_code: success.LOGIN_SUCCESS,
            token,
            userId,
            redirectUrl: '/main'
        });

    } catch (error) {
        console.error("!!! Unhandled error in handleLoginUser:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default handleLoginUser;
export { ipAttempts };
