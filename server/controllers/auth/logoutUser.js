import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Učitavanje JSON datoteka
const errors = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/errors.json"), 'utf8'));
const success = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/success.json"), 'utf8'));

const loginLogDbPath = path.resolve(__dirname, "../../database/data/login.db");

const handleLogoutUser = (req, res) => {
    // Koristi userId iz JWT tokena (req.user.id) umjesto iz bodyja
    const userId = req.user && req.user.id;
    const ip = req.ip;
    console.log('Logout attempt:', { userId, ip });

    if (!userId) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }

    const loginDb = new Database(loginLogDbPath);

    // Dohvaća se najnovija aktivna sesija za korisnika (bez obzira na IP adresu)
    const activeSession = loginDb
        .prepare(
            `
        SELECT id, user_id, username, ip_address, login_time, logout_time, status FROM sessions
        WHERE user_id = ? AND status = 'active'
        ORDER BY login_time DESC
        LIMIT 1
    `
        )
        .get(userId);
    console.log('Found active session:', activeSession);

    if (!activeSession) {
        loginDb.close();
        console.log('No active session found for logout.');
        return res.status(404).json({ success: false, error_code: errors.SESSION_NOT_FOUND });
    }

    const updateResult = loginDb
        .prepare(
            `
        UPDATE sessions
        SET logout_time = datetime('now'), status = 'closed'
        WHERE id = ?
    `
        )
        .run(activeSession.id);
    console.log('Logout update result:', updateResult);

    loginDb.close();

    return res.status(200).json({ success: true, message_code: success.LOGOUT_SUCCESS });
};

export default handleLogoutUser;
