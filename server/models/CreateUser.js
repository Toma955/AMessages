const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

function CreateUser({
    username,
    password,
    name,
    surname,
    gender,
    date_of_birth,
    theme = "light",
    language = "en"
}) {
    const dbPath = path.resolve(__dirname, "../database/data/client_info.db");
    const db = new Database(dbPath);

    const existing = db.prepare("SELECT * FROM clients WHERE username = ?").get(username);
    if (existing) {
        db.close();
        throw new Error("Username already exists.");
    }

    const findNextAvailableId =
        db
            .prepare(
                `
    SELECT MIN(t1.id + 1) AS next_id
    FROM clients t1
    LEFT JOIN clients t2 ON t1.id + 1 = t2.id
    WHERE t2.id IS NULL
  `
            )
            .get()?.next_id || 1;

    const insert = db.prepare(`
    INSERT INTO clients (id, username, name, surname, gender, date_of_birth, theme, language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    insert.run(
        findNextAvailableId,
        username,
        name,
        surname,
        gender,
        date_of_birth,
        theme,
        language
    );
    const userId = findNextAvailableId;

    db.close();

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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    CREATE TABLE IF NOT EXISTS logins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL
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

    const authDbPath = path.resolve(__dirname, "../database/data/auth.db");
    const authDb = new Database(authDbPath);

    const passwordHash = bcrypt.hashSync(password, 10);

    authDb
        .prepare(
            `
    INSERT INTO credentials (username, password_hash, attempts)
    VALUES (?, ?, 0)
  `
        )
        .run(username, passwordHash);

    authDb.close();

    return { userId };
}

module.exports = CreateUser;
