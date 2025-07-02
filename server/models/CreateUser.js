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
    // Pretvori datum iz "DD.MM.YYYY" u "YYYY-MM-DD"
    function formatDate(dateStr) {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split(".");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    const formattedDate = formatDate(date_of_birth);
    console.log("[CreateUser] Start", { username, name, surname, gender, date_of_birth, formattedDate, theme, language });
    const dbPath = path.resolve(__dirname, "../database/data/client_info.db");
    let db;
    try {
        db = new Database(dbPath);
    } catch (err) {
        console.error("[CreateUser] Error opening client_info.db:", err);
        throw err;
    }

   
    const existing = db.prepare("SELECT * FROM clients WHERE username = ?").get(username);
    if (existing) {
        db.close();
        console.log("[CreateUser] Username already exists:", username);
        throw new Error("Username already exists.");
    }

 
    let findNextAvailableId;
    try {
        findNextAvailableId =
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
        console.log("[CreateUser] Next available userId:", findNextAvailableId);
    } catch (err) {
        db.close();
        console.error("[CreateUser] Error finding next available userId:", err);
        throw err;
    }

    
    try {
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
            formattedDate,
            theme,
            language
        );
        console.log("[CreateUser] Inserted into clients:", username);
    } catch (err) {
        db.close();
        console.error("[CreateUser] Error inserting into clients:", err, { username, name, surname, gender, date_of_birth, theme, language });
        throw err;
    }
    const userId = findNextAvailableId;

    db.close();

  
    const userFolder = path.resolve(__dirname, `../database/users/${userId}`);
    const chatFolder = path.join(userFolder, "chat");
    const mediaFolder = path.join(userFolder, "media");

    try {
        if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
        if (!fs.existsSync(chatFolder)) fs.mkdirSync(chatFolder);
        if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder);
        console.log("[CreateUser] Created user folders for:", userId);
    } catch (err) {
        console.error("[CreateUser] Error creating user folders:", err);
        throw err;
    }

    try {
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
        console.log("[CreateUser] Created info.db for:", userId);
    } catch (err) {
        console.error("[CreateUser] Error creating info.db:", err);
        throw err;
    }

   
    const userlistDb = new Database(path.join(userFolder, "Userlist.db"));
    try {
        userlistDb.prepare(`
        CREATE TABLE IF NOT EXISTS userlist (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            unread_messages INTEGER DEFAULT 0,
            last_message_at TEXT
        );
    `).run();
        userlistDb.close();
        console.log("[CreateUser] Created Userlist.db for:", userId);
    } catch (err) {
        console.error("[CreateUser] Error creating Userlist.db:", err);
        throw err;
    }

   
    const loginDb = new Database(path.join(userFolder, "login.db"));
    try {
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
        console.log("[CreateUser] Created login.db for:", userId);
    } catch (err) {
        console.error("[CreateUser] Error creating login.db:", err);
        throw err;
    }

   
    const groupsDb = new Database(path.join(userFolder, "groups.db"));
    try {
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
        console.log("[CreateUser] Created groups.db for:", userId);
    } catch (err) {
        console.error("[CreateUser] Error creating groups.db:", err);
        throw err;
    }

    
    const authDbPath = path.resolve(__dirname, "../database/data/auth.db");
    let authDb;
    try {
        authDb = new Database(authDbPath);
    } catch (err) {
        console.error("[CreateUser] Error opening auth.db:", err);
        throw err;
    }

    let passwordHash;
    try {
        passwordHash = bcrypt.hashSync(password, 10);
        console.log("[CreateUser] Password hashed for:", username);
    } catch (err) {
        authDb.close();
        console.error("[CreateUser] Error hashing password:", err);
        throw err;
    }

    try {
        authDb
            .prepare(
                `
    INSERT INTO credentials (username, password_hash, attempts)
    VALUES (?, ?, 0)
  `
            )
            .run(username, passwordHash);
        authDb.close();
        console.log("[CreateUser] Inserted into credentials for:", username);
    } catch (err) {
        authDb.close();
        console.error("[CreateUser] Error inserting into credentials:", err);
        throw err;
    }

  
    const usernamesDbPath = path.resolve(__dirname, "../database/data/usernames.db");
    let usernamesDb;
    try {
        usernamesDb = new Database(usernamesDbPath);
    } catch (err) {
        console.error("[CreateUser] Error opening usernames.db:", err);
        throw err;
    }
    try {
        usernamesDb
            .prepare("INSERT INTO registered_usernames (id, username) VALUES (?, ?)")
            .run(userId, username);
        usernamesDb.close();
        console.log("[CreateUser] Inserted into registered_usernames for:", username);
    } catch (err) {
        usernamesDb.close();
        console.error("[CreateUser] Error inserting into registered_usernames:", err);
        throw err;
    }

    return { userId };
}

export default CreateUser;
