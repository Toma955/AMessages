const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const errors = require("../constants/errors.json");
const success = require("../constants/success.json");

const clientDbPath = path.resolve(__dirname, "../database/data/client_info.db");
const authDbPath = path.resolve(__dirname, "../database/data/auth.db");
const usernamesDbPath = path.resolve(__dirname, "../database/data/usernames.db");
const loginDbPath = path.resolve(__dirname, "../database/data/login.db");

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
    const exists = clientDb.prepare("SELECT * FROM clients WHERE username = ?").get(username);
    if (exists) {
        clientDb.close();
        return res.status(409).json({ success: false, error_code: errors.USERNAME_EXISTS });
    }

    const result = clientDb
        .prepare(
            `INSERT INTO clients (username, name, surname, gender, date_of_birth, theme, language)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(username, name, surname, gender, date_of_birth, theme, language);
    const userId = result.lastInsertRowid;
    clientDb.close();

    const authDb = new Database(authDbPath);
    const passwordHash = bcrypt.hashSync(password, 10);
    authDb
        .prepare("INSERT INTO credentials (username, password_hash, attempts) VALUES (?, ?, 0)")
        .run(username, passwordHash);
    authDb.close();

    const usernamesDb = new Database(usernamesDbPath);
    usernamesDb.prepare("INSERT INTO registered_usernames (username) VALUES (?)").run(username);
    usernamesDb.close();

    const userFolder = path.resolve(__dirname, `../database/users/${userId}`);
    const chatFolder = path.join(userFolder, "chat");
    if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
    if (!fs.existsSync(chatFolder)) fs.mkdirSync(chatFolder);

    const infoDb = new Database(path.join(userFolder, "info.db"));
    const loginDb = new Database(path.join(userFolder, "login.db"));
    const groupsDb = new Database(path.join(userFolder, "groups.db"));

    infoDb
        .prepare(
            `
    CREATE TABLE IF NOT EXISTS info (
      theme TEXT DEFAULT 'light',
      language TEXT DEFAULT 'en',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `
        )
        .run();
    infoDb.close();

    loginDb
        .prepare(
            `
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login_time TEXT NOT NULL,
      logout_time TEXT,
      status TEXT NOT NULL CHECK (status IN ('active', 'closed'))
    );
  `
        )
        .run();
    loginDb.close();

    groupsDb
        .prepare(
            `
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `
        )
        .run();
    groupsDb.close();

    res.status(201).json({ success: true, message_code: success.USER_CREATED, userId });
};

const handleUpdateUser = (req, res) => {
    const userId = req.params.id;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }

    const clientDb = new Database(clientDbPath);
    const user = clientDb.prepare("SELECT * FROM clients WHERE id = ?").get(userId);
    if (!user) {
        clientDb.close();
        return res.status(404).json({ success: false, error_code: errors.USER_NOT_FOUND });
    }

    clientDb.prepare("UPDATE clients SET name = ? WHERE id = ?").run(name, userId);
    clientDb.close();

    res.status(200).json({ success: true, message_code: success.USER_UPDATED });
};

const handleDeleteUser = (req, res) => {
    const userId = req.params.id;

    try {
        const clientDb = new Database(clientDbPath);
        const authDb = new Database(authDbPath);
        const usernamesDb = new Database(usernamesDbPath);
        const loginDb = new Database(loginDbPath);

        const user = clientDb.prepare("SELECT username FROM clients WHERE id = ?").get(userId);
        if (!user) {
            clientDb.close();
            authDb.close();
            usernamesDb.close();
            loginDb.close();
            return res.status(404).json({ success: false, error_code: errors.USER_NOT_FOUND });
        }

        const username = user.username;

        
        clientDb.prepare("DELETE FROM clients WHERE id = ?").run(userId);
        try {
            clientDb.prepare("DELETE FROM sqlite_sequence WHERE name = 'clients'").run();
        } catch {}
        clientDb.close();

       
        authDb.prepare("DELETE FROM credentials WHERE username = ?").run(username);
        try {
            authDb.prepare("DELETE FROM sqlite_sequence WHERE name = 'credentials'").run();
        } catch {}
        authDb.close();

       
        usernamesDb.prepare("DELETE FROM registered_usernames WHERE username = ?").run(username);
        try {
            usernamesDb.prepare("DELETE FROM registered_usernames WHERE id = ?").run(userId);
        } catch {}
        try {
            usernamesDb.prepare("DELETE FROM sqlite_sequence WHERE name = 'registered_usernames'").run();
        } catch {}
        usernamesDb.close();

        try {
            loginDb.prepare("DELETE FROM sessions WHERE username = ?").run(username);
            loginDb.prepare("DELETE FROM sqlite_sequence WHERE name = 'sessions'").run();
        } catch {}
        loginDb.close();

        const userFolder = path.resolve(__dirname, "../database/users", userId.toString());
        if (fs.existsSync(userFolder)) {
            fs.rmSync(userFolder, { recursive: true, force: true });
        }

        return res.status(200).json({ success: true, message_code: success.USER_DELETED });
    } catch (err) {
        console.error("Greška u handleDeleteUser:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleGetUser = (req, res) => {
    const userId = req.params.id;
    const clientDb = new Database(clientDbPath);
    const user = clientDb.prepare("SELECT * FROM clients WHERE id = ?").get(userId);
    clientDb.close();

    if (!user) {
        return res.status(404).json({ success: false, error_code: errors.USER_NOT_FOUND });
    }

    res.status(200).json({ success: true, data: user });
};

module.exports = {
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleGetUser
};
