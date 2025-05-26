const path = require("path");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const errors = require("../../constants/errors.json");
const success = require("../../constants/success.json");

const clientDbPath = path.resolve(__dirname, "../../database/data/client_info.db");
const authDbPath = path.resolve(__dirname, "../../database/data/auth.db");
const usernamesDbPath = path.resolve(__dirname, "../../database/data/usernames.db");

const handleCreateUser = (req, res) => {
    const {
        username,
        password,
        name,
        surname,
        gender,
        date_of_birth,
        theme = "light",
        language = "en"
    } = req.body;

    if (!username || !password || !name) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }

    const clientDb = new Database(clientDbPath);
    const exists = clientDb.prepare("SELECT 1 FROM clients WHERE username = ?").get(username);
    if (exists) {
        clientDb.close();
        return res.status(409).json({ success: false, error_code: errors.USERNAME_EXISTS });
    }

    const result = clientDb.prepare(`
        INSERT INTO clients (username, name, surname, gender, date_of_birth, theme, language)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(username, name, surname, gender, date_of_birth, theme, language);
    const userId = result.lastInsertRowid;
    clientDb.close();

    const authDb = new Database(authDbPath);
    const passwordHash = bcrypt.hashSync(password, 10);
    authDb.prepare("INSERT INTO credentials (username, password_hash, attempts) VALUES (?, ?, 0)")
        .run(username, passwordHash);
    authDb.close();

    const usernamesDb = new Database(usernamesDbPath);
    usernamesDb.prepare("INSERT INTO registered_usernames (username) VALUES (?)").run(username);
    usernamesDb.close();

    return res.status(201).json({
        success: true,
        message_code: success.USER_CREATED,
        userId
    });
};

module.exports = handleCreateUser;
