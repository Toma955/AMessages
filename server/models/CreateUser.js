import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";


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
    const mediaFolder = path.join(userFolder, "media");

    if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
    if (!fs.existsSync(chatFolder)) fs.mkdirSync(chatFolder);
    if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder);

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

   
    const userlistDb = new Database(path.join(userFolder, "Userlist.db"));
    userlistDb.prepare(`
        CREATE TABLE IF NOT EXISTS userlist (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            unread_messages INTEGER DEFAULT 0,
            last_message_at TEXT
        );
    `).run();
    userlistDb.close();

   
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

  
    const usernamesDbPath = path.resolve(__dirname, "../database/data/usernames.db");
    const usernamesDb = new Database(usernamesDbPath);
    usernamesDb
        .prepare("INSERT INTO registered_usernames (id, username) VALUES (?, ?)")
        .run(userId, username);
    usernamesDb.close();

    return { userId };
}

export default CreateUser;
