const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");// SQLite wrapper za sinkronizirani rad s bazom podataka
const bcrypt = require("bcryptjs");// hash enkripciju lozinki


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

    // Provjerava postoji li korisničko ime već
    const existing = db.prepare("SELECT * FROM clients WHERE username = ?").get(username);
    if (existing) {
        db.close();
        throw new Error("Username already exists.");
    }

    // Traži sljedeći slobodan ID koji nije zauzet u tablici clients
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

    // Unosi osnovne korisničke podatke u centralnu tablicu
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

    // Kreira strukturu direktorija za korisničke podatke
    const userFolder = path.resolve(__dirname, `../database/users/${userId}`);
    const chatFolder = path.join(userFolder, "chat");

    if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
    if (!fs.existsSync(chatFolder)) fs.mkdirSync(chatFolder);

    // Kreira korisničku bazu podataka: info.db
    const infoDb = new Database(path.join(userFolder, "info.db"));
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

    // Kreira login evidenciju: login.db
    const loginDb = new Database(path.join(userFolder, "login.db"));
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

    // Kreira grupnu evidenciju: groups.db
    const groupsDb = new Database(path.join(userFolder, "groups.db"));
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

    // Spremanje korisničkih akreditiva u auth.db
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

    // Spremanje korisničkog imena u usernames.db
    const usernamesDbPath = path.resolve(__dirname, "../database/data/usernames.db");
    const usernamesDb = new Database(usernamesDbPath);
    usernamesDb
        .prepare("INSERT INTO registered_usernames (id, username) VALUES (?, ?)")
        .run(userId, username);
    usernamesDb.close();

    return { userId };
}

module.exports = CreateUser;
