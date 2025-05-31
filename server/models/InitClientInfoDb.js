const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Definira putanju do direktorija baze podataka
const dataDir = path.resolve(__dirname, "../database/data");
const dbPath = path.join(dataDir, "client_info.db");

// Kreira direktorij ako ne postoji
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(" Created /database/data directory");
}

// Otvara konekciju prema bazi podataka
const db = new Database(dbPath);

// Kreira tablicu 'clients' ako već ne postoji
db.prepare(
    `
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT,
    surname TEXT,
    gender TEXT CHECK (gender IN ('male', 'female')),
    date_of_birth TEXT,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`
).run();

db.close();
console.log(" client_info.db initialized with clients table");
