  const path = require("path");
const Database = require("better-sqlite3");
const errors = require("../../constants/errors.json");
const success = require("../../constants/success.json");

const loginLogDbPath = path.resolve(__dirname, "../../database/data/login.db");

const handleLogoutUser = (req, res) => {
    const { userId } = req.body;
    const ip = req.ip;

    if (!userId) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }

    const loginDb = new Database(loginLogDbPath);

    const activeSession = loginDb.prepare(`
        SELECT id FROM sessions
        WHERE user_id = ? AND ip_address = ? AND status = 'active'
        ORDER BY login_time DESC
        LIMIT 1
    `).get(userId, ip);

    if (!activeSession) {
        loginDb.close();
        return res.status(404).json({ success: false, error_code: errors.SESSION_NOT_FOUND });
    }

    loginDb.prepare(`
        UPDATE sessions
        SET logout_time = datetime('now'), status = 'closed'
        WHERE id = ?
    `).run(activeSession.id);

    loginDb.close();

    return res.status(200).json({ success: true, message_code: success.LOGOUT_SUCCESS });
};

module.exports = handleLogoutUser;
