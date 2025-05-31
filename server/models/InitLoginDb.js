const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Definira putanje do mape s podacima i datoteke baze
const dataDir = path.resolve(__dirname, "../database/data");
const loginDbPath = path.join(dataDir, "login.db");

// Kreira direktorij ako ne postoji
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(" Created /database/data directory");
}

// Otvara ili kreira login.db bazu
const db = new Database(loginDbPath);

// Kreira tablicu sessions ako ne postoji
db.prepare(
    `
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        login_time TEXT NOT NULL,
        logout_time TEXT,
        status TEXT NOT NULL CHECK (status IN ('active', 'closed'))
    );
    `
).run();

db.close();
console.log("login.db initialized with sessions table");
